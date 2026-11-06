package handlers

import (
	"net/http"
	"strings"
)

// HandleListCounterparties mengambil daftar rekanan atau penyedia aktif dari tabel counterparties.
func HandleListCounterparties(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var jenisPtr *string
		rawJenis := strings.TrimSpace(r.URL.Query().Get("jenis"))
		if rawJenis != "" {
			jenisPtr = &rawJenis
		}

		search := strings.TrimSpace(r.URL.Query().Get("q"))
		list, err := d.Store.ListCounterparties(r.Context(), jenisPtr, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to query counterparties: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, list)
	}
}
