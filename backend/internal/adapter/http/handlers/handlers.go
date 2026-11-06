package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type ctxKey string

const (
	ctxUserID    ctxKey = "userId"
	ctxRole      ctxKey = "role"
	ctxVillageID ctxKey = "villageId"
)

type Deps struct {
	Store    usecase.Store
	Storage  usecase.Storage
	AIEngine usecase.AIEngine
	Secret   string
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, status int, msg string) {
	WriteJSON(w, status, ErrorResponse{Error: msg})
}

func formatVillageID(v *int64) string {
	if v == nil {
		return ""
	}
	return strconv.FormatInt(*v, 10)
}

func ClaimsFromContext(ctx context.Context) (int64, domain.UserRole, *int64) {
	uid, _ := ctx.Value(ctxUserID).(int64)
	role, _ := ctx.Value(ctxRole).(domain.UserRole)
	villageID, _ := ctx.Value(ctxVillageID).(*int64)
	return uid, role, villageID
}

func RequireAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			token := strings.TrimPrefix(authHeader, "Bearer ")
			if token == "" || token == authHeader {
				WriteError(w, http.StatusUnauthorized, "authorization token required")
				return
			}
			claims, err := usecase.VerifyToken(strings.TrimSpace(token), secret)
			if err != nil {
				WriteError(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}
			ctx := context.WithValue(r.Context(), ctxUserID, claims.UserID)
			ctx = context.WithValue(ctx, ctxRole, claims.Role)
			ctx = context.WithValue(ctx, ctxVillageID, claims.VillageID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

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
		WriteJSON(w, http.StatusOK, MeResponse{
			UserID:      u.ID,
			Role:        string(u.Role),
			Nama:        u.Name,
			Email:       u.Email,
			VillageID:   u.VillageID,
			VillageName: u.VillageName,
			Status:      u.Status,
		})
	}
}

func HandleDashboardMetrics(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		metrics, err := d.Store.GetDashboardMetrics(r.Context(), villageID, role)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to fetch dashboard metrics")
			return
		}
		WriteJSON(w, http.StatusOK, metrics)
	}
}

func HandleListContracts(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		search := r.URL.Query().Get("q")
		list, err := d.Store.ListContracts(r.Context(), villageID, role, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to query contracts")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

func HandleGetContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		contractID := r.PathValue("id")
		contract, err := d.Store.ContractByID(r.Context(), contractID)
		if err != nil {
			WriteError(w, http.StatusNotFound, "contract not found")
			return
		}

		if err := usecase.AuthorizeContractAccess(role, villageID, contract); err != nil {
			WriteError(w, http.StatusForbidden, "access denied: IDOR violation")
			return
		}

		WriteJSON(w, http.StatusOK, contract)
	}
}

func HandleAuditContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VerifyContractRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		score, fulfilled, total, summary, err := d.AIEngine.AuditClauses(r.Context(), req.ContractText)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "ai audit failed")
			return
		}

		hasher := sha256.New()
		hasher.Write([]byte(req.ContractText))
		hash := hex.EncodeToString(hasher.Sum(nil))

		WriteJSON(w, http.StatusOK, AuditResponse{
			IntegrityScore:     score,
			MandatoryFulfilled: fulfilled,
			TotalMandatory:     total,
			SHA256Hash:         hash,
			Summary:            summary,
		})
	}
}

