package handlers

import (
	"net/http"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// HandleSendContract: POST /contracts/{id}/send — desa mengirim kontrak ke pihak kedua untuk ditinjau.
func HandleSendContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya Kepala Desa atau perangkat desa yang dapat mengirim kontrak")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		villageID, err := d.Store.SendContract(r.Context(), usecase.SendContractParams{ContractID: id, Scope: sc, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			writeDomainErr(w, err, "kontrak tidak ditemukan")
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, villageID)
		usecase.InvalidateMetrics(r.Context(), d.Cache)
		WriteJSON(w, http.StatusOK, map[string]any{"id": id, "status": domain.StatusInReview})
	}
}
