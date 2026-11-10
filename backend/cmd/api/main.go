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
	"saksi-backend/internal/adapter/ratelimit"
	redisadapter "saksi-backend/internal/adapter/redis"
	"saksi-backend/internal/adapter/storage"
	"saksi-backend/internal/usecase"
)

func env(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

const minSecretLen = 16

func main() {
	devEnv := map[string]bool{"development": true, "local": true, "test": true}[os.Getenv("APP_ENV")]
	secret := os.Getenv("SAKSI_SECRET")
	if secret == "" && devEnv {
		secret = "saksi-development-secret-key-min16chars" // hanya dev; semua replika dev memakai nilai yang sama
	}
	// Minimal 16 karena panjang secret Azure yang sudah terpasang belum diketahui; naikkan ke 32 setelah dicek.
	if len(secret) < minSecretLen {
		slog.Error("SAKSI_SECRET wajib diisi (min. 16 karakter) dan sama di semua replika; default hanya untuk APP_ENV=development/local/test",
			"app_env", os.Getenv("APP_ENV"), "len", len(secret))
		os.Exit(1)
	}
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

	// AI: gRPC (utama) → REST /v1/audit (cadangan audit selama gRPC belum terbukti di Azure).
	aiKey := env("AI_API_KEY", "")
	var aiClient usecase.AIEngine
	var rest *aiengine.REST
	if aiEndpoint != "" {
		rest = aiengine.NewREST(aiEndpoint, aiKey)
		aiClient = rest
	}
	if addr := os.Getenv("AI_ENGINE_GRPC_ADDR"); addr != "" {
		grpcClient, err := aiengine.Dial(addr, aiKey, os.Getenv("AI_ENGINE_GRPC_TLS") == "true", rest)
		if err != nil {
			slog.Error("konfigurasi gRPC ai-engine tidak valid", "err", err)
			os.Exit(1)
		}
		defer grpcClient.Close()
		aiClient = grpcClient
	}

	// Redis: kosong = cache mati; rate limit tetap jalan in-memory per proses (tidak fail-open).
	memLimiter := ratelimit.NewMemory()
	var cache usecase.Cache = usecase.NopCache{}
	var limiter usecase.RateLimiter = memLimiter
	if redisURL := os.Getenv("REDIS_URL"); redisURL != "" {
		rc, err := redisadapter.Open(redisURL, memLimiter)
		if err != nil {
			slog.Error("REDIS_URL tidak valid", "err", err)
			os.Exit(1)
		}
		defer rc.Close()
		pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		if err := rc.Ping(pingCtx); err != nil {
			slog.Warn("redis belum terjangkau; cache akan miss dan rate limit memakai memori", "err", err)
		}
		cancel()
		cache, limiter = rc, rc
	} else {
		slog.Warn("REDIS_URL kosong: cache mati, rate limit in-memory per instance")
	}

	trusted, err := handlers.ParseTrustedProxies(os.Getenv("TRUSTED_PROXIES"))
	if err != nil {
		slog.Error("TRUSTED_PROXIES tidak valid", "err", err)
		os.Exit(1)
	}

	deps := &handlers.Deps{
		Store:          store,
		Storage:        files,
		AIEngine:       aiClient,
		Secret:         secret,
		Cache:          cache,
		Limiter:        limiter,
		TrustedProxies: trusted,
		// Fail-safe: token reset sandi hanya tampil bila APP_ENV eksplisit dev; kosong = diperlakukan produksi.
		ExposeDevTokens: devEnv,
	}

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("POST /api/v1/auth/register", handlers.HandleRegister(deps))
	mux.HandleFunc("POST /api/v1/auth/login", handlers.HandleLogin(deps))
	mux.HandleFunc("POST /api/v1/auth/password/forgot", handlers.HandleForgotPassword(deps))
	mux.HandleFunc("POST /api/v1/auth/password/reset", handlers.HandleResetPassword(deps))

	// Protected routes (IDOR and role validation)
	authMiddleware := handlers.RequireAuth(secret)
	optionalAuthMiddleware := handlers.OptionalAuth(secret)
	mux.Handle("GET /api/v1/auth/me", authMiddleware(handlers.HandleMe(deps)))
	mux.Handle("PUT /api/v1/auth/me", authMiddleware(handlers.HandleUpdateMe(deps)))
	mux.Handle("POST /api/v1/auth/password/change", authMiddleware(handlers.HandleChangePassword(deps)))
	mux.Handle("GET /api/v1/dashboard/metrics", authMiddleware(handlers.HandleDashboardMetrics(deps)))

	// Master data & Wizard routes
	mux.Handle("GET /api/v1/counterparties", optionalAuthMiddleware(handlers.HandleListCounterparties(deps)))
	mux.Handle("GET /api/v1/contracts/options", optionalAuthMiddleware(handlers.HandleGetContractOptions(deps)))
	mux.Handle("POST /api/v1/contracts/wizard/questions", authMiddleware(handlers.HandleWizardQuestions(deps)))
	mux.Handle("POST /api/v1/contracts/wizard/preview", authMiddleware(handlers.HandleWizardPreview(deps)))

	// Contract lifecycle routes
	mux.Handle("GET /api/v1/contracts", authMiddleware(handlers.HandleListContracts(deps)))
	mux.Handle("POST /api/v1/contracts", authMiddleware(handlers.HandleCreateContractWizard(deps)))
	mux.Handle("GET /api/v1/contracts/{id}", authMiddleware(handlers.HandleGetContract(deps)))
	mux.Handle("POST /api/v1/contracts/audit", authMiddleware(handlers.HandleAuditContract(deps)))
	mux.Handle("PUT /api/v1/contracts/{id}", authMiddleware(handlers.HandleReviseContract(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/audit", authMiddleware(handlers.HandleAuditContractByID(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/audit/latest", authMiddleware(handlers.HandleLatestContractAudit(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/publish", authMiddleware(handlers.HandlePublishContract(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/lifecycle", authMiddleware(handlers.HandleGetContractLifecycle(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/reviews", authMiddleware(handlers.HandleSubmitContractReview(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/sign", authMiddleware(handlers.HandleSignContract(deps)))

	// Public contracts for citizens & tracking
	// Portal publik (keputusan PM 2026-11-10): baca anonim boleh; hanya data terpublikasi yang sudah diredaksi.
	mux.Handle("GET /api/v1/public/contracts", optionalAuthMiddleware(handlers.HandleListPublicContracts(deps)))
	mux.Handle("GET /api/v1/public/contracts/{id}", optionalAuthMiddleware(handlers.HandleGetPublicContractDetail(deps)))
	mux.Handle("GET /api/v1/public/seals/verify", optionalAuthMiddleware(handlers.HandleVerifySeal(deps)))

	// Citizen reports routes
	mux.Handle("POST /api/v1/reports", authMiddleware(handlers.HandleCreateCitizenReport(deps)))
	mux.Handle("GET /api/v1/reports", authMiddleware(handlers.HandleListReports(deps)))
	mux.Handle("GET /api/v1/reports/{id}", authMiddleware(handlers.HandleGetReportDetail(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/reports", authMiddleware(handlers.HandleListContractReports(deps)))
	mux.Handle("GET /api/v1/reports/{id}/actions", authMiddleware(handlers.HandleListReportActions(deps)))
	mux.Handle("POST /api/v1/reports/{id}/actions", authMiddleware(handlers.HandleAddReportAction(deps)))

	// Termin, SPK, progres pekerjaan
	mux.Handle("GET /api/v1/termin", authMiddleware(handlers.HandleListTermin(deps)))
	mux.Handle("GET /api/v1/contracts/{id}/termin", authMiddleware(handlers.HandleGetContractTermin(deps)))
	mux.Handle("PUT /api/v1/contracts/{id}/termin", authMiddleware(handlers.HandleSetPaymentTerms(deps)))
	mux.Handle("PUT /api/v1/contracts/{id}/spk", authMiddleware(handlers.HandleSetSPK(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/progress", authMiddleware(handlers.HandleReportProgress(deps)))
	mux.Handle("POST /api/v1/contracts/{id}/termin/{termId}/bayar", authMiddleware(handlers.HandlePayTerm(deps)))

	// Segel, notifikasi, jejak audit, LHP
	mux.Handle("GET /api/v1/seals", authMiddleware(handlers.HandleListSeals(deps)))
	mux.Handle("GET /api/v1/notifications", authMiddleware(handlers.HandleListNotifications(deps)))
	mux.Handle("POST /api/v1/notifications/read-all", authMiddleware(handlers.HandleMarkAllNotificationsRead(deps)))
	mux.Handle("POST /api/v1/notifications/{id}/read", authMiddleware(handlers.HandleMarkNotificationRead(deps)))
	mux.Handle("GET /api/v1/audit-logs", authMiddleware(handlers.HandleListAuditLogs(deps)))
	mux.Handle("POST /api/v1/audit-reports", authMiddleware(handlers.HandleCreateAuditReport(deps)))
	mux.Handle("GET /api/v1/audit-reports", authMiddleware(handlers.HandleListAuditReports(deps)))
	mux.Handle("GET /api/v1/audit-reports/{id}", authMiddleware(handlers.HandleGetAuditReport(deps)))
	mux.Handle("POST /api/v1/audit-reports/{id}/terbit", authMiddleware(handlers.HandlePublishAuditReport(deps)))

	// Admin daerah
	mux.Handle("GET /api/v1/admin/region-rules", authMiddleware(handlers.HandleListRegionRules(deps)))
	mux.Handle("POST /api/v1/admin/region-rules", authMiddleware(handlers.HandleCreateRegionRule(deps)))
	mux.Handle("GET /api/v1/admin/pengawas", authMiddleware(handlers.HandleListPengawas(deps)))
	mux.Handle("GET /api/v1/admin/oversight-assignments", authMiddleware(handlers.HandleListOversightAssignments(deps)))
	mux.Handle("POST /api/v1/admin/oversight-assignments", authMiddleware(handlers.HandleCreateOversightAssignment(deps)))


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

	// WriteTimeout > preview terburuk (DraftContract 13 dtk + AuditContract 13 dtk + REST 13 dtk).
	// Proxy di depan (Nginx proxy_read_timeout / Azure 230 dtk) harus lebih panjang dari ini.
	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           corsMiddleware(mux),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	shutdownDone := make(chan struct{})
	go func() {
		defer close(shutdownDone)
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			slog.Error("graceful shutdown gagal", "err", err)
		}
	}()

	slog.Info("SAKSI backend listening", "port", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("server stopped unexpectedly", "err", err)
		return
	}
	<-shutdownDone // tunggu request yang sedang berjalan selesai sebelum pool DB/Redis ditutup oleh defer
}

