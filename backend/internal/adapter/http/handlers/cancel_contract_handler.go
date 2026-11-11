package handlers

import (
	"errors"
	"net/http"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

const contractLockedMsg = "kontrak sudah dibatalkan atau sudah masuk tahap penandatanganan, sehingga tidak dapat diubah"

// writeContractLocked: 409 CONTRACT_LOCKED, kode yang sama dengan PUT /contracts/{id} untuk kontrak terkunci.
func writeContractLocked(w http.ResponseWriter, msg string) {
	WriteErrorCode(w, http.StatusConflict, "CONTRACT_LOCKED", msg)
}

// HandleCancelContract: DELETE /contracts/{id} — soft-cancel (status dibatalkan), data dan jejak audit tetap utuh.
func HandleCancelContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sc := scopeOf(r)
		if !usecase.IsDesa(sc.Role) {
			forbid(w, "hanya Kepala Desa atau perangkat desa yang dapat membatalkan kontrak")
			return
		}
		id, ok := pathID(w, r, "id")
		if !ok {
			return
		}
		villageID, err := d.Store.CancelContract(r.Context(), usecase.CancelContractParams{ContractID: id, Scope: sc, ActorIP: ClientIP(r, d.TrustedProxies)})
		if err != nil {
			if errors.Is(err, domain.ErrContractNotEditable) {
				writeContractLocked(w, "kontrak tidak dapat dibatalkan karena sudah masuk tahap penandatanganan atau selesai")
				return
			}
			writeDomainErr(w, err, "kontrak tidak ditemukan")
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, villageID)
		usecase.InvalidateMetrics(r.Context(), d.Cache)
		w.WriteHeader(http.StatusNoContent)
	}
}
