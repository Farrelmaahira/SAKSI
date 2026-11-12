package handlers_test

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type sendMockStore struct {
	contractMockStore
	err   error
	calls []usecase.SendContractParams
}

func (m *sendMockStore) SendContract(_ context.Context, p usecase.SendContractParams) (int64, error) {
	m.calls = append(m.calls, p)
	return 1, m.err
}

func (m *sendMockStore) ContractDraftState(_ context.Context, _ int64) (domain.ContractDraftState, error) {
	return domain.ContractDraftState{Jenis: domain.JenisPengadaan, VillageID: 1}, nil
}

func sendReq(t *testing.T, ms *sendMockStore, body string) *httptest.ResponseRecorder {
	t.Helper()
	const secret = "secret-send-contract-tests-min-32-bytes"
	deps := &handlers.Deps{Store: ms, Cache: newMemCache(), Secret: secret}
	mux := http.NewServeMux()
	mux.Handle("POST /api/v1/contracts/{id}/send", handlers.RequireAuth(secret)(handlers.HandleSendContract(deps)))
	village := int64(1)
	tok, _ := usecase.IssueToken(7, domain.RoleKades, &village, secret, time.Hour)
	var rdr io.Reader
	if body != "" {
		rdr = strings.NewReader(body)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/contracts/42/send", rdr)
	req.Header.Set("Authorization", "Bearer "+tok)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	return w
}

// Gerbang kirim opsi (b): konfirmasi diteruskan, pasal wajib dihitung dari template, 409 membawa daftar temuan + sumber.
func TestHandleSendContract_Gate(t *testing.T) {
	kode := "P-07"
	llm := &domain.CriticalFindingsError{DapatDikonfirmasi: true,
		Findings: []domain.AuditFinding{{KodePasal: &kode, Tingkat: "kritis", Pesan: "kurang rinci", Sumber: domain.SumberLLM}}}
	aturan := &domain.CriticalFindingsError{Findings: []domain.AuditFinding{{KodePasal: &kode, Tingkat: "kritis", Pesan: "Pasal wajib P-07 belum ada di draf.", Sumber: domain.SumberAturan}}}

	ms := &sendMockStore{}
	if w := sendReq(t, ms, ""); w.Code != http.StatusOK {
		t.Fatalf("tanpa body harus lolos: %d %s", w.Code, w.Body)
	}
	p := ms.calls[0]
	// Template fixture (clause_library jenis pengadaan) hanya mewajibkan P-07.
	if p.KonfirmasiTemuanKritis || len(p.MandatoryKodePasal) != 1 || p.MandatoryKodePasal[0] != "P-07" {
		t.Fatalf("tanpa body: konfirmasi harus false dan pasal wajib diambil dari template: %+v", p)
	}
	ms = &sendMockStore{}
	sendReq(t, ms, `{"konfirmasiTemuanKritis": true}`)
	if len(ms.calls) != 1 || !ms.calls[0].KonfirmasiTemuanKritis {
		t.Fatalf("konfirmasi tidak diteruskan ke store: %+v", ms.calls)
	}
	if w := sendReq(t, &sendMockStore{}, `{bukan json`); w.Code != http.StatusBadRequest {
		t.Fatalf("body rusak harus 400, dapat %d", w.Code)
	}

	for _, tc := range []struct {
		name      string
		err       error
		confirmed bool
		sumber    string
	}{{"kritis llm", llm, true, "llm"}, {"pasal wajib hilang", aturan, false, "aturan"}} {
		w := sendReq(t, &sendMockStore{err: tc.err}, "")
		var body struct {
			Code              string                `json:"code"`
			DapatDikonfirmasi bool                  `json:"dapatDikonfirmasi"`
			Findings          []domain.AuditFinding `json:"findings"`
		}
		if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil || w.Code != http.StatusConflict || body.Code != "CRITICAL_FINDINGS" ||
			body.DapatDikonfirmasi != tc.confirmed || len(body.Findings) != 1 || body.Findings[0].Sumber != tc.sumber {
			t.Fatalf("%s: respons 409 salah: %d %s", tc.name, w.Code, w.Body)
		}
	}
}

func TestHandleSendContract(t *testing.T) {
	const secret = "secret-send-contract-tests-min-32-bytes"
	cases := []struct {
		name     string
		role     domain.UserRole
		path     string
		storeErr error
		wantCode int
		wantErr  string // kode error di body; kosong = sukses
		wantCall bool
	}{
		{"kades mengirim", domain.RoleKades, "/api/v1/contracts/42/send", nil, http.StatusOK, "", true},
		{"perangkat desa mengirim", domain.RolePerangkatDesa, "/api/v1/contracts/42/send", nil, http.StatusOK, "", true},
		{"penyedia ditolak", domain.RolePenyedia, "/api/v1/contracts/42/send", nil, http.StatusForbidden, "FORBIDDEN", false},
		{"bpd ditolak", domain.RoleBPD, "/api/v1/contracts/42/send", nil, http.StatusForbidden, "FORBIDDEN", false},
		{"id tidak valid", domain.RoleKades, "/api/v1/contracts/abc/send", nil, http.StatusBadRequest, "INVALID_INPUT", false},
		{"desa lain / tidak ada", domain.RoleKades, "/api/v1/contracts/42/send", domain.ErrNotFound, http.StatusNotFound, "NOT_FOUND", true},
		{"sudah dikirim", domain.RoleKades, "/api/v1/contracts/42/send", fmt.Errorf("%w: kontrak sudah dikirim ke pihak kedua", domain.ErrInvalidState), http.StatusConflict, "INVALID_STATE", true},
		{"terkunci", domain.RoleKades, "/api/v1/contracts/42/send", domain.ErrContractNotEditable, http.StatusConflict, "CONTRACT_LOCKED", true},
		{"temuan kritis", domain.RoleKades, "/api/v1/contracts/42/send", domain.ErrCriticalFindings, http.StatusConflict, "CRITICAL_FINDINGS", true},
	}
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			ms := &sendMockStore{err: tt.storeErr}
			cache := newMemCache()
			_ = cache.Set(context.Background(), usecase.KeyMetrics(7), []byte("{}"), time.Minute)
			deps := &handlers.Deps{Store: ms, Cache: cache, Secret: secret}
			mux := http.NewServeMux()
			mux.Handle("POST /api/v1/contracts/{id}/send", handlers.RequireAuth(secret)(handlers.HandleSendContract(deps)))

			village := int64(1)
			tok, _ := usecase.IssueToken(7, tt.role, &village, secret, time.Hour)
			req := httptest.NewRequest(http.MethodPost, tt.path, nil)
			req.Header.Set("Authorization", "Bearer "+tok)
			w := httptest.NewRecorder()
			mux.ServeHTTP(w, req)

			if w.Code != tt.wantCode {
				t.Fatalf("status = %d, mau %d (body %s)", w.Code, tt.wantCode, w.Body)
			}
			if (len(ms.calls) > 0) != tt.wantCall {
				t.Fatalf("store dipanggil = %v, mau %v", len(ms.calls) > 0, tt.wantCall)
			}
			var body map[string]any
			_ = json.Unmarshal(w.Body.Bytes(), &body)
			if tt.wantErr != "" {
				if body["code"] != tt.wantErr {
					t.Fatalf("code = %v, mau %s (body %s)", body["code"], tt.wantErr, w.Body)
				}
				return
			}
			if body["id"] != float64(42) || body["status"] != string(domain.StatusInReview) {
				t.Fatalf("respons sukses salah: %s", w.Body)
			}
			if p := ms.calls[0]; p.ContractID != 42 || p.Scope.UserID != 7 || p.Scope.Role != tt.role || p.Scope.VillageID == nil || *p.Scope.VillageID != 1 {
				t.Fatalf("parameter ke store salah: %+v", p)
			}
			if _, ok, _ := cache.Get(context.Background(), usecase.KeyMetrics(7)); ok {
				t.Fatal("cache metrik harus dihapus setelah kirim")
			}
		})
	}
}
