package handlers

import (
	"net/http"
)

// Handlers untuk modul dashboard

func HandleDashboardMetrics(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		metrics, err := d.Store.GetDashboardMetrics(r.Context(), villageID, role)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to fetch dashboard metrics")
			return
		}
		WriteJSON(w, http.StatusOK, metrics)
	}
}

