package handlers_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
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
