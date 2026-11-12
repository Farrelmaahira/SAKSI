package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type contractMockStore struct {
	usecase.Store
	counterparties  []domain.Counterparty
	contractCreated *domain.ContractDetail
	lastParams      usecase.CreateContractParams
}

func (m *contractMockStore) ListCounterparties(ctx context.Context, jenis *string, search string) ([]domain.Counterparty, error) {
	return m.counterparties, nil
}

func (m *contractMockStore) CounterpartyByID(ctx context.Context, id int64) (domain.Counterparty, error) {
	for _, cp := range m.counterparties {
		if cp.ID == id {
			return cp, nil
		}
	}
	return domain.Counterparty{}, domain.ErrNotFound
}

func (m *contractMockStore) UserByID(ctx context.Context, id int64) (domain.User, error) {
	vID := int64(1)
	return domain.User{
		ID:          id,
		Name:        "Kepala Desa Sukamaju",
		Role:        domain.RoleKades,
		VillageID:   &vID,
		VillageName: "Desa Sukamaju",
	}, nil
}

func (m *contractMockStore) CreateContractWithDetails(ctx context.Context, p usecase.CreateContractParams) (domain.ContractDetail, error) {
	m.lastParams = p
	detail := domain.ContractDetail{
		ID:             99,
		VillageID:      &p.VillageID,
		CounterpartyID: &p.CounterpartyID,
		Jenis:          p.Jenis,
		Judul:          p.Judul,
		Nilai:          p.Nilai,
		Tenggat:        p.Tenggat,
		Status:         "diaudit",
		NomorVersi:     1,
		TeksKontrak:    p.IsiTeks,
		JawabanForm:    p.JawabanForm,
		IntegrityScore: p.IntegrityScore,
		SHA256Hash:     p.SHA256Hash,
		CreatedBy:      p.CreatedBy,
		CreatedAt:      time.Now(),
	}
	m.contractCreated = &detail
	return detail, nil
}

func (m *contractMockStore) RegionIDByVillage(ctx context.Context, villageID int64) (int64, error) {
	return 7, nil
}

func (m *contractMockStore) DraftingOptions(ctx context.Context, regionID int64) (domain.DraftingOptions, error) {
	return draftingOpts(), nil
}

func newContractTestDeps() (*contractMockStore, *handlers.Deps) {
	cpID := int64(10)
	ms := &contractMockStore{
		counterparties: []domain.Counterparty{
			{
				ID:     cpID,
				Nama:   "PT Maju Bersama",
				Jenis:  "penyedia",
				NPWP:   "01.234.567.8-000.000",
				Alamat: "Jl. Industri No. 1",
			},
		},
	}
	deps := &handlers.Deps{
		Store:    ms,
		AIEngine: &fakeAI{},
		Secret:   "test-secret-min-32-bytes-long-key-123",
	}
	return ms, deps
}

func TestHandleContractOptions(t *testing.T) {
	_, deps := newContractTestDeps()

	req := httptest.NewRequest(http.MethodGet, "/api/v1/contracts/options", nil)
	w := httptest.NewRecorder()

	handlers.HandleGetContractOptions(deps)(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var res handlers.ContractOptionsResponse
	if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding options: %v", err)
	}
	if len(res.JenisKontrak) < 4 {
		t.Fatalf("expected at least 4 contract types, got %d", len(res.JenisKontrak))
	}
}

func TestHandleWizardQuestions(t *testing.T) {
	_, deps := newContractTestDeps()

	payload := handlers.WizardQuestionsRequest{
		Jenis:          "pengadaan",
		CounterpartyID: 10,
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/wizard/questions", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handlers.HandleWizardQuestions(deps)(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var res handlers.WizardQuestionsResponse
	if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding questions: %v", err)
	}
	if len(res.Questions) == 0 {
		t.Fatalf("expected non-empty questions")
	}
}

func TestHandleWizardPreview(t *testing.T) {
	_, deps := newContractTestDeps()

	vID := int64(1)
	token, _ := usecase.IssueToken(1, domain.RoleKades, &vID, deps.Secret, time.Hour)

	payload := handlers.WizardPreviewRequest{
		CounterpartyID:  10,
		Jenis:           "pengadaan",
		Judul:           "Pembangunan Jembatan",
		Nilai:           50000000,
		Tenggat:         time.Now().AddDate(0, 3, 0).Format("2006-01-02"),
		SkemaPembayaran: "termin",
		MetodePemilihan: "pengadaan_langsung",
		JawabanForm: map[string]any{
			"lingkup_pekerjaan": "Jembatan beton 10 meter",
		},
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/wizard/preview", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()

	handlers.RequireAuth(deps.Secret)(handlers.HandleWizardPreview(deps)).ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var res domain.ContractDraftPreview
	if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding preview: %v", err)
	}
	if res.IntegrityScore <= 0 || res.TeksDraf == "" {
		t.Fatalf("invalid preview result: %+v", res)
	}
}

func TestHandleCreateContract_Authorization_And_Creation(t *testing.T) {
	store, deps := newContractTestDeps()

	vID := int64(1)
	kadesToken, _ := usecase.IssueToken(1, domain.RoleKades, &vID, deps.Secret, time.Hour)
	wargaToken, _ := usecase.IssueToken(2, domain.RoleWarga, &vID, deps.Secret, time.Hour)

	payload := handlers.CreateContractPayload{
		CounterpartyID:  10,
		Jenis:           "pengadaan",
		Judul:           "Pembangunan Posyandu",
		Nilai:           80000000,
		Tenggat:         time.Now().AddDate(0, 3, 0).Format("2006-01-02"),
		SkemaPembayaran: "termin",
		MetodePemilihan: "pengadaan_langsung",
		JawabanForm: map[string]any{
			"lingkup_pekerjaan": "Posyandu 6x8m",
		},
	}
	body, _ := json.Marshal(payload)

	t.Run("Reject_Non_Kades", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/contracts", bytes.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		handlers.RequireAuth(deps.Secret)(handlers.HandleCreateContractWizard(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected 403 Forbidden for non-kades, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("Success_Kades", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/contracts", bytes.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+kadesToken)
		w := httptest.NewRecorder()

		handlers.RequireAuth(deps.Secret)(handlers.HandleCreateContractWizard(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 Created for kades, got %d: %s", w.Code, w.Body.String())
		}

		if store.contractCreated == nil || store.contractCreated.ID != 99 {
			t.Fatalf("expected store contractCreated to be populated: %+v", store.contractCreated)
		}
		if store.lastParams.VillageID != 1 || store.lastParams.CounterpartyID != 10 {
			t.Fatalf("unexpected lastParams: %+v", store.lastParams)
		}
	})
}

// Preview dan buat kontrak memakai aturan input yang sama: nilai, judul, tenggat, dan ukuran jawaban.
func TestWizardInputValidation(t *testing.T) {
	_, deps := newContractTestDeps()
	vID := int64(1)
	token, _ := usecase.IssueToken(1, domain.RoleKades, &vID, deps.Secret, time.Hour)
	future := time.Now().AddDate(0, 3, 0).Format("2006-01-02")
	past := time.Now().AddDate(0, 0, -2).Format("2006-01-02")
	big := map[string]any{"lingkup_pekerjaan": strings.Repeat("x", 20<<10)}

	cases := []struct {
		name    string
		judul   string
		nilai   float64
		tenggat string
		jawaban map[string]any
		wantOK  bool
	}{
		{"valid", "Pembangunan Jembatan", 5e7, future, nil, true},
		{"tenggat kosong memakai default", "Pembangunan Jembatan", 5e7, "", nil, true},
		{"tenggat hari ini diterima", "Pembangunan Jembatan", 5e7, time.Now().In(time.FixedZone("WIB", 7*3600)).Format("2006-01-02"), nil, true},
		{"nilai nol", "Pembangunan Jembatan", 0, future, nil, false},
		{"nilai negatif", "Pembangunan Jembatan", -5, future, nil, false},
		{"judul kosong", "", 5e7, future, nil, false},
		{"judul terlalu pendek", "ab", 5e7, future, nil, false},
		{"judul lebih dari 255", strings.Repeat("j", 256), 5e7, future, nil, false},
		{"tenggat lampau", "Pembangunan Jembatan", 5e7, past, nil, false},
		{"tenggat salah format", "Pembangunan Jembatan", 5e7, "31/12/2026", nil, false},
		{"jawaban 20 KB", "Pembangunan Jembatan", 5e7, future, big, false},
	}
	for _, c := range cases {
		if c.jawaban == nil {
			c.jawaban = map[string]any{"lingkup_pekerjaan": "Jembatan beton 10 meter"}
		}
		prev, _ := json.Marshal(handlers.WizardPreviewRequest{CounterpartyID: 10, Jenis: "pengadaan", Judul: c.judul, Nilai: c.nilai, Tenggat: c.tenggat, JawabanForm: c.jawaban})
		create, _ := json.Marshal(handlers.CreateContractPayload{CounterpartyID: 10, Jenis: "pengadaan", Judul: c.judul, Nilai: c.nilai, Tenggat: c.tenggat, JawabanForm: c.jawaban, Sumber: "manual"})
		for name, h := range map[string]http.Handler{
			"preview": handlers.RequireAuth(deps.Secret)(handlers.HandleWizardPreview(deps)),
			"create":  handlers.RequireAuth(deps.Secret)(handlers.HandleCreateContractWizard(deps)),
		} {
			body := prev
			if name == "create" {
				body = create
			}
			req := httptest.NewRequest(http.MethodPost, "/x", bytes.NewReader(body))
			req.Header.Set("Authorization", "Bearer "+token)
			w := httptest.NewRecorder()
			h.ServeHTTP(w, req)
			if c.wantOK && w.Code >= 400 {
				t.Errorf("%s/%s: harus diterima, dapat %d %s", name, c.name, w.Code, w.Body)
			}
			if !c.wantOK && w.Code != http.StatusBadRequest {
				t.Errorf("%s/%s: harus 400, dapat %d", name, c.name, w.Code)
			}
		}
	}
}
