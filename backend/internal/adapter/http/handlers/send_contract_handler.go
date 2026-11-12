package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// SendContractRequest: body opsional. KonfirmasiTemuanKritis = desa mengakui temuan kritis dari LLM dan tetap mengirim.
type SendContractRequest struct {
	KonfirmasiTemuanKritis bool `json:"konfirmasiTemuanKritis"`
}

// HandleSendContract: POST /contracts/{id}/send. Pasal wajib yang hilang selalu memblokir; temuan kritis dari LLM
// memblokir kecuali ada konfirmasi eksplisit (dicatat di audit_logs, aksi contract.send).
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
		var req SendContractRequest
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4<<10)).Decode(&req); err != nil && !errors.Is(err, io.EOF) {
			badInput(w, "body harus berupa JSON, mis. {\"konfirmasiTemuanKritis\": true}")
			return
		}
		// Hanya untuk memilih template pasal wajib; cakupan desa tetap ditegakkan oleh store (404 di luar cakupan).
		st, err := d.Store.ContractDraftState(r.Context(), id)
		if err != nil {
			writeDomainErr(w, err, "kontrak tidak ditemukan")
			return
		}
		village := st.VillageID
		opts, err := loadDraftingOptions(r, d, &village)
		if err != nil {
			slog.Error("gagal memuat opsi drafting", "err", err)
			WriteError(w, http.StatusInternalServerError, "gagal memuat template kontrak")
			return
		}
		mandatory := usecase.MandatoryKodePasal(usecase.TemplateOrRule(opts.Template(st.Jenis), usecase.CreateContractDraftParams{}))

		villageID, err := d.Store.SendContract(r.Context(), usecase.SendContractParams{
			ContractID: id, Scope: sc, ActorIP: ClientIP(r, d.TrustedProxies),
			MandatoryKodePasal: mandatory, KonfirmasiTemuanKritis: req.KonfirmasiTemuanKritis,
		})
		if err != nil {
			var cf *domain.CriticalFindingsError
			if errors.As(err, &cf) {
				msg := "pasal wajib belum lengkap: lengkapi draf lalu kirim lagi"
				if cf.DapatDikonfirmasi {
					msg = "audit AI menemukan temuan kritis: perbaiki pasalnya, atau kirim dengan konfirmasi eksplisit"
				}
				WriteJSON(w, http.StatusConflict, map[string]any{
					"error": msg, "code": "CRITICAL_FINDINGS", "findings": cf.Findings, "dapatDikonfirmasi": cf.DapatDikonfirmasi,
				})
				return
			}
			writeDomainErr(w, err, "kontrak tidak ditemukan")
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, villageID)
		usecase.InvalidateMetrics(r.Context(), d.Cache)
		WriteJSON(w, http.StatusOK, map[string]any{"id": id, "status": domain.StatusInReview})
	}
}
