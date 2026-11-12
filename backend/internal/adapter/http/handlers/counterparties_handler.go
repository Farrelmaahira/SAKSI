package handlers

import (
	"net/http"
	"strings"

	"saksi-backend/internal/usecase"
)

// HandleListCounterparties: daftar pihak kedua (usaha berakun) untuk wizard buat kontrak. Hanya desa: respons memuat
// email akun, jadi tidak boleh terbuka untuk anonim atau penyedia lain.
func HandleListCounterparties(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if _, role, _ := ClaimsFromContext(r.Context()); !usecase.IsDesa(role) {
			forbid(w, "hanya Kepala Desa atau perangkat desa yang dapat melihat daftar pihak kedua")
			return
		}
		var jenisPtr *string
		rawJenis := strings.TrimSpace(r.URL.Query().Get("jenis"))
		if rawJenis != "" {
			jenisPtr = &rawJenis
		}

		search := strings.TrimSpace(r.URL.Query().Get("q"))
		if search == "" {
			search = strings.TrimSpace(r.URL.Query().Get("search")) // nama parameter yang dikirim frontend
		}
		list, err := d.Store.ListCounterparties(r.Context(), jenisPtr, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to query counterparties: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, list)
	}
}
