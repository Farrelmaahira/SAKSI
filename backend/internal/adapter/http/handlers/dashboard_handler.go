package handlers

import (
	"net/http"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// Handlers untuk modul dashboard

func HandleDashboardMetrics(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, vID := ClaimsFromContext(r.Context())
		key := usecase.KeyMetrics(uid) // role & desa melekat ke user, jadi kunci per user tidak bocor lintas desa
		var metrics domain.DashboardMetrics
		if usecase.CacheGetJSON(r.Context(), d.Cache, key, &metrics) {
			WriteJSON(w, http.StatusOK, metrics)
			return
		}
		metrics, err := d.Store.GetDashboardMetrics(r.Context(), formatVillageID(vID), role)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to fetch dashboard metrics")
			return
		}
		usecase.CacheSetJSON(r.Context(), d.Cache, key, metrics, usecase.TTLMetrics)
		WriteJSON(w, http.StatusOK, metrics)
	}
}

