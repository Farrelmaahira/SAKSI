package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// DTO untuk modul autentikasi

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Nama        string `json:"nama"`
	Name        string `json:"name"` // alias fallback
	Email       string `json:"email"`
	Password    string `json:"password"`
	Role        string `json:"role"` // "kades"|"perangkat_desa", "penyedia", "warga"
	VillageID   *int64 `json:"villageId,omitempty"`
	NoHP        string `json:"noHp,omitempty"`        // khusus warga
	CompanyName string `json:"companyName,omitempty"` // khusus penyedia
	CompanyType string `json:"companyType,omitempty"` // khusus penyedia ("penyedia"|"umkm")
	NPWP        string `json:"npwp,omitempty"`
	Address     string `json:"address,omitempty"`
	Alamat      string `json:"alamat,omitempty"` // alias
}

func (r *RegisterRequest) GetName() string {
	if r.Nama != "" {
		return r.Nama
	}
	return r.Name
}

func (r *RegisterRequest) GetAddress() string {
	if r.Alamat != "" {
		return r.Alamat
	}
	return r.Address
}

type SessionResponse struct {
	Token       string `json:"token"`
	UserID      int64  `json:"userId"`
	Role        string `json:"role"`
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	VillageID   *int64 `json:"villageId,omitempty"`
	VillageName string `json:"villageName,omitempty"`
	Status      string `json:"status"`
}

type MeResponse struct {
	UserID      int64         `json:"userId"`
	Role        string        `json:"role"`
	Nama        string        `json:"nama"`
	Email       string        `json:"email"`
	VillageID   *int64        `json:"villageId,omitempty"`
	VillageName string        `json:"villageName,omitempty"`
	Status      string        `json:"status"`
	NoHP        string        `json:"noHp,omitempty"`  // warga
	Usaha       *UsahaProfile `json:"usaha,omitempty"` // penyedia
}

// Handlers untuk modul autentikasi

func HandleRegister(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		email := strings.ToLower(strings.TrimSpace(req.Email))
		if !usecase.ValidEmail(email) {
			WriteError(w, http.StatusBadRequest, "invalid email format")
			return
		}

		rawRole := strings.ToLower(strings.TrimSpace(req.Role))
		if rawRole == "perangkat_desa" {
			rawRole = "kades"
		}
		role := domain.UserRole(rawRole)
		if !role.CanSelfRegister() {
			WriteError(w, http.StatusBadRequest, "registrasi publik hanya diizinkan untuk perangkat desa, penyedia, dan warga")
			return
		}

		nama := strings.TrimSpace(req.GetName())
		if len(nama) < 3 {
			WriteError(w, http.StatusBadRequest, "name must be at least 3 characters")
			return
		}

		switch role {
		case domain.RoleKades:
			if req.VillageID == nil || *req.VillageID <= 0 {
				WriteError(w, http.StatusBadRequest, "villageId is required for perangkat desa")
				return
			}
		case domain.RoleWarga:
			if req.VillageID == nil || *req.VillageID <= 0 {
				WriteError(w, http.StatusBadRequest, "villageId is required for warga")
				return
			}
			if strings.TrimSpace(req.NoHP) == "" {
				WriteError(w, http.StatusBadRequest, "noHp is required for warga")
				return
			}
		case domain.RolePenyedia:
			companyName := strings.TrimSpace(req.CompanyName)
			if companyName == "" {
				companyName = nama
			}
			req.CompanyName = companyName
			if req.CompanyType == "" {
				req.CompanyType = "penyedia"
			}
		}

		hash, err := usecase.HashPassword(req.Password)
		if err != nil {
			WriteError(w, http.StatusBadRequest, err.Error())
			return
		}

		params := usecase.RegisterUserParams{
			Nama:              nama,
			Email:             email,
			PasswordHash:      hash,
			Role:              role,
			VillageID:         req.VillageID,
			NoHP:              strings.TrimSpace(req.NoHP),
			CounterpartyName:  strings.TrimSpace(req.CompanyName),
			CounterpartyJenis: strings.TrimSpace(req.CompanyType),
			NPWP:              strings.TrimSpace(req.NPWP),
			Alamat:            strings.TrimSpace(req.GetAddress()),
		}

		created, err := d.Store.CreateUserWithRole(r.Context(), params)
		if err != nil {
			if errors.Is(err, domain.ErrConflict) {
				WriteError(w, http.StatusConflict, "email already registered")
				return
			}
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusBadRequest, "desa tidak ditemukan atau ID desa tidak valid")
				return
			}
			WriteError(w, http.StatusInternalServerError, "failed to register user: "+err.Error())
			return
		}

		token, _ := usecase.IssueToken(created.ID, created.Role, created.VillageID, d.Secret, 24*time.Hour)
		WriteJSON(w, http.StatusCreated, SessionResponse{
			Token:       token,
			UserID:      created.ID,
			Role:        string(created.Role),
			Nama:        created.Name,
			Email:       created.Email,
			VillageID:   created.VillageID,
			VillageName: created.VillageName,
			Status:      created.Status,
		})
	}
}

func HandleLogin(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLLogin(ClientIP(r, d.TrustedProxies)), usecase.LimitLoginPerIP, usecase.WindowLoginRL) {
			w.Header().Set("Retry-After", strconv.Itoa(int(usecase.WindowLoginRL.Seconds())))
			WriteErrorCode(w, http.StatusTooManyRequests, "RATE_LIMITED", "terlalu banyak percobaan masuk, coba lagi nanti")
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		email := strings.ToLower(strings.TrimSpace(req.Email))
		user, err := d.Store.UserByEmail(r.Context(), email)
		if err != nil || !usecase.CheckPassword(user.PasswordHash, req.Password) {
			WriteError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}

		if user.Status != "" && user.Status != "aktif" {
			WriteError(w, http.StatusForbidden, "account status is "+user.Status)
			return
		}

		token, _ := usecase.IssueToken(user.ID, user.Role, user.VillageID, d.Secret, 24*time.Hour)
		WriteJSON(w, http.StatusOK, SessionResponse{
			Token:       token,
			UserID:      user.ID,
			Role:        string(user.Role),
			Nama:        user.Name,
			Email:       user.Email,
			VillageID:   user.VillageID,
			VillageName: user.VillageName,
			Status:      user.Status,
		})
	}
}

func HandleMe(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, _, _ := ClaimsFromContext(r.Context())
		u, err := d.Store.UserByID(r.Context(), uid)
		if err != nil {
			WriteError(w, http.StatusNotFound, "user profile not found")
			return
		}
		WriteJSON(w, http.StatusOK, meResponse(u))
	}
}

