package handlers

import (
	"log/slog"
	"net/http"
	"strings"
	"unicode/utf8"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type AuditLogListResponse struct {
	Items      []domain.AuditLogEntry `json:"items"`
	NextBefore *int64                 `json:"nextBefore"`
}

// HandleListAuditLogs: GET /audit-logs — scope kontrak pemanggil ditambah log milik sendiri.
func HandleListAuditLogs(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.CanViewMonitoring(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke jejak audit")
			return
		}
		limit, before, ok := pageParams(w, r)
		if !ok {
			return
		}
		contractID, ok := queryInt64(w, r, "contractId")
		if !ok {
			return
		}
		actorID, ok := queryInt64(w, r, "actorId")
		if !ok {
			return
		}
		q := r.URL.Query()
		from, to := q.Get("from"), q.Get("to")
		for _, v := range []string{from, to} {
			if _, err := optDate(v); err != nil {
				badInput(w, "from/to harus berformat YYYY-MM-DD")
				return
			}
		}
		aksi := strings.TrimSpace(q.Get("aksi"))
		if !validAksi(aksi) {
			badInput(w, "aksi hanya boleh huruf kecil, angka, titik, atau garis bawah (maks. 64 karakter)")
			return
		}
		items, err := d.Store.ListAuditLogs(r.Context(), usecase.AuditLogFilter{Scope: sc, ContractID: contractID, ActorID: actorID,
			Aksi: aksi, From: from, To: to, Limit: limit, Before: before})
		if err != nil {
			writeDomainErr(w, err, "log tidak ditemukan")
			return
		}
		var last int64
		if len(items) > 0 {
			last = items[len(items)-1].ID
		}
		WriteJSON(w, http.StatusOK, AuditLogListResponse{Items: items, NextBefore: nextBefore(len(items), limit, last)})
	}
}

// validAksi: kode aksi audit_logs (contract.send, user.register, ...); kosong berarti tanpa filter.
func validAksi(s string) bool {
	if len(s) > 64 {
		return false
	}
	for _, c := range s {
		if (c < 'a' || c > 'z') && (c < '0' || c > '9') && c != '.' && c != '_' {
			return false
		}
	}
	return true
}

type CreateAuditReportRequest struct {
	ContractID int64  `json:"contractId"`
	Jenis      string `json:"jenis"`
	Ringkasan  string `json:"ringkasan"`
	Terbit     bool   `json:"terbit"`
	Findings   []struct {
		Objek       string `json:"objek"`
		Temuan      string `json:"temuan"`
		Tingkat     string `json:"tingkat"`
		Rekomendasi string `json:"rekomendasi"`
	} `json:"findings"`
}

const lhpNotFound = "LHP atau kontrak tidak ditemukan"

func canReadLHP(r domain.UserRole) bool {
	return r == domain.RoleInspektorat || usecase.IsDesa(r) || r == domain.RoleBPD
}

// HandleCreateAuditReport: POST /audit-reports (inspektorat).
func HandleCreateAuditReport(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if sc.Role != domain.RoleInspektorat {
			forbid(w, "hanya inspektorat yang dapat menyusun LHP")
			return
		}
		var req CreateAuditReportRequest
		if !decodeBody(w, r, &req) {
			return
		}
		req.Ringkasan = strings.TrimSpace(req.Ringkasan)
		switch {
		case req.ContractID <= 0:
			badInput(w, "contractId wajib diisi")
			return
		case req.Jenis != "lhp" && req.Jenis != "uji_petik":
			badInput(w, "jenis harus lhp atau uji_petik")
			return
		case utf8.RuneCountInString(req.Ringkasan) > 10000:
			badInput(w, "ringkasan maksimal 10000 karakter")
			return
		case len(req.Findings) > usecase.MaxReportFindings:
			badInput(w, "temuan maksimal 50")
			return
		}
		findings := make([]domain.AuditReportFinding, len(req.Findings))
		for i, f := range req.Findings {
			f.Temuan, f.Rekomendasi = strings.TrimSpace(f.Temuan), strings.TrimSpace(f.Rekomendasi)
			if f.Objek != "spk" && f.Objek != "termin" && f.Objek != "pasal" {
				badInput(w, "objek temuan harus spk, termin, atau pasal")
				return
			}
			if f.Tingkat != "kritis" && f.Tingkat != "saran" {
				badInput(w, "tingkat temuan harus kritis atau saran")
				return
			}
			if f.Temuan == "" || utf8.RuneCountInString(f.Temuan) > 5000 || utf8.RuneCountInString(f.Rekomendasi) > 5000 {
				badInput(w, "temuan wajib diisi; temuan dan rekomendasi maksimal 5000 karakter")
				return
			}
			findings[i] = domain.AuditReportFinding{Objek: f.Objek, Temuan: f.Temuan, Tingkat: f.Tingkat, Rekomendasi: f.Rekomendasi}
		}
		rep, err := d.Store.CreateAuditReport(r.Context(), usecase.CreateAuditReportParams{Scope: sc, ContractID: req.ContractID, Jenis: req.Jenis,
			Ringkasan: req.Ringkasan, Terbit: req.Terbit, Findings: findings, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, lhpNotFound)
			return
		}
		WriteJSON(w, http.StatusCreated, rep)
	}
}

// HandleListAuditReports: GET /audit-reports.
func HandleListAuditReports(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !canReadLHP(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke LHP")
			return
		}
		contractID, ok := queryInt64(w, r, "contractId")
		if !ok {
			return
		}
		status := r.URL.Query().Get("status")
		if status != "" && status != "draf" && status != "terbit" {
			badInput(w, "status harus draf atau terbit")
			return
		}
		list, err := d.Store.ListAuditReports(r.Context(), sc, contractID, status)
		if err != nil {
			writeDomainErr(w, err, lhpNotFound)
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

// HandleGetAuditReport: GET /audit-reports/{id}.
func HandleGetAuditReport(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !canReadLHP(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke LHP")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		rep, err := d.Store.GetAuditReport(r.Context(), id, sc)
		if err != nil {
			writeDomainErr(w, err, lhpNotFound)
			return
		}
		WriteJSON(w, http.StatusOK, rep)
	}
}

// HandlePublishAuditReport: POST /audit-reports/{id}/terbit (inspektorat penyusun).
func HandlePublishAuditReport(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if sc.Role != domain.RoleInspektorat {
			forbid(w, "hanya inspektorat yang dapat menerbitkan LHP")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		rep, err := d.Store.PublishAuditReport(r.Context(), id, sc, ClientIP(r, d.TrustedProxies))
		if err != nil {
			writeDomainErr(w, err, lhpNotFound)
			return
		}
		WriteJSON(w, http.StatusOK, rep)
	}
}

// adminRegions: wilayah akun admin_daerah (atau inspektorat bila allowInsp). Menulis 403 bila kosong.
func adminRegions(w http.ResponseWriter, r *http.Request, d *Deps, allowInsp bool) ([]int64, usecase.Scope, bool) {
	sc := scopeOf(r)
	if sc.Role != domain.RoleAdminDaerah && !(allowInsp && sc.Role == domain.RoleInspektorat) {
		forbid(w, "hanya admin daerah yang dapat mengakses menu ini")
		return nil, sc, false
	}
	ids, err := d.Store.RegionIDsForUser(r.Context(), sc.UserID, sc.Role)
	if err != nil {
		writeDomainErr(w, err, "wilayah tidak ditemukan")
		return nil, sc, false
	}
	if len(ids) == 0 {
		forbid(w, "akun ini belum terikat ke wilayah kabupaten/kota")
		return nil, sc, false
	}
	return ids, sc, true
}

// HandleListRegionRules: GET /admin/region-rules.
func HandleListRegionRules(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		regions, _, ok := adminRegions(w, r, d, true)
		if !ok {
			return
		}
		list, err := d.Store.ListRegionRules(r.Context(), regions)
		if err != nil {
			writeDomainErr(w, err, "aturan wilayah tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

type CreateRegionRuleRequest struct {
	RegionID                int64    `json:"regionId,omitempty"`
	AmbangPembelianLangsung *float64 `json:"ambangPembelianLangsung"`
	AmbangPenawaran         *float64 `json:"ambangPenawaran"`
	DasarHukum              string   `json:"dasarHukum"`
	BerlakuSejak            string   `json:"berlakuSejak"`
}

// HandleCreateRegionRule: POST /admin/region-rules (admin_daerah).
func HandleCreateRegionRule(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		regions, sc, ok := adminRegions(w, r, d, false)
		if !ok {
			return
		}
		var req CreateRegionRuleRequest
		if !decodeBody(w, r, &req) {
			return
		}
		if req.RegionID == 0 && len(regions) == 1 {
			req.RegionID = regions[0]
		}
		allowed := false
		for _, id := range regions {
			allowed = allowed || id == req.RegionID
		}
		if !allowed {
			forbid(w, "regionId di luar wilayah Anda")
			return
		}
		since, err := parseDate(req.BerlakuSejak)
		if err != nil {
			badInput(w, "berlakuSejak harus berformat YYYY-MM-DD")
			return
		}
		for _, v := range []*float64{req.AmbangPembelianLangsung, req.AmbangPenawaran} {
			if v != nil && (*v < 0 || *v >= 1e16) {
				badInput(w, "ambang harus angka positif yang wajar")
				return
			}
		}
		if req.AmbangPembelianLangsung == nil && req.AmbangPenawaran == nil {
			badInput(w, "isi minimal satu ambang")
			return
		}
		dasar := strings.TrimSpace(req.DasarHukum)
		if utf8.RuneCountInString(dasar) > 2000 {
			badInput(w, "dasarHukum maksimal 2000 karakter")
			return
		}
		rule, err := d.Store.CreateRegionRule(r.Context(), usecase.CreateRegionRuleParams{ActorID: sc.UserID, RegionID: req.RegionID,
			AmbangPembelianLangsung: req.AmbangPembelianLangsung, AmbangPenawaran: req.AmbangPenawaran, DasarHukum: dasar,
			BerlakuSejak: since, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, "wilayah tidak ditemukan")
			return
		}
		if d.Cache != nil {
			if err := d.Cache.Del(r.Context(), usecase.KeyOptions(req.RegionID)); err != nil {
				slog.Warn("cache del gagal", "err", err)
			}
		}
		WriteJSON(w, http.StatusCreated, rule)
	}
}

// HandleListPengawas: GET /admin/pengawas?jenis=bpd|inspektorat.
func HandleListPengawas(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		regions, _, ok := adminRegions(w, r, d, false)
		if !ok {
			return
		}
		jenis := r.URL.Query().Get("jenis")
		if jenis != "bpd" && jenis != "inspektorat" {
			badInput(w, "jenis harus bpd atau inspektorat")
			return
		}
		list, err := d.Store.ListPengawas(r.Context(), regions, jenis)
		if err != nil {
			writeDomainErr(w, err, "pengawas tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

// HandleListOversightAssignments: GET /admin/oversight-assignments.
func HandleListOversightAssignments(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		regions, _, ok := adminRegions(w, r, d, false)
		if !ok {
			return
		}
		contractID, ok := queryInt64(w, r, "contractId")
		if !ok {
			return
		}
		list, err := d.Store.ListOversightAssignments(r.Context(), regions, contractID)
		if err != nil {
			writeDomainErr(w, err, "penugasan tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

type AssignOversightRequest struct {
	ContractID     int64  `json:"contractId"`
	PengawasUserID int64  `json:"pengawasUserId"`
	Jenis          string `json:"jenis"`
}

// HandleCreateOversightAssignment: POST /admin/oversight-assignments.
func HandleCreateOversightAssignment(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		regions, sc, ok := adminRegions(w, r, d, false)
		if !ok {
			return
		}
		var req AssignOversightRequest
		if !decodeBody(w, r, &req) {
			return
		}
		if req.ContractID <= 0 || req.PengawasUserID <= 0 {
			badInput(w, "contractId dan pengawasUserId wajib diisi")
			return
		}
		if req.Jenis != "bpd" && req.Jenis != "inspektorat" {
			badInput(w, "jenis harus bpd atau inspektorat")
			return
		}
		a, err := d.Store.CreateOversightAssignment(r.Context(), usecase.AssignOversightParams{ActorID: sc.UserID, RegionIDs: regions,
			ContractID: req.ContractID, PengawasUserID: req.PengawasUserID, Jenis: req.Jenis, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, "kontrak tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusCreated, a)
	}
}
