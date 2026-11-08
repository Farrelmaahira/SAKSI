package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
	"golang.org/x/crypto/bcrypt"
)

type mockStore struct {
	usecase.Store
	usersByEmail map[string]domain.User
	usersByID    map[int64]domain.User
	createUserFn func(ctx context.Context, p usecase.RegisterUserParams) (domain.User, error)
}

func (m *mockStore) CreateUserWithRole(ctx context.Context, p usecase.RegisterUserParams) (domain.User, error) {
	if m.createUserFn != nil {
		return m.createUserFn(ctx, p)
	}
	if _, exists := m.usersByEmail[p.Email]; exists {
		return domain.User{}, domain.ErrConflict
	}
	u := domain.User{
		ID:        int64(len(m.usersByID) + 1),
		Name:      p.Nama,
		Email:     p.Email,
		Role:      p.Role,
		VillageID: p.VillageID,
		Status:    "aktif",
	}
	m.usersByEmail[p.Email] = u
	m.usersByID[u.ID] = u
	return u, nil
}

func (m *mockStore) UserByEmail(ctx context.Context, email string) (domain.User, error) {
	u, ok := m.usersByEmail[email]
	if !ok {
		return domain.User{}, domain.ErrNotFound
	}
	return u, nil
}

func (m *mockStore) UserByID(ctx context.Context, id int64) (domain.User, error) {
	u, ok := m.usersByID[id]
	if !ok {
		return domain.User{}, domain.ErrNotFound
	}
	return u, nil
}

func newTestDeps() (*mockStore, *handlers.Deps) {
	ms := &mockStore{
		usersByEmail: make(map[string]domain.User),
		usersByID:    make(map[int64]domain.User),
	}
	deps := &handlers.Deps{
		Store:  ms,
		Secret: "test-secret-key-32-bytes-long-min",
	}
	return ms, deps
}

func TestHandleRegister_RoleRestrictions(t *testing.T) {
	_, deps := newTestDeps()

	forbiddenRoles := []string{
		string(domain.RoleBPD),
		string(domain.RoleInspektorat),
		string(domain.RoleAdminDaerah),
		"superadmin",
	}

	for _, role := range forbiddenRoles {
		t.Run("Reject_"+role, func(t *testing.T) {
			payload := handlers.RegisterRequest{
				Nama:     "Illegal User",
				Email:    "illegal@example.com",
				Password: "password123",
				Role:     role,
			}
			body, _ := json.Marshal(payload)
			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
			w := httptest.NewRecorder()

			handlers.HandleRegister(deps)(w, req)

			if w.Code != http.StatusBadRequest {
				t.Fatalf("expected 400 for role %s, got %d: %s", role, w.Code, w.Body.String())
			}
		})
	}
}

func TestHandleRegister_AllowedRoles(t *testing.T) {
	store, deps := newTestDeps()

	vID := int64(1)

	t.Run("Warga_Success", func(t *testing.T) {
		payload := handlers.RegisterRequest{
			Nama:      "Budi Santoso",
			Email:     "budi@warga.id",
			Password:  "securepassword",
			Role:      string(domain.RoleWarga),
			VillageID: &vID,
			NoHP:      "08123456789",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)

		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
		}
		var res handlers.SessionResponse
		if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
			t.Fatalf("failed decoding response: %v", err)
		}
		if res.Token == "" || res.Email != payload.Email {
			t.Fatalf("invalid session response: %+v", res)
		}
	})

	t.Run("Penyedia_Success_With_Company_Details", func(t *testing.T) {
		payload := handlers.RegisterRequest{
			Nama:        "Vendor User",
			Email:       "vendor@pt.com",
			Password:    "securepassword",
			Role:        string(domain.RolePenyedia),
			CompanyName: "PT Maju Konstruksi",
			CompanyType: "penyedia",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 for valid penyedia, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("Warga_Requires_VillageID_And_NoHP", func(t *testing.T) {
		// Missing villageId
		payload := handlers.RegisterRequest{
			Nama:     "Warga Tanpa Desa",
			Email:    "nodesa@warga.id",
			Password: "securepassword",
			Role:     string(domain.RoleWarga),
			NoHP:     "08123456789",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for warga without villageId, got %d", w.Code)
		}

		// Missing noHp
		payload.VillageID = &vID
		payload.NoHP = ""
		body, _ = json.Marshal(payload)
		req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w = httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for warga without noHp, got %d", w.Code)
		}
	})

	t.Run("Kades_RequiresVillageID", func(t *testing.T) {
		payload := handlers.RegisterRequest{
			Nama:     "Pak Kades",
			Email:    "kades@desa.id",
			Password: "securepassword",
			Role:     string(domain.RoleKades),
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for kades without village_id, got %d", w.Code)
		}

		kadesVillageID := int64(10)
		payload.VillageID = &kadesVillageID
		body, _ = json.Marshal(payload)
		req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w = httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected 201 for valid kades, got %d: %s", w.Code, w.Body.String())
		}
	})

	t.Run("Duplicate_Email_Conflict", func(t *testing.T) {
		payload := handlers.RegisterRequest{
			Nama:      "Duplicate Budi",
			Email:     "budi@warga.id", // Already registered
			Password:  "password123",
			Role:      string(domain.RoleWarga),
			VillageID: &vID,
			NoHP:      "089999999",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleRegister(deps)(w, req)
		if w.Code != http.StatusConflict {
			t.Fatalf("expected 409 conflict, got %d: %s", w.Code, w.Body.String())
		}
		_ = store
	})
}

func TestHandleLogin_And_Me(t *testing.T) {
	store, deps := newTestDeps()

	hash, _ := bcrypt.GenerateFromPassword([]byte("secret123"), bcrypt.DefaultCost)
	vID := int64(1)
	testUser := domain.User{
		ID:           101,
		Name:         "Siti Aminah",
		Email:        "siti@warga.id",
		PasswordHash: string(hash),
		Role:         domain.RoleWarga,
		VillageID:    &vID,
		Status:       "aktif",
	}
	store.usersByEmail[testUser.Email] = testUser
	store.usersByID[testUser.ID] = testUser

	t.Run("Invalid_Password", func(t *testing.T) {
		payload := handlers.LoginRequest{
			Email:    "siti@warga.id",
			Password: "wrongpassword",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleLogin(deps)(w, req)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", w.Code)
		}
	})

	t.Run("Successful_Login_And_Me", func(t *testing.T) {
		payload := handlers.LoginRequest{
			Email:    "siti@warga.id",
			Password: "secret123",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body))
		w := httptest.NewRecorder()

		handlers.HandleLogin(deps)(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		var res handlers.SessionResponse
		if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
			t.Fatalf("failed decoding login response: %v", err)
		}
		if res.Token == "" {
			t.Fatalf("empty token returned")
		}

		// Test HandleMe with token
		meReq := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		meReq.Header.Set("Authorization", "Bearer "+res.Token)
		meRec := httptest.NewRecorder()

		// Wrap with RequireAuth middleware
		handlers.RequireAuth(deps.Secret)(handlers.HandleMe(deps)).ServeHTTP(meRec, meReq)

		if meRec.Code != http.StatusOK {
			t.Fatalf("expected 200 on /me, got %d: %s", meRec.Code, meRec.Body.String())
		}
		var meRes handlers.MeResponse
		if err := json.NewDecoder(meRec.Body).Decode(&meRes); err != nil {
			t.Fatalf("failed decoding me response: %v", err)
		}
		if meRes.UserID != 101 || meRes.Email != "siti@warga.id" {
			t.Fatalf("unexpected user in me response: %+v", meRes)
		}
	})
}
