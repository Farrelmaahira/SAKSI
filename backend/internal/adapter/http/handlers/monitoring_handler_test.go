package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"

	"golang.org/x/crypto/bcrypt"
)

// monitorStore memalsukan Store untuk endpoint lanjutan; err dipakai untuk mensimulasikan penolakan store.
type monitorStore struct {
	usecase.Store
	err          error
	lastScope    usecase.Scope
	lastTerms    usecase.SetTermsParams
	lastProgress usecase.ReportProgressParams
	lastPay      usecase.PayTermParams
	lastLogs     usecase.AuditLogFilter
	lastReport   usecase.CreateAuditReportParams
	lastAction   usecase.ReportActionParams
	lastRule     usecase.CreateRegionRuleParams
	lastAssign   usecase.AssignOversightParams
	lastProfile  usecase.UpdateProfileParams
	lastCancel   usecase.CancelContractParams
	verifyHash   string
	verifier     *int64
	regions      []int64
	resetHash    string
	resetCreated bool
	pwHash       string
	changedTo    string
}

func (m *monitorStore) CancelContract(_ context.Context, p usecase.CancelContractParams) (int64, error) {
	m.lastCancel = p
	return 1, m.err
}
func (m *monitorStore) ListTerminSummaries(_ context.Context, sc usecase.Scope) ([]domain.TerminSummary, error) {
	m.lastScope = sc
	return []domain.TerminSummary{{ContractID: 12, Terms: []domain.PaymentTerm{}}}, m.err
}
func (m *monitorStore) GetContractTermin(_ context.Context, id int64, sc usecase.Scope) (domain.ContractTermin, error) {
	m.lastScope = sc
	return domain.ContractTermin{ContractID: id, VillageID: 1}, m.err
}
func (m *monitorStore) SetPaymentTerms(_ context.Context, p usecase.SetTermsParams) (domain.ContractTermin, error) {
	m.lastTerms = p
	return domain.ContractTermin{ContractID: p.ContractID, VillageID: 1}, m.err
}
func (m *monitorStore) SetSPK(_ context.Context, p usecase.SetSPKParams) (domain.ContractTermin, error) {
	return domain.ContractTermin{ContractID: p.ContractID, VillageID: 1}, m.err
}
func (m *monitorStore) ReportProgress(_ context.Context, p usecase.ReportProgressParams) (domain.WorkProgress, int64, error) {
	m.lastProgress = p
	return domain.WorkProgress{ID: 7, ContractID: p.ContractID, PersenSelesai: p.PersenSelesai}, 1, m.err
}
func (m *monitorStore) PayTerm(_ context.Context, p usecase.PayTermParams) (domain.PaymentTerm, int64, error) {
	m.lastPay = p
	return domain.PaymentTerm{ID: p.TermID, Status: domain.TermDibayar}, 1, m.err
}
func (m *monitorStore) VerifySeal(_ context.Context, hash string, verifier *int64) (domain.SealVerifyResult, error) {
	m.verifyHash, m.verifier = hash, verifier
	return domain.SealVerifyResult{Cocok: true}, m.err
}
func (m *monitorStore) ListSeals(_ context.Context, sc usecase.Scope) ([]domain.SealSummary, error) {
	m.lastScope = sc
	return []domain.SealSummary{}, m.err
}
func (m *monitorStore) ListNotifications(_ context.Context, uid int64, _ bool, limit int, _ int64) ([]domain.Notification, int, error) {
	m.lastScope.UserID = uid
	items := make([]domain.Notification, limit)
	for i := range items {
		items[i].ID = int64(100 - i)
	}
	return items, 3, m.err
}
func (m *monitorStore) MarkNotificationRead(_ context.Context, uid, id int64) error {
	if id != 5 || uid != 10 {
		return domain.ErrNotFound
	}
	return nil
}
func (m *monitorStore) MarkAllNotificationsRead(context.Context, int64) (int64, error) {
	return 3, m.err
}
func (m *monitorStore) ListAuditLogs(_ context.Context, f usecase.AuditLogFilter) ([]domain.AuditLogEntry, error) {
	m.lastLogs = f
	return []domain.AuditLogEntry{}, m.err
}
func (m *monitorStore) CreateAuditReport(_ context.Context, p usecase.CreateAuditReportParams) (domain.AuditReport, error) {
	m.lastReport = p
	return domain.AuditReport{ID: 1, ContractID: p.ContractID, Status: "draf"}, m.err
}
func (m *monitorStore) ListAuditReports(_ context.Context, sc usecase.Scope, _ *int64, _ string) ([]domain.AuditReport, error) {
	m.lastScope = sc
	return []domain.AuditReport{}, m.err
}
func (m *monitorStore) GetAuditReport(_ context.Context, id int64, _ usecase.Scope) (domain.AuditReport, error) {
	return domain.AuditReport{ID: id}, m.err
}
func (m *monitorStore) PublishAuditReport(_ context.Context, id int64, _ usecase.Scope, _ string) (domain.AuditReport, error) {
	return domain.AuditReport{ID: id, Status: "terbit"}, m.err
}
func (m *monitorStore) ListReportActions(_ context.Context, _ int64, sc usecase.Scope) ([]domain.ReportAction, error) {
	m.lastScope = sc
	return []domain.ReportAction{}, m.err
}
func (m *monitorStore) AddReportAction(_ context.Context, p usecase.ReportActionParams) (domain.ReportAction, domain.ReportStatus, error) {
	m.lastAction = p
	return domain.ReportAction{ID: 1, Tindakan: p.Tindakan}, domain.ReportStatusDiverifikasi, m.err
}
func (m *monitorStore) RegionIDsForUser(context.Context, int64, domain.UserRole) ([]int64, error) {
	return m.regions, nil
}
func (m *monitorStore) ListRegionRules(context.Context, []int64) ([]domain.RegionRule, error) {
	return []domain.RegionRule{}, nil
}
func (m *monitorStore) CreateRegionRule(_ context.Context, p usecase.CreateRegionRuleParams) (domain.RegionRule, error) {
	m.lastRule = p
	return domain.RegionRule{ID: 1, RegionID: p.RegionID}, m.err
}
func (m *monitorStore) ListPengawas(context.Context, []int64, string) ([]domain.Pengawas, error) {
	return []domain.Pengawas{}, nil
}
func (m *monitorStore) ListOversightAssignments(context.Context, []int64, *int64) ([]domain.OversightAssignment, error) {
	return []domain.OversightAssignment{}, nil
}
func (m *monitorStore) CreateOversightAssignment(_ context.Context, p usecase.AssignOversightParams) (domain.OversightAssignment, error) {
	m.lastAssign = p
	return domain.OversightAssignment{ID: 1}, m.err
}
func (m *monitorStore) UpdateProfile(_ context.Context, p usecase.UpdateProfileParams) (domain.User, error) {
	m.lastProfile = p
	cp := int64(4)
	return domain.User{ID: p.UserID, Role: p.Role, Name: "Nama Baru", CounterpartyID: &cp, CounterpartyName: "CV Maju"}, m.err
}
func (m *monitorStore) UserByID(_ context.Context, id int64) (domain.User, error) {
	return domain.User{ID: id, PasswordHash: m.pwHash}, nil
}
func (m *monitorStore) UserByEmail(_ context.Context, email string) (domain.User, error) {
	if email != "ada@desa.id" {
		return domain.User{}, domain.ErrNotFound
	}
	return domain.User{ID: 9, Email: email}, nil
}
func (m *monitorStore) ChangePassword(_ context.Context, _ int64, h, _ string) error {
	m.changedTo = h
	return nil
}
func (m *monitorStore) CreatePasswordReset(_ context.Context, _ int64, h string, _ time.Duration) error {
	m.resetCreated, m.resetHash = true, h
	return nil
}
func (m *monitorStore) ResetPassword(_ context.Context, h, _, _ string) error {
	if h != m.resetHash {
		return domain.ErrNotFound
	}
	return nil
}

const monSecret = "secret-key-for-monitoring-unit-tests-min32bytes"

func tok(t *testing.T, uid int64, role domain.UserRole, village *int64) string {
	t.Helper()
	s, err := usecase.IssueToken(uid, role, village, monSecret, time.Hour)
	if err != nil {
		t.Fatal(err)
	}
	return s
}

func newMonitorMux(m *monitorStore, cache usecase.Cache, dev bool) *http.ServeMux {
	d := &handlers.Deps{Store: m, Secret: monSecret, Cache: cache, ExposeDevTokens: dev}
	auth, opt := handlers.RequireAuth(monSecret), handlers.OptionalAuth(monSecret)
	mux := http.NewServeMux()
	routes := map[string]http.Handler{
		"DELETE /api/v1/contracts/{id}":                     auth(handlers.HandleCancelContract(d)),
		"GET /api/v1/termin":                                auth(handlers.HandleListTermin(d)),
		"GET /api/v1/contracts/{id}/termin":                 auth(handlers.HandleGetContractTermin(d)),
		"PUT /api/v1/contracts/{id}/termin":                 auth(handlers.HandleSetPaymentTerms(d)),
		"PUT /api/v1/contracts/{id}/spk":                    auth(handlers.HandleSetSPK(d)),
		"POST /api/v1/contracts/{id}/progress":              auth(handlers.HandleReportProgress(d)),
		"POST /api/v1/contracts/{id}/termin/{termId}/bayar": auth(handlers.HandlePayTerm(d)),
		"GET /api/v1/public/seals/verify":                   opt(handlers.HandleVerifySeal(d)),
		"GET /api/v1/seals":                                 auth(handlers.HandleListSeals(d)),
		"GET /api/v1/notifications":                         auth(handlers.HandleListNotifications(d)),
		"POST /api/v1/notifications/read-all":               auth(handlers.HandleMarkAllNotificationsRead(d)),
		"POST /api/v1/notifications/{id}/read":              auth(handlers.HandleMarkNotificationRead(d)),
		"GET /api/v1/audit-logs":                            auth(handlers.HandleListAuditLogs(d)),
		"POST /api/v1/audit-reports":                        auth(handlers.HandleCreateAuditReport(d)),
		"GET /api/v1/audit-reports":                         auth(handlers.HandleListAuditReports(d)),
		"GET /api/v1/audit-reports/{id}":                    auth(handlers.HandleGetAuditReport(d)),
		"POST /api/v1/audit-reports/{id}/terbit":            auth(handlers.HandlePublishAuditReport(d)),
		"GET /api/v1/reports/{id}/actions":                  auth(handlers.HandleListReportActions(d)),
		"POST /api/v1/reports/{id}/actions":                 auth(handlers.HandleAddReportAction(d)),
		"GET /api/v1/admin/region-rules":                    auth(handlers.HandleListRegionRules(d)),
		"POST /api/v1/admin/region-rules":                   auth(handlers.HandleCreateRegionRule(d)),
		"GET /api/v1/admin/pengawas":                        auth(handlers.HandleListPengawas(d)),
		"GET /api/v1/admin/oversight-assignments":           auth(handlers.HandleListOversightAssignments(d)),
		"POST /api/v1/admin/oversight-assignments":          auth(handlers.HandleCreateOversightAssignment(d)),
		"PUT /api/v1/auth/me":                               auth(handlers.HandleUpdateMe(d)),
		"POST /api/v1/auth/password/change":                 auth(handlers.HandleChangePassword(d)),
		"POST /api/v1/auth/password/forgot":                 handlers.HandleForgotPassword(d),
		"POST /api/v1/auth/password/reset":                  handlers.HandleResetPassword(d),
	}
	for p, h := range routes {
		mux.Handle(p, h)
	}
	return mux
}

func do(mux http.Handler, method, path, token, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	return w
}

func monCode(t *testing.T, w *httptest.ResponseRecorder) string {
	t.Helper()
	var e handlers.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &e)
	return e.Code
}

// TestMonitoringRoleChecks: setiap endpoint menolak role yang tidak berhak sebelum menyentuh store, dan menerima role yang berhak.
func TestMonitoringRoleChecks(t *testing.T) {
	v := int64(1)
	kades, warga, penyedia := tok(t, 10, domain.RoleKades, &v), tok(t, 20, domain.RoleWarga, &v), tok(t, 30, domain.RolePenyedia, nil)
	insp, bpd, admin := tok(t, 40, domain.RoleInspektorat, nil), tok(t, 50, domain.RoleBPD, &v), tok(t, 60, domain.RoleAdminDaerah, nil)

	terms := `{"terms":[{"persen":100,"jatuhTempo":"2026-12-01"}]}`
	spk := `{"nomor":"027/SPK/2026","tanggal":"2026-11-01","mulai":"2026-11-02","selesai":"2027-01-31"}`
	prog := `{"persenSelesai":40,"catatan":"Pondasi","termId":3,"buktiUrl":["https://cdn.desa.id/a.jpg"]}`
	lhp := `{"contractId":12,"jenis":"lhp","ringkasan":"ok","findings":[{"objek":"termin","temuan":"bayar mendahului progres","tingkat":"kritis","rekomendasi":"tahan termin 2"}]}`
	act := `{"tindakan":"klarifikasi","catatan":"sedang dicek"}`
	rule := `{"ambangPembelianLangsung":200000000,"berlakuSejak":"2027-01-01"}`
	assign := `{"contractId":12,"pengawasUserId":40,"jenis":"inspektorat"}`

	cases := []struct {
		name, method, path, body string
		token                    string
		want                     int
	}{
		{"termin list warga ditolak", "GET", "/api/v1/termin", "", warga, 403},
		{"termin list penyedia", "GET", "/api/v1/termin", "", penyedia, 200},
		{"termin detail bpd", "GET", "/api/v1/contracts/12/termin", "", bpd, 200},
		{"termin detail tanpa token", "GET", "/api/v1/contracts/12/termin", "", "", 401},
		{"set termin penyedia ditolak", "PUT", "/api/v1/contracts/12/termin", terms, penyedia, 403},
		{"set termin kades", "PUT", "/api/v1/contracts/12/termin", terms, kades, 200},
		{"spk bpd ditolak", "PUT", "/api/v1/contracts/12/spk", spk, bpd, 403},
		{"spk kades", "PUT", "/api/v1/contracts/12/spk", spk, kades, 200},
		{"progres inspektorat ditolak", "POST", "/api/v1/contracts/12/progress", prog, insp, 403},
		{"progres penyedia", "POST", "/api/v1/contracts/12/progress", prog, penyedia, 201},
		{"bayar penyedia ditolak", "POST", "/api/v1/contracts/12/termin/3/bayar", "", penyedia, 403},
		{"bayar kades tanpa body", "POST", "/api/v1/contracts/12/termin/3/bayar", "", kades, 200},
		{"segel list warga ditolak", "GET", "/api/v1/seals", "", warga, 403},
		{"segel list inspektorat", "GET", "/api/v1/seals", "", insp, 200},
		{"audit log warga ditolak", "GET", "/api/v1/audit-logs", "", warga, 403},
		{"audit log kades", "GET", "/api/v1/audit-logs?from=2026-11-01&to=2026-11-10&contractId=12", "", kades, 200},
		{"lhp kades tidak boleh buat", "POST", "/api/v1/audit-reports", lhp, kades, 403},
		{"lhp inspektorat buat", "POST", "/api/v1/audit-reports", lhp, insp, 201},
		{"lhp penyedia tidak boleh baca", "GET", "/api/v1/audit-reports", "", penyedia, 403},
		{"lhp kades baca", "GET", "/api/v1/audit-reports", "", kades, 200},
		{"lhp detail bpd", "GET", "/api/v1/audit-reports/1", "", bpd, 200},
		{"lhp terbit kades ditolak", "POST", "/api/v1/audit-reports/1/terbit", "", kades, 403},
		{"lhp terbit inspektorat", "POST", "/api/v1/audit-reports/1/terbit", "", insp, 200},
		{"aksi laporan warga ditolak", "POST", "/api/v1/reports/5/actions", act, warga, 403},
		{"aksi laporan penyedia ditolak", "POST", "/api/v1/reports/5/actions", act, penyedia, 403},
		{"aksi laporan bpd", "POST", "/api/v1/reports/5/actions", act, bpd, 201},
		{"riwayat aksi warga", "GET", "/api/v1/reports/5/actions", "", warga, 200},
		{"riwayat aksi penyedia ditolak", "GET", "/api/v1/reports/5/actions", "", penyedia, 403},
		{"aturan wilayah kades ditolak", "GET", "/api/v1/admin/region-rules", "", kades, 403},
		{"aturan wilayah admin", "GET", "/api/v1/admin/region-rules", "", admin, 200},
		{"aturan wilayah inspektorat baca", "GET", "/api/v1/admin/region-rules", "", insp, 200},
		{"aturan wilayah inspektorat tidak boleh buat", "POST", "/api/v1/admin/region-rules", rule, insp, 403},
		{"aturan wilayah admin buat", "POST", "/api/v1/admin/region-rules", rule, admin, 201},
		{"pengawas admin", "GET", "/api/v1/admin/pengawas?jenis=bpd", "", admin, 200},
		{"penugasan kades ditolak", "POST", "/api/v1/admin/oversight-assignments", assign, kades, 403},
		{"penugasan admin", "POST", "/api/v1/admin/oversight-assignments", assign, admin, 201},
		{"daftar penugasan admin", "GET", "/api/v1/admin/oversight-assignments?contractId=12", "", admin, 200},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			m := &monitorStore{regions: []int64{1}}
			w := do(newMonitorMux(m, nil, false), c.method, c.path, c.token, c.body)
			if w.Code != c.want {
				t.Fatalf("want %d, got %d: %s", c.want, w.Code, w.Body.String())
			}
			if c.want == 403 && monCode(t, w) != "FORBIDDEN" {
				t.Fatalf("403 harus ber-code FORBIDDEN: %s", w.Body.String())
			}
		})
	}
}

func TestMonitoringScopeAndParams(t *testing.T) {
	v := int64(7)
	m := &monitorStore{regions: []int64{1}}
	mux := newMonitorMux(m, nil, false)

	do(mux, "GET", "/api/v1/contracts/12/termin", tok(t, 10, domain.RoleKades, &v), "")
	if m.lastScope.UserID != 10 || m.lastScope.Role != domain.RoleKades || m.lastScope.VillageID == nil || *m.lastScope.VillageID != 7 {
		t.Fatalf("scope harus dari token, dapat %+v", m.lastScope)
	}

	do(mux, "PUT", "/api/v1/contracts/12/termin", tok(t, 10, domain.RoleKades, &v), `{"terms":[{"persen":40,"jatuhTempo":"2026-12-01"},{"persen":60,"jatuhTempo":"2027-01-01"}]}`)
	if len(m.lastTerms.Terms) != 2 || m.lastTerms.Terms[1].Persen != 60 || m.lastTerms.ContractID != 12 {
		t.Fatalf("termin tidak diteruskan: %+v", m.lastTerms)
	}

	do(mux, "GET", "/api/v1/audit-logs?actorId=3&to=2026-11-10&limit=500&aksi=contract.send", tok(t, 40, domain.RoleInspektorat, nil), "")
	if m.lastLogs.Limit != 200 || m.lastLogs.ActorID == nil || *m.lastLogs.ActorID != 3 || m.lastLogs.To != "2026-11-10" || m.lastLogs.Aksi != "contract.send" {
		t.Fatalf("filter audit log salah: %+v", m.lastLogs)
	}

	do(mux, "POST", "/api/v1/reports/5/actions", tok(t, 50, domain.RoleBPD, &v), `{"tindakan":"eskalasi"}`)
	if m.lastAction.DiteruskanKeRole != "inspektorat" {
		t.Fatalf("eskalasi default harus ke inspektorat, dapat %q", m.lastAction.DiteruskanKeRole)
	}
	w := do(mux, "POST", "/api/v1/reports/5/actions", tok(t, 40, domain.RoleInspektorat, nil), `{"tindakan":"eskalasi"}`)
	if w.Code != 403 {
		t.Fatalf("inspektorat tidak boleh eskalasi, dapat %d", w.Code)
	}

	do(mux, "POST", "/api/v1/admin/region-rules", tok(t, 60, domain.RoleAdminDaerah, nil), `{"ambangPenawaran":5,"berlakuSejak":"2027-01-01"}`)
	if m.lastRule.RegionID != 1 {
		t.Fatalf("regionId harus default ke satu-satunya wilayah admin, dapat %d", m.lastRule.RegionID)
	}
	w = do(mux, "POST", "/api/v1/admin/region-rules", tok(t, 60, domain.RoleAdminDaerah, nil), `{"regionId":2,"ambangPenawaran":5,"berlakuSejak":"2027-01-01"}`)
	if w.Code != 403 {
		t.Fatalf("regionId di luar wilayah harus 403, dapat %d", w.Code)
	}
}

func TestAdminWithoutRegionForbidden(t *testing.T) {
	m := &monitorStore{}
	w := do(newMonitorMux(m, nil, false), "GET", "/api/v1/admin/region-rules", tok(t, 60, domain.RoleAdminDaerah, nil), "")
	if w.Code != 403 {
		t.Fatalf("admin tanpa wilayah harus 403, dapat %d", w.Code)
	}
}

func TestMonitoringValidation(t *testing.T) {
	v := int64(1)
	kades, penyedia, insp := tok(t, 10, domain.RoleKades, &v), tok(t, 30, domain.RolePenyedia, nil), tok(t, 40, domain.RoleInspektorat, nil)
	cases := []struct {
		name, method, path, token, body string
	}{
		{"tanggal termin salah", "PUT", "/api/v1/contracts/12/termin", kades, `{"terms":[{"persen":100,"jatuhTempo":"01-12-2026"}]}`},
		{"field tak dikenal", "PUT", "/api/v1/contracts/12/termin", kades, `{"terms":[],"x":1}`},
		{"id kontrak bukan angka", "GET", "/api/v1/contracts/abc/termin", kades, ""},
		{"spk selesai sebelum mulai", "PUT", "/api/v1/contracts/12/spk", kades, `{"nomor":"1","tanggal":"2026-11-01","mulai":"2026-12-01","selesai":"2026-11-02"}`},
		{"persen > 100", "POST", "/api/v1/contracts/12/progress", penyedia, `{"persenSelesai":120}`},
		{"bukti bukan https", "POST", "/api/v1/contracts/12/progress", penyedia, `{"persenSelesai":10,"buktiUrl":["http://x.id/a.jpg"]}`},
		{"bukti javascript", "POST", "/api/v1/contracts/12/progress", penyedia, `{"persenSelesai":10,"buktiUrl":["javascript:alert(1)"]}`},
		{"realisasi negatif", "POST", "/api/v1/contracts/12/termin/3/bayar", kades, `{"realisasiNominal":-1}`},
		{"tanggal audit log salah", "GET", "/api/v1/audit-logs?from=kemarin", kades, ""},
		{"limit salah", "GET", "/api/v1/audit-logs?limit=-1", kades, ""},
		{"aksi mengandung karakter terlarang", "GET", "/api/v1/audit-logs?aksi=contract.send%27%3B--", kades, ""},
		{"jenis lhp salah", "POST", "/api/v1/audit-reports", insp, `{"contractId":12,"jenis":"x"}`},
		{"objek temuan salah", "POST", "/api/v1/audit-reports", insp, `{"contractId":12,"jenis":"lhp","findings":[{"objek":"x","temuan":"a","tingkat":"kritis"}]}`},
		{"tindakan laporan salah", "POST", "/api/v1/reports/5/actions", kades, `{"tindakan":"hapus"}`},
		{"status lhp salah", "GET", "/api/v1/audit-reports?status=x", kades, ""},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			w := do(newMonitorMux(&monitorStore{}, nil, false), c.method, c.path, c.token, c.body)
			if w.Code != 400 || monCode(t, w) != "INVALID_INPUT" {
				t.Fatalf("want 400 INVALID_INPUT, got %d: %s", w.Code, w.Body.String())
			}
		})
	}
}

func TestMonitoringStoreErrorMapping(t *testing.T) {
	v := int64(1)
	kades := tok(t, 10, domain.RoleKades, &v)
	cases := []struct {
		err  error
		code int
		kode string
	}{
		{domain.ErrForbidden, 403, "FORBIDDEN"},
		{domain.ErrNotFound, 404, "NOT_FOUND"},
		{domain.ErrAlreadyPaid, 409, "ALREADY_PAID"},
		{usecase.CanPayTerm(domain.StatusPublished, domain.TermRencana), 409, "INVALID_STATE"},
		{context.DeadlineExceeded, 500, "INTERNAL"},
	}
	for _, c := range cases {
		w := do(newMonitorMux(&monitorStore{err: c.err}, nil, false), "POST", "/api/v1/contracts/12/termin/3/bayar", kades, "")
		if w.Code != c.code || monCode(t, w) != c.kode {
			t.Errorf("%v: want %d %s, got %d %s", c.err, c.code, c.kode, w.Code, w.Body.String())
		}
		if strings.Contains(w.Body.String(), "deadline") {
			t.Errorf("detail error internal bocor: %s", w.Body.String())
		}
	}
}

func TestProgressInvalidatesPublicCache(t *testing.T) {
	cache := newMemCache()
	ctx := context.Background()
	_ = cache.Set(ctx, usecase.KeyPublicContract(12), []byte(`{}`), time.Minute)
	_ = cache.Set(ctx, usecase.KeyPublicContracts(1, 0), []byte(`[]`), time.Minute)
	w := do(newMonitorMux(&monitorStore{}, cache, false), "POST", "/api/v1/contracts/12/progress", tok(t, 30, domain.RolePenyedia, nil), `{"persenSelesai":50}`)
	if w.Code != 201 {
		t.Fatalf("progres gagal: %d %s", w.Code, w.Body.String())
	}
	if cache.has(usecase.KeyPublicContract(12)) || cache.has(usecase.KeyPublicContracts(1, 0)) {
		t.Fatal("cache publik kontrak dan daftar desa harus dihapus setelah progres")
	}
}

func TestVerifySealPublic(t *testing.T) {
	m := &monitorStore{}
	mux := newMonitorMux(m, nil, false)
	h := strings.Repeat("AB", 32)

	w := do(mux, "GET", "/api/v1/public/seals/verify?hash="+h, "", "")
	if w.Code != 200 || m.verifyHash != strings.ToLower(h) || m.verifier != nil {
		t.Fatalf("verifikasi anonim gagal: %d hash=%q verifier=%v", w.Code, m.verifyHash, m.verifier)
	}
	do(mux, "GET", "/api/v1/public/seals/verify?hash="+h, tok(t, 20, domain.RoleWarga, nil), "")
	if m.verifier == nil || *m.verifier != 20 {
		t.Fatal("verifikator login harus dicatat")
	}
	w = do(mux, "GET", "/api/v1/public/seals/verify?hash=abc", "", "")
	if w.Code != 400 || monCode(t, w) != "INVALID_HASH" {
		t.Fatalf("hash pendek harus 400 INVALID_HASH, dapat %d %s", w.Code, w.Body.String())
	}
}

func TestNotificationsHandlers(t *testing.T) {
	m := &monitorStore{}
	mux := newMonitorMux(m, nil, false)
	user := tok(t, 10, domain.RoleWarga, nil)

	w := do(mux, "GET", "/api/v1/notifications?limit=2", user, "")
	var res handlers.NotificationListResponse
	_ = json.Unmarshal(w.Body.Bytes(), &res)
	if w.Code != 200 || res.UnreadCount != 3 || res.NextBefore == nil || *res.NextBefore != 99 || m.lastScope.UserID != 10 {
		t.Fatalf("daftar notifikasi salah: %d %s", w.Code, w.Body.String())
	}
	if w := do(mux, "POST", "/api/v1/notifications/5/read", user, ""); w.Code != 204 {
		t.Fatalf("tandai baca milik sendiri harus 204, dapat %d", w.Code)
	}
	if w := do(mux, "POST", "/api/v1/notifications/5/read", tok(t, 11, domain.RoleWarga, nil), ""); w.Code != 404 {
		t.Fatalf("notifikasi orang lain harus 404, dapat %d", w.Code)
	}
	if w := do(mux, "POST", "/api/v1/notifications/read-all", user, ""); w.Code != 200 || !strings.Contains(w.Body.String(), `"updated":3`) {
		t.Fatalf("baca semua salah: %d %s", w.Code, w.Body.String())
	}
}

func TestProfileUpdate(t *testing.T) {
	m := &monitorStore{}
	mux := newMonitorMux(m, nil, false)
	penyedia := tok(t, 30, domain.RolePenyedia, nil)

	w := do(mux, "PUT", "/api/v1/auth/me", penyedia, `{"nama":"Budi Santoso","usaha":{"nama":"CV Maju","npwp":"01.234.567.8-405.000","alamat":"Jl. Raya 1"}}`)
	if w.Code != 200 || m.lastProfile.Usaha == nil || m.lastProfile.UserID != 30 || !strings.Contains(w.Body.String(), `"usaha":{"id":4`) {
		t.Fatalf("update profil usaha gagal: %d %s", w.Code, w.Body.String())
	}
	bad := []struct{ token, body string }{
		{penyedia, `{"noHp":"0812345678"}`},                                        // noHp hanya warga
		{tok(t, 20, domain.RoleWarga, nil), `{"usaha":{"nama":"x","alamat":"y"}}`}, // usaha hanya penyedia
		{penyedia, `{"usaha":{"nama":"CV Maju","npwp":"abc","alamat":"Jl. Raya 1"}}`},
		{penyedia, `{"nama":"ab"}`},
		{tok(t, 20, domain.RoleWarga, nil), `{"noHp":"08-12"}`},
	}
	for _, b := range bad {
		if w := do(mux, "PUT", "/api/v1/auth/me", b.token, b.body); w.Code != 400 {
			t.Errorf("%s: harus 400, dapat %d", b.body, w.Code)
		}
	}
}

func TestChangePassword(t *testing.T) {
	h, _ := bcrypt.GenerateFromPassword([]byte("lama12345"), bcrypt.MinCost)
	m := &monitorStore{pwHash: string(h)}
	mux := newMonitorMux(m, nil, false)
	user := tok(t, 10, domain.RoleKades, nil)

	// Kata sandi demo lama tidak boleh berlaku lagi.
	if w := do(mux, "POST", "/api/v1/auth/password/change", user, `{"passwordLama":"saksi123","passwordBaru":"baru12345"}`); w.Code != 400 || monCode(t, w) != "WRONG_PASSWORD" {
		t.Fatalf("sandi demo harus ditolak: %d %s", w.Code, w.Body.String())
	}
	if w := do(mux, "POST", "/api/v1/auth/password/change", user, `{"passwordLama":"lama12345","passwordBaru":"pendek"}`); w.Code != 400 {
		t.Fatalf("sandi baru pendek harus 400, dapat %d", w.Code)
	}
	if w := do(mux, "POST", "/api/v1/auth/password/change", user, `{"passwordLama":"lama12345","passwordBaru":"baru12345"}`); w.Code != 204 || m.changedTo == "" {
		t.Fatalf("ganti sandi gagal: %d", w.Code)
	}
}

func TestForgotAndResetPassword(t *testing.T) {
	for _, dev := range []bool{false, true} {
		m := &monitorStore{}
		mux := newMonitorMux(m, nil, dev)

		unknown := do(mux, "POST", "/api/v1/auth/password/forgot", "", `{"email":"tidak@ada.id"}`)
		known := do(mux, "POST", "/api/v1/auth/password/forgot", "", `{"email":"ada@desa.id"}`)
		if unknown.Code != 202 || known.Code != 202 || !m.resetCreated {
			t.Fatalf("dev=%v: forgot harus 202 dan membuat token: %d %d", dev, unknown.Code, known.Code)
		}
		var res handlers.ForgotPasswordResponse
		_ = json.Unmarshal(known.Body.Bytes(), &res)
		if !dev {
			if res.DevToken != "" || unknown.Body.String() != known.Body.String() {
				t.Fatalf("produksi tidak boleh membocorkan token atau keberadaan email: %s vs %s", unknown.Body.String(), known.Body.String())
			}
			continue
		}
		if res.DevToken == "" || usecase.HashResetToken(res.DevToken) != m.resetHash || strings.Contains(m.resetHash, res.DevToken) {
			t.Fatal("dev: token harus dikembalikan dan hanya hash-nya yang disimpan")
		}
		if w := do(mux, "POST", "/api/v1/auth/password/reset", "", `{"token":"salah","password":"baru12345"}`); w.Code != 400 || monCode(t, w) != "TOKEN_INVALID" {
			t.Fatalf("token salah harus TOKEN_INVALID: %d %s", w.Code, w.Body.String())
		}
		if w := do(mux, "POST", "/api/v1/auth/password/reset", "", `{"token":"`+res.DevToken+`","password":"baru12345"}`); w.Code != 204 {
			t.Fatalf("reset dengan token benar harus 204, dapat %d %s", w.Code, w.Body.String())
		}
	}
	if w := do(newMonitorMux(&monitorStore{}, nil, false), "POST", "/api/v1/auth/password/forgot", "", `{"email":"bukan-email"}`); w.Code != 400 {
		t.Fatalf("email tidak valid harus 400, dapat %d", w.Code)
	}
}

func TestCancelContractHandler(t *testing.T) {
	v := int64(1)
	kades, perangkat := tok(t, 10, domain.RoleKades, &v), tok(t, 11, domain.RolePerangkatDesa, &v)

	// Hanya kades/perangkat_desa; role lain 403 FORBIDDEN sebelum menyentuh store.
	for name, token := range map[string]string{
		"warga": tok(t, 20, domain.RoleWarga, &v), "penyedia": tok(t, 30, domain.RolePenyedia, nil),
		"bpd": tok(t, 50, domain.RoleBPD, &v), "inspektorat": tok(t, 40, domain.RoleInspektorat, nil),
	} {
		m := &monitorStore{}
		w := do(newMonitorMux(m, nil, false), "DELETE", "/api/v1/contracts/12", token, "")
		if w.Code != 403 || monCode(t, w) != "FORBIDDEN" || m.lastCancel.ContractID != 0 {
			t.Errorf("%s: want 403 FORBIDDEN tanpa menyentuh store, got %d %s", name, w.Code, w.Body.String())
		}
	}
	if w := do(newMonitorMux(&monitorStore{}, nil, false), "DELETE", "/api/v1/contracts/12", "", ""); w.Code != 401 {
		t.Errorf("tanpa token harus 401, dapat %d", w.Code)
	}
	if w := do(newMonitorMux(&monitorStore{}, nil, false), "DELETE", "/api/v1/contracts/abc", kades, ""); w.Code != 400 || monCode(t, w) != "INVALID_INPUT" {
		t.Errorf("id bukan angka harus 400, dapat %d", w.Code)
	}

	// Sukses: 204 tanpa body, scope dan id dari token/path.
	for _, token := range []string{kades, perangkat} {
		m := &monitorStore{}
		w := do(newMonitorMux(m, nil, false), "DELETE", "/api/v1/contracts/12", token, "")
		if w.Code != 204 || w.Body.Len() != 0 {
			t.Fatalf("want 204 tanpa body, got %d %q", w.Code, w.Body.String())
		}
		if m.lastCancel.ContractID != 12 || m.lastCancel.Scope.VillageID == nil || *m.lastCancel.Scope.VillageID != 1 {
			t.Fatalf("param pembatalan salah: %+v", m.lastCancel)
		}
	}

	// Status terlarang: 409 CONTRACT_LOCKED (pesan Indonesia); desa lain/tidak ada: 404 NOT_FOUND.
	w := do(newMonitorMux(&monitorStore{err: domain.ErrContractNotEditable}, nil, false), "DELETE", "/api/v1/contracts/12", kades, "")
	if w.Code != 409 || monCode(t, w) != "CONTRACT_LOCKED" || !strings.Contains(w.Body.String(), "penandatanganan") {
		t.Errorf("want 409 CONTRACT_LOCKED, got %d %s", w.Code, w.Body.String())
	}
	w = do(newMonitorMux(&monitorStore{err: domain.ErrNotFound}, nil, false), "DELETE", "/api/v1/contracts/12", kades, "")
	if w.Code != 404 || monCode(t, w) != "NOT_FOUND" {
		t.Errorf("want 404 NOT_FOUND, got %d %s", w.Code, w.Body.String())
	}
}

func TestCancelContractInvalidatesCaches(t *testing.T) {
	cache := newMemCache()
	ctx := context.Background()
	_ = cache.Set(ctx, usecase.KeyPublicContract(12), []byte(`{}`), time.Minute)
	_ = cache.Set(ctx, usecase.KeyPublicContracts(1, 0), []byte(`[]`), time.Minute)
	_ = cache.Set(ctx, usecase.KeyMetrics(10), []byte(`{}`), time.Minute)
	_ = cache.Set(ctx, usecase.KeyMetrics(77), []byte(`{}`), time.Minute)
	v := int64(1)
	if w := do(newMonitorMux(&monitorStore{}, cache, false), "DELETE", "/api/v1/contracts/12", tok(t, 10, domain.RoleKades, &v), ""); w.Code != 204 {
		t.Fatalf("pembatalan gagal: %d", w.Code)
	}
	for _, k := range []string{usecase.KeyPublicContract(12), usecase.KeyPublicContracts(1, 0), usecase.KeyMetrics(10), usecase.KeyMetrics(77)} {
		if cache.has(k) {
			t.Errorf("cache %s harus dihapus setelah pembatalan", k)
		}
	}
}

// Kontrak dibatalkan terkunci di handler audit dan publikasi: 409 CONTRACT_LOCKED sebelum memanggil AI.
func TestCancelledContractLockedForAuditAndPublish(t *testing.T) {
	c := newTC(t, domain.StatusCancelled)
	for _, path := range []string{"/api/v1/contracts/42/audit", "/api/v1/contracts/42/publish"} {
		w := c.do("POST", path, 1, domain.RoleKades, 1, nil)
		if w.Code != http.StatusConflict || monCode(t, w) != "CONTRACT_LOCKED" {
			t.Errorf("%s: want 409 CONTRACT_LOCKED, got %d %s", path, w.Code, w.Body.String())
		}
	}
	if c.ai.auditCalls != 0 || c.ai.redactCalls != 0 || len(c.store.savedAudits) != 0 || c.store.published != nil {
		t.Fatalf("AI tidak boleh dipanggil dan tidak ada yang disimpan: audit=%d redact=%d", c.ai.auditCalls, c.ai.redactCalls)
	}
}
