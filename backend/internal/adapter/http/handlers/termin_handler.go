package handlers

import (
	"net/http"
	"net/url"
	"strings"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type SetTermsRequest struct {
	Terms []struct {
		Persen     float64 `json:"persen"`
		JatuhTempo string  `json:"jatuhTempo"`
	} `json:"terms"`
}

type SetSPKRequest struct {
	Nomor   string `json:"nomor"`
	Tanggal string `json:"tanggal"`
	Mulai   string `json:"mulai,omitempty"`
	Selesai string `json:"selesai,omitempty"`
}

type ReportProgressRequest struct {
	PersenSelesai float64  `json:"persenSelesai"`
	Catatan       string   `json:"catatan"`
	TermID        *int64   `json:"termId,omitempty"`
	FileIDs       []int64  `json:"fileIds,omitempty"`
	BuktiURL      []string `json:"buktiUrl,omitempty"`
}

type PayTermRequest struct {
	RealisasiNominal *float64 `json:"realisasiNominal,omitempty"`
	TanggalRealisasi string   `json:"tanggalRealisasi,omitempty"`
}

const terminNotFound = "kontrak atau termin tidak ditemukan"

// HandleListTermin: GET /termin — ringkasan termin kontrak yang sudah ditandatangani dalam cakupan pemanggil.
func HandleListTermin(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.CanViewMonitoring(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke termin")
			return
		}
		list, err := d.Store.ListTerminSummaries(r.Context(), sc)
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

// HandleGetContractTermin: GET /contracts/{id}/termin.
func HandleGetContractTermin(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.CanViewMonitoring(sc.Role) {
			forbid(w, "role ini tidak memiliki akses ke termin")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		res, err := d.Store.GetContractTermin(r.Context(), id, sc)
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		WriteJSON(w, http.StatusOK, res)
	}
}

// HandleSetPaymentTerms: PUT /contracts/{id}/termin (desa).
func HandleSetPaymentTerms(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya perangkat desa yang dapat mengatur jadwal termin")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		var req SetTermsRequest
		if !decodeBody(w, r, &req) {
			return
		}
		in := make([]usecase.TermInput, len(req.Terms))
		for i, t := range req.Terms {
			due, err := parseDate(t.JatuhTempo)
			if err != nil {
				badInput(w, "jatuhTempo harus berformat YYYY-MM-DD")
				return
			}
			in[i] = usecase.TermInput{Persen: t.Persen, JatuhTempo: due}
		}
		res, err := d.Store.SetPaymentTerms(r.Context(), usecase.SetTermsParams{ContractID: id, Scope: sc, Terms: in, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, res.VillageID)
		WriteJSON(w, http.StatusOK, res)
	}
}

// HandleSetSPK: PUT /contracts/{id}/spk (desa).
func HandleSetSPK(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya perangkat desa yang dapat menyimpan SPK")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		var req SetSPKRequest
		if !decodeBody(w, r, &req) {
			return
		}
		nomor := strings.TrimSpace(req.Nomor)
		if nomor == "" || len(nomor) > 255 {
			badInput(w, "nomor SPK wajib diisi (maks. 255 karakter)")
			return
		}
		tgl, err := parseDate(req.Tanggal)
		if err != nil {
			badInput(w, "tanggal SPK harus berformat YYYY-MM-DD")
			return
		}
		mulai, err1 := optDate(req.Mulai)
		selesai, err2 := optDate(req.Selesai)
		if err1 != nil || err2 != nil {
			badInput(w, "mulai/selesai harus berformat YYYY-MM-DD")
			return
		}
		if mulai != nil && selesai != nil && selesai.Before(*mulai) {
			badInput(w, "tanggal selesai tidak boleh sebelum tanggal mulai")
			return
		}
		res, err := d.Store.SetSPK(r.Context(), usecase.SetSPKParams{ContractID: id, Scope: sc, ActorIP: ClientIP(r, d.TrustedProxies),
			SPK: domain.SPK{ContractID: id, Nomor: nomor, Tanggal: tgl, Mulai: mulai, Selesai: selesai}})
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, res.VillageID)
		WriteJSON(w, http.StatusOK, res)
	}
}

// HandleReportProgress: POST /contracts/{id}/progress (penyedia pihak kontrak atau desa).
func HandleReportProgress(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if sc.Role != domain.RolePenyedia && !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya penyedia atau perangkat desa yang dapat melaporkan progres")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		var req ReportProgressRequest
		if !decodeBody(w, r, &req) {
			return
		}
		catatan := strings.TrimSpace(req.Catatan)
		switch {
		case req.PersenSelesai < 0 || req.PersenSelesai > 100:
			badInput(w, "persenSelesai harus 0-100")
			return
		case len([]rune(catatan)) > 2000:
			badInput(w, "catatan maksimal 2000 karakter")
			return
		case len(req.FileIDs) > usecase.MaxProgressFiles || len(req.BuktiURL) > usecase.MaxProgressURLs:
			badInput(w, "bukti maksimal 10 file dan 10 URL")
			return
		case req.TermID != nil && *req.TermID <= 0:
			badInput(w, "termId tidak valid")
			return
		}
		seen := map[int64]bool{}
		fileIDs := []int64{}
		for _, f := range req.FileIDs {
			if f <= 0 {
				badInput(w, "fileIds tidak valid")
				return
			}
			if !seen[f] {
				seen[f] = true
				fileIDs = append(fileIDs, f)
			}
		}
		for _, u := range req.BuktiURL {
			pu, err := url.Parse(u)
			if err != nil || pu.Scheme != "https" || pu.Host == "" || len(u) > 255 {
				badInput(w, "buktiUrl harus URL https (maks. 255 karakter)")
				return
			}
		}
		wp, villageID, err := d.Store.ReportProgress(r.Context(), usecase.ReportProgressParams{
			ContractID: id, Scope: sc, TermID: req.TermID, PersenSelesai: req.PersenSelesai, Catatan: catatan,
			FileIDs: fileIDs, BuktiURL: req.BuktiURL, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, villageID)
		WriteJSON(w, http.StatusCreated, wp)
	}
}

// HandlePayTerm: POST /contracts/{id}/termin/{termId}/bayar (desa).
func HandlePayTerm(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya perangkat desa yang dapat menandai termin dibayar")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		termID, ok := pathID(w, r, "termId")
		if !ok {
			return
		}
		var req PayTermRequest
		if r.ContentLength != 0 && !decodeBody(w, r, &req) {
			return
		}
		if req.RealisasiNominal != nil && *req.RealisasiNominal <= 0 {
			badInput(w, "realisasiNominal harus lebih dari 0")
			return
		}
		tgl, err := optDate(req.TanggalRealisasi)
		if err != nil {
			badInput(w, "tanggalRealisasi harus berformat YYYY-MM-DD")
			return
		}
		t, villageID, err := d.Store.PayTerm(r.Context(), usecase.PayTermParams{ContractID: id, TermID: termID, Scope: sc,
			RealisasiNominal: req.RealisasiNominal, TanggalRealisasi: tgl, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, terminNotFound)
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, villageID)
		WriteJSON(w, http.StatusOK, t)
	}
}
