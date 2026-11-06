package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
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

func ClaimsFromContext(ctx context.Context) (string, domain.UserRole, string) {
	uid, _ := ctx.Value(ctxUserID).(string)
	role, _ := ctx.Value(ctxRole).(domain.UserRole)
	villageID, _ := ctx.Value(ctxVillageID).(string)
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

		role := domain.UserRole(req.Role)
		if !role.Valid() {
			WriteError(w, http.StatusBadRequest, "role must be kades, bpd, or inspektorat")
			return
		}

		if len(strings.TrimSpace(req.Name)) < 3 {
			WriteError(w, http.StatusBadRequest, "name must be at least 3 characters")
			return
		}

		hash, err := usecase.HashPassword(req.Password)
		if err != nil {
			WriteError(w, http.StatusBadRequest, err.Error())
			return
		}

		user := domain.User{
			ID:           fmt.Sprintf("usr-%d", time.Now().UnixNano()),
			Email:        email,
			PasswordHash: hash,
			Role:         role,
			Name:         strings.TrimSpace(req.Name),
			NIP:          strings.TrimSpace(req.NIP),
			VillageID:    strings.TrimSpace(req.VillageID),
			VillageName:  strings.TrimSpace(req.VillageName),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		created, err := d.Store.CreateUser(r.Context(), user)
		if err != nil {
			WriteError(w, http.StatusConflict, "email already registered")
			return
		}

		token, _ := usecase.IssueToken(created.ID, created.Role, created.VillageID, d.Secret, 24*time.Hour)
		WriteJSON(w, http.StatusCreated, SessionResponse{
			Token:       token,
			Role:        string(created.Role),
			Name:        created.Name,
			Email:       created.Email,
			NIP:         created.NIP,
			VillageID:   created.VillageID,
			VillageName: created.VillageName,
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

		token, _ := usecase.IssueToken(user.ID, user.Role, user.VillageID, d.Secret, 24*time.Hour)
		WriteJSON(w, http.StatusOK, SessionResponse{
			Token:       token,
			Role:        string(user.Role),
			Name:        user.Name,
			Email:       user.Email,
			NIP:         user.NIP,
			VillageID:   user.VillageID,
			VillageName: user.VillageName,
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
			Name:        u.Name,
			Email:       u.Email,
			NIP:         u.NIP,
			VillageID:   u.VillageID,
			VillageName: u.VillageName,
		})
	}
}

func HandleDashboardMetrics(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, villageID := ClaimsFromContext(r.Context())
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
		_, role, villageID := ClaimsFromContext(r.Context())
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
		_, role, villageID := ClaimsFromContext(r.Context())
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

