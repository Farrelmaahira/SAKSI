package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/adapter/ratelimit"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// draftingMockStore menyimpan satu kontrak (id 42, desa 1) dengan status yang bisa diatur.
type draftingMockStore struct {
	contractMockStore
	state        domain.ContractDraftState
	savedAudits  []usecase.SaveAuditParams
	published    *usecase.PublishParams
	lastRevise   usecase.ReviseContractParams
	latest       *domain.ContractAudit
	publicCalls  int
	metricsCalls int
	publicDetail domain.PublicContractDetail
}

func newDraftingStore(status domain.ContractStatus) *draftingMockStore {
	ms := &draftingMockStore{state: domain.ContractDraftState{
		ContractID: 42, VillageID: 1, Jenis: domain.JenisPengadaan, Status: status, VersionID: 5, NomorVersi: 2, Sumber: "manual",
		Isi:     "Pasal 1: Identitas\nNIK pelaksana 3302140101010001\n\n",
		Clauses: []domain.Clause{{KodePasal: "P-01", Judul: "Identitas", Isi: "NIK pelaksana 3302140101010001", Urutan: 1}},
	}}
	ms.counterparties = []domain.Counterparty{{ID: 10, Nama: "PT Maju", NPWP: "01.234", Alamat: "Jl. 1"}}
	return ms
}

func (m *draftingMockStore) ContractDraftState(_ context.Context, id int64) (domain.ContractDraftState, error) {
	if id != m.state.ContractID {
		return domain.ContractDraftState{}, domain.ErrNotFound
	}
	return m.state, nil
}

func (m *draftingMockStore) SaveContractAudit(_ context.Context, p usecase.SaveAuditParams) (int64, error) {
	m.savedAudits = append(m.savedAudits, p)
	return int64(len(m.savedAudits)), nil
}

func (m *draftingMockStore) LatestContractAudit(_ context.Context, id int64) (int64, *domain.ContractAudit, error) {
	if id != m.state.ContractID {
		return 0, nil, domain.ErrNotFound
	}
	return m.state.VillageID, m.latest, nil
}

func (m *draftingMockStore) PublishContract(_ context.Context, p usecase.PublishParams) (domain.Publication, error) {
	m.published = &p
	return domain.Publication{ID: 1, ContractID: p.ContractID, VersionID: p.VersionID, IsiTersaring: p.IsiTersaring, RedactedKinds: p.RedactedKinds}, nil
}

// ReviseContract meniru penjaga status di store: status terkunci → ErrContractNotEditable.
func (m *draftingMockStore) ReviseContract(_ context.Context, p usecase.ReviseContractParams) (domain.ContractVersion, error) {
	m.lastRevise = p
	if m.state.Status.Locked() {
		return domain.ContractVersion{}, domain.ErrContractNotEditable
	}
	return domain.ContractVersion{ID: 6, ContractID: p.ContractID, NomorVersi: 3, Sumber: "manual", Clauses: p.Clauses}, nil
}

func (m *draftingMockStore) GetPublicContractDetail(_ context.Context, villageID, id int64) (domain.PublicContractDetail, error) {
	m.publicCalls++
	if id != m.publicDetail.ID {
		return domain.PublicContractDetail{}, domain.ErrNotFound
	}
	return m.publicDetail, nil
}

func (m *draftingMockStore) GetDashboardMetrics(context.Context, string, domain.UserRole) (domain.DashboardMetrics, error) {
	m.metricsCalls++
	return domain.DashboardMetrics{ActiveContractsCount: 3}, nil
}

type tc struct {
	t      *testing.T
	store  *draftingMockStore
	ai     *fakeAI
	cache  *memCache
	deps   *handlers.Deps
	secret string
	mux    *http.ServeMux
}

func newTC(t *testing.T, status domain.ContractStatus) *tc {
	c := &tc{t: t, store: newDraftingStore(status), ai: &fakeAI{}, cache: newMemCache(), secret: "secret-drafting-tests-min-32-bytes!!"}
	c.deps = &handlers.Deps{Store: c.store, AIEngine: c.ai, Cache: c.cache, Limiter: ratelimit.NewMemory(), Secret: c.secret}
	auth := handlers.RequireAuth(c.secret)
	c.mux = http.NewServeMux()
	c.mux.Handle("POST /api/v1/contracts/wizard/preview", auth(handlers.HandleWizardPreview(c.deps)))
	c.mux.Handle("POST /api/v1/contracts", auth(handlers.HandleCreateContractWizard(c.deps)))
	c.mux.Handle("PUT /api/v1/contracts/{id}", auth(handlers.HandleReviseContract(c.deps)))
	c.mux.Handle("POST /api/v1/contracts/{id}/audit", auth(handlers.HandleAuditContractByID(c.deps)))
	c.mux.Handle("GET /api/v1/contracts/{id}/audit/latest", auth(handlers.HandleLatestContractAudit(c.deps)))
	c.mux.Handle("POST /api/v1/contracts/{id}/publish", auth(handlers.HandlePublishContract(c.deps)))
	c.mux.Handle("GET /api/v1/public/contracts/{id}", auth(handlers.HandleGetPublicContractDetail(c.deps)))
	c.mux.Handle("GET /api/v1/dashboard/metrics", auth(handlers.HandleDashboardMetrics(c.deps)))
	c.mux.Handle("POST /api/v1/reports", auth(handlers.HandleCreateCitizenReport(c.deps)))
	return c
}

func (c *tc) do(method, path string, uid int64, role domain.UserRole, village int64, body any) *httptest.ResponseRecorder {
	c.t.Helper()
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	tok, _ := usecase.IssueToken(uid, role, &village, c.secret, time.Hour)
	req.Header.Set("Authorization", "Bearer "+tok)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c.mux.ServeHTTP(w, req)
	return w
}

func errCode(t *testing.T, w *httptest.ResponseRecorder) handlers.ErrorResponse {
	t.Helper()
	var e handlers.ErrorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &e); err != nil {
		t.Fatalf("respons error bukan JSON: %s", w.Body.String())
	}
	return e
}

var previewBody = handlers.WizardPreviewRequest{CounterpartyID: 10, Jenis: "pengadaan", Judul: "Jalan", Nilai: 1e7, Tenggat: time.Now().AddDate(0, 3, 0).Format("2006-01-02"),
	JawabanForm: map[string]any{"lingkup_pekerjaan": "Jalan 300 m"}}

func TestPreviewDraftsWithAIAndRejectsInventedLegalRefs(t *testing.T) {
	c := newTC(t, domain.StatusDraft)
	w := c.do("POST", "/api/v1/contracts/wizard/preview", 1, domain.RoleKades, 1, previewBody)
	if w.Code != http.StatusOK {
		t.Fatalf("mau 200, dapat %d: %s", w.Code, w.Body.String())
	}
	var res domain.ContractDraftPreview
	_ = json.Unmarshal(w.Body.Bytes(), &res)
	if res.DraftModel != "groq:test" || len(res.Clauses) != 2 || res.Clauses[0].Isi != "Jalan 300 m" {
		t.Fatalf("pratinjau salah: %+v", res)
	}
	if res.Clauses[1].LegalReferenceID != 0 {
		t.Fatal("legalReferenceId karangan AI (999) harus dibuang")
	}
	if !strings.Contains(res.TeksDraf, "Pasal 2: Sanksi") || !strings.Contains(res.TeksDraf, "PT Maju") {
		t.Fatalf("naskah harus memuat kepala SPK + pasal: %s", res.TeksDraf)
	}
}

func TestPreviewReturns503WhenAIUnavailable(t *testing.T) {
	c := newTC(t, domain.StatusDraft)
	c.ai.down = true
	w := c.do("POST", "/api/v1/contracts/wizard/preview", 1, domain.RoleKades, 1, previewBody)
	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("mau 503, dapat %d", w.Code)
	}
	if e := errCode(t, w); e.Code != "AI_UNAVAILABLE" || e.Error != "Layanan AI sedang penuh." {
		t.Fatalf("bentuk error salah: %+v", e)
	}
}

func TestCreateManualWorksWithoutAI(t *testing.T) {
	c := newTC(t, domain.StatusDraft)
	c.ai.down = true
	body := handlers.CreateContractPayload{CounterpartyID: 10, Jenis: "pengadaan", Judul: "Jalan Desa", Nilai: 1e7, Tenggat: time.Now().AddDate(0, 3, 0).Format("2006-01-02"),
		Sumber: "manual", Clauses: []domain.Clause{
			{KodePasal: "P-02", Judul: "Nilai", Isi: "Rp 10.000.000", Urutan: 5, LegalReferenceID: 12},
			{KodePasal: "P-01", Judul: "Lingkup", Isi: "Jalan", Urutan: 1},
		}}
	w := c.do("POST", "/api/v1/contracts", 1, domain.RoleKades, 1, body)
	if w.Code != http.StatusCreated {
		t.Fatalf("jalur manual harus tetap jalan saat AI mati, dapat %d: %s", w.Code, w.Body.String())
	}
	p := c.store.lastParams
	if p.Sumber != "manual" || p.AuditModel != "" || len(p.Clauses) != 2 || p.Clauses[0].KodePasal != "P-01" || p.Clauses[1].Urutan != 2 {
		t.Fatalf("params salah (urutan harus dinormalisasi, tanpa audit pengganti): %+v", p)
	}

	body.Clauses[0].LegalReferenceID = 999
	if w := c.do("POST", "/api/v1/contracts", 1, domain.RoleKades, 1, body); w.Code != http.StatusBadRequest {
		t.Fatalf("legalReferenceId tak dikenal harus 400, dapat %d", w.Code)
	}
	body.Clauses[0].LegalReferenceID, body.Sumber = 12, "robot"
	if w := c.do("POST", "/api/v1/contracts", 1, domain.RoleKades, 1, body); w.Code != http.StatusBadRequest {
		t.Fatalf("sumber tidak valid harus 400, dapat %d", w.Code)
	}
}

func TestReviseRejectedAfterSigned(t *testing.T) {
	body := map[string]any{"clauses": []domain.Clause{{KodePasal: "P-01", Judul: "Lingkup", Isi: "Baru", Urutan: 1}}}
	for _, st := range []domain.ContractStatus{domain.StatusSigned, domain.StatusPublished, domain.StatusRunning, domain.StatusDone, domain.StatusCancelled} {
		c := newTC(t, st)
		w := c.do("PUT", "/api/v1/contracts/42", 1, domain.RoleKades, 1, body)
		if w.Code != http.StatusConflict || errCode(t, w).Code != "CONTRACT_LOCKED" {
			t.Fatalf("status %s: mau 409 CONTRACT_LOCKED, dapat %d %s", st, w.Code, w.Body.String())
		}
	}
	c := newTC(t, domain.StatusInReview)
	w := c.do("PUT", "/api/v1/contracts/42", 1, domain.RoleKades, 1, body)
	if w.Code != http.StatusOK || len(c.store.lastRevise.Clauses) != 1 {
		t.Fatalf("status ditinjau masih boleh direvisi, dapat %d %s", w.Code, w.Body.String())
	}
	if w := c.do("PUT", "/api/v1/contracts/42", 1, domain.RoleKades, 1, map[string]any{"clauses": []domain.Clause{}}); w.Code != http.StatusBadRequest {
		t.Fatalf("versi manual tanpa pasal harus 400, dapat %d", w.Code)
	}
}

func TestAuditByIDScopeCacheAndUnavailable(t *testing.T) {
	c := newTC(t, domain.StatusDraft)
	if w := c.do("POST", "/api/v1/contracts/42/audit", 9, domain.RoleKades, 2, nil); w.Code != http.StatusForbidden {
		t.Fatalf("kades desa lain harus 403, dapat %d", w.Code)
	}
	if w := c.do("POST", "/api/v1/contracts/42/audit", 9, domain.RolePenyedia, 1, nil); w.Code != http.StatusForbidden {
		t.Fatalf("penyedia tidak boleh mengaudit, dapat %d", w.Code)
	}

	w := c.do("POST", "/api/v1/contracts/42/audit", 1, domain.RoleKades, 1, nil)
	var res handlers.ContractAuditResponse
	_ = json.Unmarshal(w.Body.Bytes(), &res)
	if w.Code != http.StatusOK || res.Skor != 80 || res.Model != "groq:test" || res.VersionID != 5 || res.Sumber != "manual" {
		t.Fatalf("audit salah %d: %s", w.Code, w.Body.String())
	}
	// Panggilan kedua (inspektorat lintas desa) memakai cache audit berbasis isi, tapi tetap menyimpan baris audit.
	if w := c.do("POST", "/api/v1/contracts/42/audit", 3, domain.RoleInspektorat, 0, nil); w.Code != http.StatusOK {
		t.Fatalf("inspektorat lintas desa harus boleh, dapat %d", w.Code)
	}
	if c.ai.auditCalls != 1 || len(c.store.savedAudits) != 2 {
		t.Fatalf("cache hit: AI dipanggil %d kali (mau 1), audit tersimpan %d (mau 2)", c.ai.auditCalls, len(c.store.savedAudits))
	}

	c2 := newTC(t, domain.StatusDraft)
	c2.ai.down = true
	if w := c2.do("POST", "/api/v1/contracts/42/audit", 1, domain.RoleKades, 1, nil); w.Code != http.StatusServiceUnavailable || len(c2.store.savedAudits) != 0 {
		t.Fatalf("AI mati harus 503 tanpa menyimpan audit, dapat %d", w.Code)
	}
	for k := range c2.cache.data {
		if strings.HasPrefix(k, "saksi:ai:") {
			t.Fatalf("kegagalan AI tidak boleh di-cache: %s", k)
		}
	}
}

func TestLatestAudit(t *testing.T) {
	c := newTC(t, domain.StatusAudited)
	if w := c.do("GET", "/api/v1/contracts/42/audit/latest", 1, domain.RoleKades, 1, nil); w.Code != http.StatusNotFound {
		t.Fatalf("belum ada audit harus 404, dapat %d", w.Code)
	}
	c.store.latest = &domain.ContractAudit{ID: 3, VersionID: 5, NomorVersi: 2, Sumber: "ai", Model: "groq:test", Skor: 90, Findings: []domain.AuditFinding{}}
	if w := c.do("GET", "/api/v1/contracts/42/audit/latest", 1, domain.RoleBPD, 2, nil); w.Code != http.StatusForbidden {
		t.Fatalf("desa lain harus 403, dapat %d", w.Code)
	}
	w := c.do("GET", "/api/v1/contracts/42/audit/latest", 1, domain.RoleBPD, 1, nil)
	var res handlers.ContractAuditResponse
	_ = json.Unmarshal(w.Body.Bytes(), &res)
	if w.Code != http.StatusOK || res.AuditID != 3 || res.Skor != 90 || res.Sumber != "ai" {
		t.Fatalf("audit terakhir salah %d: %s", w.Code, w.Body.String())
	}
	if w := c.do("GET", "/api/v1/contracts/77/audit/latest", 1, domain.RoleKades, 1, nil); w.Code != http.StatusNotFound {
		t.Fatalf("kontrak tidak ada harus 404, dapat %d", w.Code)
	}
}

func TestPublishRedactsOrRefuses(t *testing.T) {
	c := newTC(t, domain.StatusInReview)
	if w := c.do("POST", "/api/v1/contracts/42/publish", 1, domain.RoleKades, 1, nil); w.Code != http.StatusConflict {
		t.Fatalf("belum ditandatangani harus 409, dapat %d", w.Code)
	}

	c = newTC(t, domain.StatusSigned)
	c.ai.redactFail = true
	if w := c.do("POST", "/api/v1/contracts/42/publish", 1, domain.RoleKades, 1, nil); w.Code != http.StatusServiceUnavailable || c.store.published != nil {
		t.Fatalf("redaksi gagal harus 503 dan TIDAK publikasi, dapat %d published=%v", w.Code, c.store.published)
	}

	c = newTC(t, domain.StatusSigned)
	_ = c.cache.Set(context.Background(), usecase.KeyPublicContract(42), []byte("{}"), time.Minute)
	_ = c.cache.Set(context.Background(), usecase.KeyPublicContracts(1, 0), []byte("[]"), time.Minute)
	_ = c.cache.Set(context.Background(), usecase.KeyPublicContracts(2, 0), []byte("[]"), time.Minute)
	if w := c.do("POST", "/api/v1/contracts/42/publish", 1, domain.RoleKades, 2, nil); w.Code != http.StatusForbidden {
		t.Fatalf("kades desa lain harus 403, dapat %d", w.Code)
	}
	w := c.do("POST", "/api/v1/contracts/42/publish", 1, domain.RoleKades, 1, nil)
	if w.Code != http.StatusCreated || c.store.published == nil || strings.Contains(c.store.published.IsiTersaring, "3302140101010001") {
		t.Fatalf("publikasi harus memakai teks tersaring, dapat %d %+v", w.Code, c.store.published)
	}
	if c.cache.has(usecase.KeyPublicContract(42)) || c.cache.has(usecase.KeyPublicContracts(1, 0)) || !c.cache.has(usecase.KeyPublicContracts(2, 0)) {
		t.Fatal("publikasi harus menghapus cache kontrak dan daftar desa itu saja")
	}
}

func TestPublicDetailCacheKeepsVillageScope(t *testing.T) {
	c := newTC(t, domain.StatusPublished)
	c.store.publicDetail = domain.PublicContractDetail{PublicContractSummary: domain.PublicContractSummary{ID: 42, VillageID: 1}, IsiTeks: "tersaring"}
	for i := 0; i < 2; i++ {
		if w := c.do("GET", "/api/v1/public/contracts/42", 5, domain.RoleWarga, 1, nil); w.Code != http.StatusOK {
			t.Fatalf("mau 200, dapat %d", w.Code)
		}
	}
	if c.store.publicCalls != 1 || c.cache.ttl[usecase.KeyPublicContract(42)] != usecase.TTLPublicDetail {
		t.Fatalf("panggilan kedua harus cache hit (store dipanggil %d kali)", c.store.publicCalls)
	}
	if w := c.do("GET", "/api/v1/public/contracts/42", 6, domain.RoleWarga, 2, nil); w.Code != http.StatusNotFound {
		t.Fatalf("warga desa lain tidak boleh membaca dari cache, dapat %d", w.Code)
	}
}

func TestMetricsCachedPerUser(t *testing.T) {
	c := newTC(t, domain.StatusDraft)
	c.do("GET", "/api/v1/dashboard/metrics", 1, domain.RoleKades, 1, nil)
	c.do("GET", "/api/v1/dashboard/metrics", 1, domain.RoleKades, 1, nil)
	c.do("GET", "/api/v1/dashboard/metrics", 2, domain.RoleKades, 2, nil)
	if c.store.metricsCalls != 2 {
		t.Fatalf("mau 2 panggilan store (1 hit, 2 user beda), dapat %d", c.store.metricsCalls)
	}
}

func TestReportRateLimit(t *testing.T) {
	ms := &reportsMockStore{}
	secret := "secret-report-rate-limit-min-32-bytes"
	deps := &handlers.Deps{Store: ms, Secret: secret, Limiter: ratelimit.NewMemory()}
	h := handlers.RequireAuth(secret)(handlers.HandleCreateCitizenReport(deps))
	v := int64(1)
	tok, _ := usecase.IssueToken(3, domain.RoleWarga, &v, secret, time.Hour)
	other, _ := usecase.IssueToken(4, domain.RoleWarga, &v, secret, time.Hour)
	send := func(token string) *httptest.ResponseRecorder {
		body := `{"contractId":10,"kategori":"keterlambatan","deskripsi":"Pekerjaan jalan berhenti dua minggu."}`
		req := httptest.NewRequest("POST", "/api/v1/reports", strings.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, req)
		return w
	}
	for i := 1; i <= usecase.LimitReportPerHr; i++ {
		if w := send(tok); w.Code != http.StatusCreated {
			t.Fatalf("laporan ke-%d harus 201, dapat %d: %s", i, w.Code, w.Body.String())
		}
	}
	w := send(tok)
	if w.Code != http.StatusTooManyRequests || errCode(t, w).Code != "RATE_LIMITED" || w.Header().Get("Retry-After") == "" {
		t.Fatalf("laporan berlebih harus 429 RATE_LIMITED, dapat %d %s", w.Code, w.Body.String())
	}
	if w := send(other); w.Code != http.StatusCreated {
		t.Fatalf("warga lain tidak boleh ikut terblokir, dapat %d", w.Code)
	}
}

func TestLoginRateLimitPerIP(t *testing.T) {
	_, deps := newTestDeps()
	deps.Limiter = ratelimit.NewMemory()
	h := handlers.HandleLogin(deps)
	send := func(ip string) int {
		req := httptest.NewRequest("POST", "/api/v1/auth/login", strings.NewReader(`{"email":"x@y.id","password":"salah"}`))
		req.RemoteAddr = ip + ":5000"
		w := httptest.NewRecorder()
		h(w, req)
		return w.Code
	}
	for i := 0; i < usecase.LimitLoginPerIP; i++ {
		if code := send("203.0.113.9"); code == http.StatusTooManyRequests {
			t.Fatalf("percobaan ke-%d belum boleh dibatasi", i+1)
		}
	}
	if code := send("203.0.113.9"); code != http.StatusTooManyRequests {
		t.Fatalf("mau 429, dapat %d", code)
	}
	if code := send("203.0.113.10"); code == http.StatusTooManyRequests {
		t.Fatal("IP lain tidak boleh ikut terblokir")
	}
}

func TestClientIPTrustsOnlyProxies(t *testing.T) {
	trusted, err := handlers.ParseTrustedProxies("10.0.0.0/8, 172.18.0.5")
	if err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		remote, xff, want string
	}{
		{"203.0.113.9:1234", "1.2.3.4", "203.0.113.9"},             // klien langsung: header palsu diabaikan
		{"172.18.0.5:80", "1.2.3.4, 198.51.100.7", "198.51.100.7"}, // dari proxy: hop paling kanan yang tidak tepercaya
		{"10.1.2.3:80", "198.51.100.7, 10.9.9.9", "198.51.100.7"},  // rantai proxy tepercaya dilewati
		{"172.18.0.5:80", "", "172.18.0.5"},
	}
	for _, c := range cases {
		req := httptest.NewRequest("GET", "/", nil)
		req.RemoteAddr = c.remote
		if c.xff != "" {
			req.Header.Set("X-Forwarded-For", c.xff)
		}
		if got := handlers.ClientIP(req, trusted); got != c.want {
			t.Errorf("ClientIP(%s, %q) = %s, mau %s", c.remote, c.xff, got, c.want)
		}
	}
	if _, err := handlers.ParseTrustedProxies("bukan-ip"); err == nil {
		t.Fatal("TRUSTED_PROXIES tidak valid harus error")
	}

}
