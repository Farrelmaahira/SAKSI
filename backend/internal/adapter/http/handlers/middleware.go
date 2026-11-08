package handlers

import (
	"context"
	"net/http"
	"strings"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type ctxKey string

const (
	ctxUserID    ctxKey = "userId"
	ctxRole      ctxKey = "role"
	ctxVillageID ctxKey = "villageId"
)

// ClaimsFromContext mengekstrak klaim pengguna dari context HTTP request.
func ClaimsFromContext(ctx context.Context) (int64, domain.UserRole, *int64) {
	uid, _ := ctx.Value(ctxUserID).(int64)
	role, _ := ctx.Value(ctxRole).(domain.UserRole)
	villageID, _ := ctx.Value(ctxVillageID).(*int64)
	return uid, role, villageID
}

// RequireAuth memverifikasi token bearer HMAC dan memasukkan klaim ke context.
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

// OptionalAuth memverifikasi token jika ada, tetapi tidak memblokir request jika token belum disertakan.
func OptionalAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			token := strings.TrimPrefix(authHeader, "Bearer ")
			if token != "" && token != authHeader {
				claims, err := usecase.VerifyToken(strings.TrimSpace(token), secret)
				if err == nil {
					ctx := context.WithValue(r.Context(), ctxUserID, claims.UserID)
					ctx = context.WithValue(ctx, ctxRole, claims.Role)
					ctx = context.WithValue(ctx, ctxVillageID, claims.VillageID)
					r = r.WithContext(ctx)
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}


