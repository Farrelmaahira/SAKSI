package handlers_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
)

func TestHandleListCounterparties_DesaOnly(t *testing.T) {
	uid := int64(2)
	m := &contractMockStore{counterparties: []domain.Counterparty{{ID: 1, UserID: &uid, Nama: "CV Maju Bersama", Jenis: "penyedia", Email: "penyedia@saksi.id"}}}
	d := &handlers.Deps{Store: m, Secret: monSecret}
	mux := http.NewServeMux()
	mux.Handle("GET /api/v1/counterparties", handlers.RequireAuth(monSecret)(handlers.HandleListCounterparties(d)))
	v1 := int64(1)

	if w := do(mux, "GET", "/api/v1/counterparties", "", ""); w.Code != http.StatusUnauthorized {
		t.Errorf("anonim harus 401, dapat %d", w.Code)
	}
	for _, role := range []domain.UserRole{domain.RolePenyedia, domain.RoleWarga, domain.RoleBPD} {
		if w := do(mux, "GET", "/api/v1/counterparties", tok(t, 9, role, nil), ""); w.Code != http.StatusForbidden {
			t.Errorf("role %s harus 403, dapat %d", role, w.Code)
		}
	}
	w := do(mux, "GET", "/api/v1/counterparties?search=Maju", tok(t, 1, domain.RoleKades, &v1), "")
	var got []domain.Counterparty
	if w.Code != http.StatusOK || json.Unmarshal(w.Body.Bytes(), &got) != nil || len(got) != 1 || got[0].Email != "penyedia@saksi.id" {
		t.Fatalf("kades harus 200 dengan email akun: %d %s", w.Code, w.Body.String())
	}
}
