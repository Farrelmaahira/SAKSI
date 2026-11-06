package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type contractMockStore struct {
	usecase.Store
	counterparties   []domain.Counterparty
	contractCreated  *domain.ContractDetail
	lastParams       usecase.CreateContractParams
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
		Store:  ms,
		Secret: "test-secret-min-32-bytes-long-key-123",
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
		Tenggat:         "2026-12-31",
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
		Tenggat:         "2026-12-31",
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
