package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// HandleVerifySeal: GET /public/seals/verify?hash= — publik, token opsional.
func HandleVerifySeal(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLSealVerify(ClientIP(r, d.TrustedProxies)), usecase.LimitSealVerify, usecase.WindowSealVerify) {
			w.Header().Set("Retry-After", strconv.Itoa(int(usecase.WindowSealVerify.Seconds())))
			WriteErrorCode(w, http.StatusTooManyRequests, "RATE_LIMITED", "terlalu banyak verifikasi, coba lagi sebentar lagi")
			return
		}
		hash, err := usecase.NormalizeSealHash(r.URL.Query().Get("hash"))
		if err != nil {
			WriteErrorCode(w, http.StatusBadRequest, "INVALID_HASH", "hash harus SHA-256 heksadesimal 64 karakter")
			return
		}
		var verifier *int64
		if uid, _, _ := ClaimsFromContext(r.Context()); uid > 0 {
			verifier = &uid
		}
		res, err := d.Store.VerifySeal(r.Context(), hash, verifier)
		if err != nil {
			writeDomainErr(w, err, "segel tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, res)
	}
}

// HandleListSeals: GET /seals — segel kontrak dalam cakupan pemanggil.
func HandleListSeals(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.CanViewMonitoring(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke daftar segel")
			return
		}
		list, err := d.Store.ListSeals(r.Context(), sc)
		if err != nil {
			writeDomainErr(w, err, "segel tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

type NotificationListResponse struct {
	Items       []domain.Notification `json:"items"`
	UnreadCount int                   `json:"unreadCount"`
	NextBefore  *int64                `json:"nextBefore"`
}

// HandleListNotifications: GET /notifications — milik sendiri.
func HandleListNotifications(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, _, _ := ClaimsFromContext(r.Context())
		limit, before, ok := pageParams(w, r)
		if !ok {
			return
		}
		items, unread, err := d.Store.ListNotifications(r.Context(), uid, r.URL.Query().Get("unread") == "true", limit, before)
		if err != nil {
			writeDomainErr(w, err, "notifikasi tidak ditemukan")
			return
		}
		var last int64
		if len(items) > 0 {
			last = items[len(items)-1].ID
		}
		WriteJSON(w, http.StatusOK, NotificationListResponse{Items: items, UnreadCount: unread, NextBefore: nextBefore(len(items), limit, last)})
	}
}

// HandleMarkNotificationRead: POST /notifications/{id}/read.
func HandleMarkNotificationRead(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, _, _ := ClaimsFromContext(r.Context())
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		if err := d.Store.MarkNotificationRead(r.Context(), uid, id); err != nil {
			writeDomainErr(w, err, "notifikasi tidak ditemukan")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

// HandleMarkAllNotificationsRead: POST /notifications/read-all.
func HandleMarkAllNotificationsRead(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, _, _ := ClaimsFromContext(r.Context())
		n, err := d.Store.MarkAllNotificationsRead(r.Context(), uid)
		if err != nil {
			writeDomainErr(w, err, "notifikasi tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, map[string]int64{"updated": n})
	}
}

type ReportActionRequest struct {
	Tindakan         string `json:"tindakan"`
	Catatan          string `json:"catatan"`
	Status           string `json:"status,omitempty"`
	DiteruskanKeRole string `json:"diteruskanKeRole,omitempty"`
}

type ReportActionResponse struct {
	Action domain.ReportAction `json:"action"`
	Status domain.ReportStatus `json:"status"`
}

func isReportOfficer(r domain.UserRole) bool {
	return usecase.IsDesa(r) || r == domain.RoleBPD || r == domain.RoleInspektorat
}

// HandleListReportActions: GET /reports/{id}/actions — pelapor sendiri atau petugas dalam cakupan.
func HandleListReportActions(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if sc.Role != domain.RoleWarga && !isReportOfficer(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke tindak lanjut laporan")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		acts, err := d.Store.ListReportActions(r.Context(), id, sc)
		if err != nil {
			writeDomainErr(w, err, "laporan tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusOK, acts)
	}
}

// HandleAddReportAction: POST /reports/{id}/actions — kades/perangkat desa/BPD/inspektorat.
func HandleAddReportAction(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !isReportOfficer(sc.Role) {
			forbid(w, "hanya perangkat desa, BPD, atau inspektorat yang dapat menindaklanjuti laporan")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		var req ReportActionRequest
		if !decodeBody(w, r, &req) {
			return
		}
		req.Tindakan = strings.TrimSpace(req.Tindakan)
		req.Catatan = strings.TrimSpace(req.Catatan)
		if utf8.RuneCountInString(req.Catatan) > 2000 {
			badInput(w, "catatan maksimal 2000 karakter")
			return
		}
		switch req.Tindakan {
		case "klarifikasi", "selesai":
			req.DiteruskanKeRole = ""
		case "eskalasi":
			if sc.Role == domain.RoleInspektorat {
				forbid(w, "inspektorat adalah tujuan eskalasi terakhir")
				return
			}
			if req.DiteruskanKeRole == "" {
				req.DiteruskanKeRole = string(domain.RoleInspektorat)
			}
			if req.DiteruskanKeRole != string(domain.RoleInspektorat) && req.DiteruskanKeRole != string(domain.RoleBPD) {
				badInput(w, "diteruskanKeRole harus bpd atau inspektorat")
				return
			}
		default:
			badInput(w, "tindakan harus klarifikasi, eskalasi, atau selesai")
			return
		}
		act, status, err := d.Store.AddReportAction(r.Context(), usecase.ReportActionParams{ReportID: id, Scope: sc, Tindakan: req.Tindakan,
			Catatan: req.Catatan, Status: strings.TrimSpace(req.Status), DiteruskanKeRole: req.DiteruskanKeRole, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, "laporan tidak ditemukan")
			return
		}
		WriteJSON(w, http.StatusCreated, ReportActionResponse{Action: act, Status: status})
	}
}
