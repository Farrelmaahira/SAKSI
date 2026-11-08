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

type lifecycleMockStore struct {
	usecase.Store
	contractID     int64
	version        domain.ContractVersion
	review         domain.ContractReview
	signature      domain.Signature
	seal           *domain.DocumentSeal
	signedCount    int
	lastRevise    usecase.ReviseContractParams
	lastReview    usecase.SubmitReviewParams
	lastSign      usecase.SignContractParams
}

func (m *lifecycleMockStore) ReviseContract(ctx context.Context, p usecase.ReviseContractParams) (domain.ContractVersion, error) {
	m.lastRevise = p
	m.version = domain.ContractVersion{
		ID:          2,
		ContractID:  p.ContractID,
		NomorVersi:  2,
		JawabanForm: p.JawabanForm,
		Isi:         "Isi teks revisi kontrak v2",
		Sumber:      "manual",
		DibuatOleh:  p.KadesUserID,
		CreatedAt:   time.Now(),
	}
	return m.version, nil
}

func (m *lifecycleMockStore) SubmitContractReview(ctx context.Context, p usecase.SubmitReviewParams) (domain.ContractReview, error) {
	m.lastReview = p
	m.review = domain.ContractReview{
		ID:        10,
		VersionID: 2,
		PartyID:   20,
		ClauseID:  p.ClauseID,
		Komentar:  p.Komentar,
		Status:    p.Status,
		Waktu:     time.Now(),
	}
	return m.review, nil
}

func (m *lifecycleMockStore) SignContract(ctx context.Context, p usecase.SignContractParams) (domain.Signature, *domain.DocumentSeal, error) {
	m.lastSign = p
	m.signedCount++

	sig := domain.Signature{
		ID:           int64(m.signedCount),
		VersionID:    2,
		PartyID:      int64(100 + m.signedCount),
		SignerUserID: p.UserID,
		Metode:       p.Metode,
		Referensi:    p.StorageKey,
		Waktu:        time.Now(),
	}

	var seal *domain.DocumentSeal
	if m.signedCount >= 2 {
		seal = &domain.DocumentSeal{
			ID:         1,
			VersionID:  2,
			FileID:     50,
			SHA256:     "abcd1234ef567890abcd1234ef567890abcd1234ef567890abcd1234ef567890",
			WaktuSegel: time.Now(),
			Chain:      "saksi-ledger-simulated",
			TxHash:     "tx_12345",
		}
		m.seal = seal
	}

	return sig, seal, nil
}

func (m *lifecycleMockStore) GetContractLifecycleDetail(ctx context.Context, contractID int64, callerUserID int64, callerRole domain.UserRole, callerVillageID *int64) (domain.ContractLifecycleDetail, error) {
	vID := int64(1)
	return domain.ContractLifecycleDetail{
		Contract: domain.ContractDetail{
			ID:          contractID,
			VillageID:   &vID,
			VillageName: "Desa Sukamaju",
			Judul:       "Pembangunan Jalan",
			Nilai:       100000000,
			Status:      "peninjauan",
		},
		Version: domain.ContractVersion{
			ID:         2,
			ContractID: contractID,
			NomorVersi: 2,
			Isi:        "Isi v2",
		},
		Versions: []domain.ContractVersion{
			{ID: 1, ContractID: contractID, NomorVersi: 1, Isi: "Isi v1"},
			{ID: 2, ContractID: contractID, NomorVersi: 2, Isi: "Isi v2"},
		},
		Reviews:    []domain.ContractReview{m.review},
		Signatures: []domain.Signature{m.signature},
		Seal:       m.seal,
	}, nil
}

func newLifecycleTestDeps() (*lifecycleMockStore, *handlers.Deps) {
	ms := &lifecycleMockStore{
		contractID: 42,
	}
	deps := &handlers.Deps{
		Store:  ms,
		Secret: "secret-key-for-lifecycle-unit-testing-min32bytes",
	}
	return ms, deps
}

func TestHandleReviseContract_RoleValidationAndSuccess(t *testing.T) {
	store, deps := newLifecycleTestDeps()

	vID := int64(1)
	kadesToken, _ := usecase.IssueToken(10, domain.RoleKades, &vID, deps.Secret, time.Hour)
	wargaToken, _ := usecase.IssueToken(20, domain.RoleWarga, &vID, deps.Secret, time.Hour)

	payload := handlers.ReviseContractPayload{
		JawabanForm: map[string]any{
			"lingkup_pekerjaan": "Revisi perbaikan saluran drainase",
		},
	}
	body, _ := json.Marshal(payload)

	mux := http.NewServeMux()
	mux.Handle("PUT /api/v1/contracts/{id}", handlers.RequireAuth(deps.Secret)(handlers.HandleReviseContract(deps)))

	// 1. Coba dengan role Warga -> harus 403 Forbidden
	reqWarga := httptest.NewRequest(http.MethodPut, "/api/v1/contracts/42", bytes.NewReader(body))
	reqWarga.Header.Set("Authorization", "Bearer "+wargaToken)
	wWarga := httptest.NewRecorder()
	mux.ServeHTTP(wWarga, reqWarga)
	if wWarga.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for warga, got %d", wWarga.Code)
	}

	// 2. Coba dengan role Kades -> harus 200 OK
	reqKades := httptest.NewRequest(http.MethodPut, "/api/v1/contracts/42", bytes.NewReader(body))
	reqKades.Header.Set("Authorization", "Bearer "+kadesToken)
	wKades := httptest.NewRecorder()
	mux.ServeHTTP(wKades, reqKades)
	if wKades.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for kades, got %d: %s", wKades.Code, wKades.Body.String())
	}

	var res domain.ContractVersion
	if err := json.NewDecoder(wKades.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding response: %v", err)
	}
	if res.NomorVersi != 2 || res.ContractID != 42 {
		t.Fatalf("unexpected version response: %+v", res)
	}
	if store.lastRevise.KadesUserID != 10 {
		t.Fatalf("expected KadesUserID 10, got %d", store.lastRevise.KadesUserID)
	}
}

func TestHandleSubmitContractReview_RoleValidationAndSuccess(t *testing.T) {
	store, deps := newLifecycleTestDeps()

	vID := int64(1)
	kadesToken, _ := usecase.IssueToken(10, domain.RoleKades, &vID, deps.Secret, time.Hour)
	vendorToken, _ := usecase.IssueToken(30, domain.RolePenyedia, nil, deps.Secret, time.Hour)

	payload := handlers.SubmitContractReviewPayload{
		Komentar: "Pasal termin pembayaran disetujui",
		Status:   "setuju",
	}
	body, _ := json.Marshal(payload)

	mux := http.NewServeMux()
	mux.Handle("POST /api/v1/contracts/{id}/reviews", handlers.RequireAuth(deps.Secret)(handlers.HandleSubmitContractReview(deps)))

	// 1. Kades mencoba review -> 403 Forbidden (hanya penyedia yang me-review)
	reqKades := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/42/reviews", bytes.NewReader(body))
	reqKades.Header.Set("Authorization", "Bearer "+kadesToken)
	wKades := httptest.NewRecorder()
	mux.ServeHTTP(wKades, reqKades)
	if wKades.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for kades, got %d", wKades.Code)
	}

	// 2. Penyedia me-review -> 201 Created
	reqVendor := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/42/reviews", bytes.NewReader(body))
	reqVendor.Header.Set("Authorization", "Bearer "+vendorToken)
	wVendor := httptest.NewRecorder()
	mux.ServeHTTP(wVendor, reqVendor)
	if wVendor.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created for vendor, got %d: %s", wVendor.Code, wVendor.Body.String())
	}

	var res domain.ContractReview
	if err := json.NewDecoder(wVendor.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding review response: %v", err)
	}
	if res.Status != "setuju" {
		t.Fatalf("expected status 'setuju', got %s", res.Status)
	}
	if store.lastReview.VendorUserID != 30 {
		t.Fatalf("expected VendorUserID 30, got %d", store.lastReview.VendorUserID)
	}
}

func TestHandleSignContract_BilateralAndAutoSeal(t *testing.T) {
	_, deps := newLifecycleTestDeps()

	vID := int64(1)
	kadesToken, _ := usecase.IssueToken(10, domain.RoleKades, &vID, deps.Secret, time.Hour)
	vendorToken, _ := usecase.IssueToken(30, domain.RolePenyedia, nil, deps.Secret, time.Hour)

	mux := http.NewServeMux()
	mux.Handle("POST /api/v1/contracts/{id}/sign", handlers.RequireAuth(deps.Secret)(handlers.HandleSignContract(deps)))

	// 1. Tanda tangan pihak pertama (Kades)
	jsonBody, _ := json.Marshal(handlers.SignContractJSONPayload{
		Metode:    "simulasi",
		Referensi: "sig_kades_mock",
	})
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/42/sign", bytes.NewReader(jsonBody))
	req1.Header.Set("Authorization", "Bearer "+kadesToken)
	w1 := httptest.NewRecorder()
	mux.ServeHTTP(w1, req1)
	if w1.Code != http.StatusCreated {
		t.Fatalf("expected 201 for kades sign, got %d: %s", w1.Code, w1.Body.String())
	}

	var res1 handlers.SignContractResponse
	_ = json.NewDecoder(w1.Body).Decode(&res1)
	if res1.IsSealed {
		t.Fatalf("expected contract NOT to be sealed after only 1 signature")
	}

	// 2. Tanda tangan pihak kedua (Penyedia)
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/42/sign", bytes.NewReader(jsonBody))
	req2.Header.Set("Authorization", "Bearer "+vendorToken)
	w2 := httptest.NewRecorder()
	mux.ServeHTTP(w2, req2)
	if w2.Code != http.StatusCreated {
		t.Fatalf("expected 201 for vendor sign, got %d: %s", w2.Code, w2.Body.String())
	}

	var res2 handlers.SignContractResponse
	_ = json.NewDecoder(w2.Body).Decode(&res2)
	if !res2.IsSealed || res2.Seal == nil {
		t.Fatalf("expected contract to be AUTO-SEALED after both parties sign! res2: %+v", res2)
	}
	if res2.Seal.Chain != "saksi-ledger-simulated" {
		t.Fatalf("unexpected seal chain: %s", res2.Seal.Chain)
	}
}

func TestHandleGetContractLifecycle_Success(t *testing.T) {
	_, deps := newLifecycleTestDeps()

	vID := int64(1)
	kadesToken, _ := usecase.IssueToken(10, domain.RoleKades, &vID, deps.Secret, time.Hour)

	mux := http.NewServeMux()
	mux.Handle("GET /api/v1/contracts/{id}/lifecycle", handlers.RequireAuth(deps.Secret)(handlers.HandleGetContractLifecycle(deps)))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/contracts/42/lifecycle", nil)
	req.Header.Set("Authorization", "Bearer "+kadesToken)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var res domain.ContractLifecycleDetail
	if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
		t.Fatalf("failed decoding lifecycle: %v", err)
	}
	if res.Contract.ID != 42 || len(res.Versions) != 2 {
		t.Fatalf("unexpected lifecycle detail: %+v", res)
	}
}
