package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"saksi-backend/internal/adapter/aiengine"
	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/adapter/postgres"
	"saksi-backend/internal/adapter/storage"
)

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func main() {
	secret := env("SAKSI_SECRET", "saksi-production-hmac-secret-min16chars")
	port := env("PORT", "8080")
	dbURL := env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable")
	storageDir := env("STORAGE_DIR", "./data/files")
	aiEndpoint := env("AI_ENGINE_URL", "http://localhost:8000")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	store, err := postgres.Open(ctx, dbURL)
	if err != nil {
		slog.Error("database connection failed", "err", err)
		os.Exit(1)
	}
	defer store.Close()

	files, err := storage.NewLocalStorage(storageDir)
	if err != nil {
		slog.Error("storage initialization failed", "err", err)
		os.Exit(1)
	}

	aiClient := aiengine.NewClient(aiEndpoint, env("AI_API_KEY", ""))

	deps := &handlers.Deps{
		Store:    store,
		Storage:  files,
		AIEngine: aiClient,
		Secret:   secret,
	}

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("POST /api/v1/auth/register", handlers.HandleRegister(deps))
	mux.HandleFunc("POST /api/v1/auth/login", handlers.HandleLogin(deps))

	// Protected routes (IDOR and role validation)
	authMiddleware := handlers.RequireAuth(secret)
	mux.Handle("GET /api/v1/auth/me", authMiddleware(handlers.HandleMe(deps)))
	mux.Handle("GET /api/v1/dashboard/metrics", authMiddleware(handlers.HandleDashboardMetrics(deps)))

	// Master data & Wizard routes
	mux.Handle("GET /api/v1/counterparties", authMiddleware(handlers.HandleListCounterparties(deps)))
	mux.Handle("GET /api/v1/contracts/options", authMiddleware(handlers.HandleGetContractOptions(deps)))
	mux.Handle("POST /api/v1/contracts/wizard/questions", authMiddleware(handlers.HandleWizardQuestions(deps)))
	mux.Handle("POST /api/v1/contracts/wizard/preview", authMiddleware(handlers.HandleWizardPreview(deps)))

	// Contract lifecycle routes
	mux.Handle("GET /api/v1/contracts", authMiddleware(handlers.HandleListContracts(deps)))
	mux.Handle("POST /api/v1/contracts", authMiddleware(handlers.HandleCreateContractWizard(deps)))
	mux.Handle("GET /api/v1/contracts/{id}", authMiddleware(handlers.HandleGetContract(deps)))
	mux.Handle("POST /api/v1/contracts/audit", authMiddleware(handlers.HandleAuditContract(deps)))
	mux.Handle("PUT /api/v1/contracts/{id}", authMiddleware(handlers.HandleReviseContract(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/lifecycle", authMiddleware(handlers.HandleGetContractLifecycle(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/reviews", authMiddleware(handlers.HandleSubmitContractReview(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/sign", authMiddleware(handlers.HandleSignContract(deps)))

	// Public contracts for citizens & tracking
	mux.Handle("GET /api/v1/public/contracts", authMiddleware(handlers.HandleListPublicContracts(deps)))
	mux.Handle("GET /api/v1/public/contracts/{id}", authMiddleware(handlers.HandleGetPublicContractDetail(deps)))

	// Citizen reports routes
	mux.Handle("POST /api/v1/reports", authMiddleware(handlers.HandleCreateCitizenReport(deps)))
	mux.Handle("GET /api/v1/reports", authMiddleware(handlers.HandleListReports(deps)))
	mux.Handle("GET /api/v1/reports/{id}", authMiddleware(handlers.HandleGetReportDetail(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/reports", authMiddleware(handlers.HandleListContractReports(deps)))


	webOrigin := env("WEB_ORIGIN", "http://localhost:3000")

	corsMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", webOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      corsMiddleware(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	slog.Info("SAKSI backend listening", "port", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("server stopped unexpectedly", "err", err)
	}
}

