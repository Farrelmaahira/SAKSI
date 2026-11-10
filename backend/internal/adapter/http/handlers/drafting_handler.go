package handlers

import (
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// maxDraftBody cukup untuk 200 KB isi pasal + jawaban wizard + overhead JSON.
const maxDraftBody = 1 << 20

// ContractAuditResponse adalah hasil POST /contracts/{id}/audit (bentuk yang dipakai FE: findings, skor, model, fallback).
type ContractAuditResponse struct {
	AuditID            int64                 `json:"auditId"`
	VersionID          int64                 `json:"versionId"`
	NomorVersi         int                   `json:"nomorVersi"`
	Sumber             string                `json:"sumber,omitempty"`
	Findings           []domain.AuditFinding `json:"findings"`
	Skor               float64               `json:"skor"`
	Model              string                `json:"model"`
	Summary            string                `json:"summary,omitempty"`
	MandatoryFulfilled int                   `json:"mandatoryFulfilled,omitempty"`
	TotalMandatory     int                   `json:"totalMandatory,omitempty"`
	DijalankanPada     *time.Time            `json:"dijalankanPada,omitempty"`
}

// loadDraftingOptions memuat template + dasar hukum untuk wilayah desa pemanggil (nasional bila tanpa desa).
func loadDraftingOptions(r *http.Request, d *Deps, villageID *int64) (domain.DraftingOptions, error) {
	var regionID int64
	if villageID != nil && *villageID > 0 {
		id, err := d.Store.RegionIDByVillage(r.Context(), *villageID)
		if err != nil && !errors.Is(err, domain.ErrNotFound) {
			return domain.DraftingOptions{}, err
		}
		regionID = id
	}
	return usecase.LoadDraftingOptions(r.Context(), d.Store, d.Cache, regionID)
}

func draftParams(r *http.Request, d *Deps, uid int64, jenis domain.ContractJenis, judul string, cp domain.Counterparty,
	nilai float64, tenggat time.Time, skema, metode string, jawaban map[string]any) usecase.CreateContractDraftParams {
	p := usecase.CreateContractDraftParams{
		Jenis: jenis, Judul: judul, KadesName: "Kepala Desa", VillageName: "Desa",
		VendorName: cp.Nama, VendorNPWP: cp.NPWP, VendorAddress: cp.Alamat,
		Nilai: nilai, Tenggat: tenggat, SkemaPembayaran: skema, MetodePemilihan: metode, JawabanForm: jawaban,
	}
	if u, err := d.Store.UserByID(r.Context(), uid); err == nil {
		if u.Name != "" {
			p.KadesName = u.Name
		}
		if u.VillageName != "" {
			p.VillageName = u.VillageName
		}
	}
	return p
}

// draftInput menyusun DraftContractRequest. Identitas para pihak (NPWP, alamat) sengaja tidak dikirim ke AI;
// kepala SPK dirender backend.
func draftInput(jenis domain.ContractJenis, p usecase.CreateContractDraftParams, tpl domain.ContractTemplate, refs []domain.LegalReference) usecase.DraftInput {
	jawaban := usecase.JawabanStrings(p.JawabanForm)
	for k, v := range map[string]string{
		"judul": p.Judul, "nilai": strconv.FormatFloat(p.Nilai, 'f', 0, 64), "tenggat": p.Tenggat.Format("2006-01-02"),
		"skema_pembayaran": p.SkemaPembayaran, "metode_pemilihan": p.MetodePemilihan,
	} {
		if _, ok := jawaban[k]; !ok && v != "" {
			jawaban[k] = v
		}
	}
	lib := make([]domain.Clause, len(tpl.Clauses))
	for i, c := range tpl.Clauses {
		lib[i] = c.Clause
	}
	return usecase.DraftInput{Jenis: jenis, Jawaban: jawaban, ClauseLibrary: lib, LegalReferences: refs}
}

func auditInput(jenis domain.ContractJenis, clauses []domain.Clause, tpl domain.ContractTemplate, opts domain.DraftingOptions) usecase.AuditInput {
	return usecase.AuditInput{Jenis: jenis, Clauses: clauses, MandatoryKodePasal: usecase.MandatoryKodePasal(tpl), LegalReferences: opts.LegalReferences}
}

func contractIDParam(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		WriteError(w, http.StatusBadRequest, "ID kontrak tidak valid")
		return 0, false
	}
	return id, true
}

// loadScopedState memuat versi terakhir kontrak dan menegakkan cakupan desa (anti-IDOR); hanya inspektorat lintas desa.
func loadScopedState(w http.ResponseWriter, r *http.Request, d *Deps, id int64, role domain.UserRole, vID *int64) (domain.ContractDraftState, bool) {
	st, err := d.Store.ContractDraftState(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
		} else {
			slog.Error("gagal memuat kontrak", "contract_id", id, "err", err)
			WriteError(w, http.StatusInternalServerError, "gagal memuat kontrak")
		}
		return st, false
	}
	if role != domain.RoleInspektorat && (vID == nil || *vID != st.VillageID) {
		WriteError(w, http.StatusForbidden, "akses ditolak: kontrak milik desa lain")
		return st, false
	}
	return st, true
}

// HandleAuditContractByID mengaudit versi terakhir (AI atau manual) dan menyimpan ai_audits + ai_audit_findings.
func HandleAuditContractByID(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, vID := ClaimsFromContext(r.Context())
		switch role {
		case domain.RoleKades, domain.RolePerangkatDesa, domain.RoleBPD, domain.RoleInspektorat:
		default:
			WriteError(w, http.StatusForbidden, "role tidak berhak mengaudit kontrak")
			return
		}
		id, ok := contractIDParam(w, r)
		if !ok {
			return
		}
		st, ok := loadScopedState(w, r, d, id, role, vID)
		if !ok {
			return
		}
		village := st.VillageID
		opts, err := loadDraftingOptions(r, d, &village)
		if err != nil {
			slog.Error("gagal memuat opsi drafting", "err", err)
			WriteError(w, http.StatusInternalServerError, "gagal memuat template kontrak")
			return
		}

		audit, err := usecase.AuditClauses(r.Context(), d.AIEngine, d.Cache, auditInput(st.Jenis, st.Clauses, opts.Template(st.Jenis), opts))
		if err != nil {
			WriteAIError(w, err)
			return
		}
		auditID, err := d.Store.SaveContractAudit(r.Context(), usecase.SaveAuditParams{
			ContractID: id, VersionID: st.VersionID, ActorID: uid, ActorIP: ClientIP(r, d.TrustedProxies), Result: audit,
		})
		if err != nil {
			slog.Error("gagal menyimpan audit", "contract_id", id, "err", err)
			WriteError(w, http.StatusInternalServerError, "gagal menyimpan hasil audit")
			return
		}
		WriteJSON(w, http.StatusOK, ContractAuditResponse{
			AuditID: auditID, VersionID: st.VersionID, NomorVersi: st.NomorVersi, Sumber: st.Sumber,
			Findings: audit.Findings, Skor: audit.Score, Model: audit.Model,
			Summary: audit.Summary, MandatoryFulfilled: audit.Fulfilled, TotalMandatory: audit.Total,
		})
	}
}

// HandleLatestContractAudit mengembalikan audit terakhir (404 bila belum ada). Otorisasi sama dengan GET /contracts/{id}.
func HandleLatestContractAudit(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		id, ok := contractIDParam(w, r)
		if !ok {
			return
		}
		villageID, audit, err := d.Store.LatestContractAudit(r.Context(), id)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			slog.Error("gagal memuat audit", "contract_id", id, "err", err)
			WriteError(w, http.StatusInternalServerError, "gagal memuat audit")
			return
		}
		if err := usecase.AuthorizeContractAccess(role, formatVillageID(vID), domain.Contract{VillageID: strconv.FormatInt(villageID, 10)}); err != nil {
			WriteError(w, http.StatusForbidden, "akses ditolak: kontrak milik desa lain")
			return
		}
		if audit == nil {
			WriteError(w, http.StatusNotFound, "kontrak belum pernah diaudit")
			return
		}
		WriteJSON(w, http.StatusOK, ContractAuditResponse{
			AuditID: audit.ID, VersionID: audit.VersionID, NomorVersi: audit.NomorVersi, Sumber: audit.Sumber,
			Findings: audit.Findings, Skor: audit.Skor, Model: audit.Model, DijalankanPada: &audit.DijalankanPada,
		})
	}
}

// HandlePublishContract menyaring data pribadi lewat RedactText lalu mempublikasikan kontrak yang sudah ditandatangani.
// Redaksi gagal = publikasi ditolak; teks mentah tidak pernah dipublikasikan.
func HandlePublishContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, vID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades {
			WriteError(w, http.StatusForbidden, "hanya Kepala Desa yang berhak mempublikasikan kontrak")
			return
		}
		id, ok := contractIDParam(w, r)
		if !ok {
			return
		}
		st, ok := loadScopedState(w, r, d, id, role, vID)
		if !ok {
			return
		}
		if st.Status != domain.StatusSigned {
			WriteError(w, http.StatusConflict, "hanya kontrak berstatus ditandatangani yang dapat dipublikasikan")
			return
		}

		red, err := usecase.RedactForPublication(r.Context(), d.AIEngine, st.Isi)
		if err != nil {
			slog.Error("redaksi gagal, publikasi ditolak", "contract_id", id, "err", err)
			WriteAIError(w, err)
			return
		}

		pub, err := d.Store.PublishContract(r.Context(), usecase.PublishParams{
			ContractID: id, VersionID: st.VersionID, ActorID: uid, ActorIP: ClientIP(r, d.TrustedProxies),
			IsiTersaring: red.Text, RedactedKinds: red.RedactedKinds,
		})
		if err != nil {
			switch {
			case errors.Is(err, domain.ErrContractNotEditable), errors.Is(err, domain.ErrConflict):
				WriteError(w, http.StatusConflict, "status atau versi kontrak berubah; muat ulang lalu coba lagi")
			case errors.Is(err, domain.ErrNotFound):
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
			default:
				slog.Error("gagal mempublikasikan", "contract_id", id, "err", err)
				WriteError(w, http.StatusInternalServerError, "gagal mempublikasikan kontrak")
			}
			return
		}
		usecase.InvalidatePublic(r.Context(), d.Cache, id, st.VillageID)
		WriteJSON(w, http.StatusCreated, pub)
	}
}

// WriteAIError: semua model gagal/terlambat → 503 AI_UNAVAILABLE dengan pesan ai-engine;
// error AI lain (input ditolak, respons tidak valid, kunci salah) → 502 AI_ERROR tanpa detail internal.
func WriteAIError(w http.ResponseWriter, err error) {
	if errors.Is(err, usecase.ErrAIUnavailable) {
		WriteErrorCode(w, http.StatusServiceUnavailable, "AI_UNAVAILABLE", usecase.AIUnavailableMessage(err))
		return
	}
	slog.Error("ai engine error", "err", err)
	WriteErrorCode(w, http.StatusBadGateway, "AI_ERROR", "Layanan AI gagal memproses permintaan. Coba lagi, atau lanjutkan menyunting pasal secara manual.")
}

// writeInvalid menulis 400 untuk error validasi domain.ErrInvalidInput tanpa prefiks internal.
func writeInvalid(w http.ResponseWriter, err error) {
	WriteError(w, http.StatusBadRequest, strings.TrimPrefix(err.Error(), domain.ErrInvalidInput.Error()+": "))
}
