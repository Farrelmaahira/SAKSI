package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// DTO Payloads untuk Contract Lifecycle

type ReviseContractPayload struct {
	JawabanForm      map[string]any `json:"jawabanForm"`
	DrafTeksOverride string         `json:"drafTeksOverride,omitempty"`
}

type SubmitContractReviewPayload struct {
	ClauseID *int64 `json:"clauseId,omitempty"`
	Komentar string `json:"komentar"`
	Status   string `json:"status"` // "setuju" / "minta_revisi"
}

type SignContractJSONPayload struct {
	Metode    string `json:"metode,omitempty"`    // "simulasi" | "psre"
	Referensi string `json:"referensi,omitempty"` // file key / referensi tanda tangan
}

type SignContractResponse struct {
	Signature domain.Signature     `json:"signature"`
	Seal      *domain.DocumentSeal `json:"seal,omitempty"`
	IsSealed  bool                 `json:"isSealed"`
	Message   string               `json:"message"`
}

// HandleReviseContract menangani revisi draf kontrak oleh Kades (membuat versi N+1).
func HandleReviseContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, userVillageID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades {
			WriteError(w, http.StatusForbidden, "hanya Kepala Desa yang berhak merevisi draf kontrak")
			return
		}

		contractIDStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(contractIDStr, 10, 64)
		if err != nil || contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "ID kontrak tidak valid")
			return
		}

		var req ReviseContractPayload
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "payload JSON revisi kontrak tidak valid")
			return
		}

		if len(req.JawabanForm) == 0 && strings.TrimSpace(req.DrafTeksOverride) == "" {
			WriteError(w, http.StatusBadRequest, "jawabanForm atau drafTeksOverride wajib diisi")
			return
		}

		var villageID int64
		if userVillageID != nil {
			villageID = *userVillageID
		}

		params := usecase.ReviseContractParams{
			ContractID:       contractID,
			KadesUserID:      userID,
			VillageID:        villageID,
			JawabanForm:      req.JawabanForm,
			DrafTeksOverride: req.DrafTeksOverride,
		}

		version, err := d.Store.ReviseContract(r.Context(), params)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "Anda tidak berhak merevisi kontrak desa lain")
				return
			}
			if errors.Is(err, domain.ErrContractNotEditable) {
				WriteError(w, http.StatusConflict, "kontrak tidak dapat direvisi karena sudah ditandatangani atau ditutup")
				return
			}
			WriteError(w, http.StatusInternalServerError, "gagal merevisi draf kontrak: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, version)
	}
}

// HandleGetContractLifecycle mengambil detail kontrak beserta seluruh riwayat versi, tanggapan, dan tanda tangan.
func HandleGetContractLifecycle(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, userVillageID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades && role != domain.RolePerangkatDesa && role != domain.RoleBPD && role != domain.RoleInspektorat && role != domain.RolePenyedia {
			WriteError(w, http.StatusForbidden, "role tidak memiliki akses ke siklus hidup kontrak")
			return
		}

		contractIDStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(contractIDStr, 10, 64)
		if err != nil || contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "ID kontrak tidak valid")
			return
		}

		lifecycle, err := d.Store.GetContractLifecycleDetail(r.Context(), contractID, userID, role, userVillageID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "akses ditolak: Anda tidak memiliki wewenang pada kontrak ini")
				return
			}
			WriteError(w, http.StatusInternalServerError, "gagal memuat data siklus hidup kontrak: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, lifecycle)
	}
}

// HandleSubmitContractReview menangani tanggapan persetujuan atau permintaan revisi dari rekanan/penyedia.
func HandleSubmitContractReview(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, _ := ClaimsFromContext(r.Context())
		if role != domain.RolePenyedia {
			WriteError(w, http.StatusForbidden, "hanya rekanan/penyedia yang berhak mengirimkan ulasan kontrak")
			return
		}

		contractIDStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(contractIDStr, 10, 64)
		if err != nil || contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "ID kontrak tidak valid")
			return
		}

		var req SubmitContractReviewPayload
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "payload JSON ulasan tidak valid")
			return
		}

		status := strings.ToLower(strings.TrimSpace(req.Status))
		if status == "" {
			WriteError(w, http.StatusBadRequest, "status ulasan wajib diisi ('setuju' atau 'minta_revisi')")
			return
		}

		params := usecase.SubmitReviewParams{
			ContractID:   contractID,
			VendorUserID: userID,
			ClauseID:     req.ClauseID,
			Komentar:     req.Komentar,
			Status:       status,
		}

		review, err := d.Store.SubmitContractReview(r.Context(), params)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "akun penyedia Anda tidak terdaftar pada kontrak ini")
				return
			}
			if errors.Is(err, domain.ErrContractNotEditable) {
				WriteError(w, http.StatusConflict, "kontrak tidak dalam status yang dapat diulas")
				return
			}
			WriteError(w, http.StatusBadRequest, err.Error())
			return
		}

		WriteJSON(w, http.StatusCreated, review)
	}
}

// HandleSignContract menangani pembubuhan tanda tangan bilateral oleh Kades atau Rekanan.
func HandleSignContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, _ := ClaimsFromContext(r.Context())
		if role != domain.RoleKades && role != domain.RolePenyedia {
			WriteError(w, http.StatusForbidden, "hanya Kepala Desa dan Penyedia yang dapat menandatangani kontrak")
			return
		}

		contractIDStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(contractIDStr, 10, 64)
		if err != nil || contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "ID kontrak tidak valid")
			return
		}

		metode := "simulasi"
		var storageKey string

		contentType := r.Header.Get("Content-Type")
		if strings.HasPrefix(contentType, "multipart/form-data") {
			// Batasi upload sketch/gambar tanda tangan maksimal 2MB
			if err := r.ParseMultipartForm(2 * 1024 * 1024); err != nil {
				WriteError(w, http.StatusBadRequest, "ukuran gambar tanda tangan melebihi batas 2MB atau format tidak valid")
				return
			}

			if m := r.FormValue("metode"); m != "" {
				metode = m
			}

			file, header, err := r.FormFile("signature_image")
			if err != nil {
				// Cek alias "file" jika signature_image tidak disertakan
				file, header, err = r.FormFile("file")
			}

			if err == nil && file != nil {
				defer file.Close()
				ext := strings.ToLower(filepath.Ext(header.Filename))
				if ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
					WriteError(w, http.StatusBadRequest, "tanda tangan hanya boleh berupa file gambar PNG atau JPEG")
					return
				}

				key := fmt.Sprintf("signatures/contracts_%d_user_%d_%d%s", contractID, userID, time.Now().UnixNano(), ext)
				savedKey, err := d.Storage.Save(r.Context(), key, file, header.Size, header.Header.Get("Content-Type"))
				if err != nil {
					WriteError(w, http.StatusInternalServerError, "gagal menyimpan gambar tanda tangan: "+err.Error())
					return
				}
				storageKey = savedKey
			} else {
				// Tanpa file upload, gunakan referensi simulasi
				storageKey = fmt.Sprintf("simulated_sig_user_%d_contract_%d", userID, contractID)
			}
		} else {
			// Mendukung pembubuhan via JSON body untuk mode simulasi
			var jsonReq SignContractJSONPayload
			_ = json.NewDecoder(r.Body).Decode(&jsonReq)
			if jsonReq.Metode != "" {
				metode = jsonReq.Metode
			}
			if jsonReq.Referensi != "" {
				storageKey = jsonReq.Referensi
			} else {
				storageKey = fmt.Sprintf("simulated_sig_user_%d_contract_%d", userID, contractID)
			}
		}

		params := usecase.SignContractParams{
			ContractID: contractID,
			UserID:     userID,
			CallerRole: role,
			StorageKey: storageKey,
			Metode:     metode,
		}

		sig, seal, err := d.Store.SignContract(r.Context(), params)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "Anda tidak berhak menandatangani kontrak ini")
				return
			}
			if errors.Is(err, domain.ErrConflict) {
				WriteError(w, http.StatusConflict, "pihak Anda telah menandatangani versi kontrak ini sebelumnya")
				return
			}
			if errors.Is(err, domain.ErrContractNotEditable) {
				WriteError(w, http.StatusConflict, "kontrak tidak dalam status yang dapat ditandatangani")
				return
			}
			WriteError(w, http.StatusBadRequest, err.Error())
			return
		}

		resp := SignContractResponse{
			Signature: sig,
			Seal:      seal,
			IsSealed:  seal != nil,
			Message:   "tanda tangan berhasil dicatat",
		}
		if seal != nil {
			resp.Message = "tanda tangan berhasil dicatat dan dokumen kontrak telah resmi disegel secara otomatis"
		} else {
			resp.Message = "tanda tangan berhasil dicatat, menunggu tanda tangan pihak lawan"
		}

		WriteJSON(w, http.StatusCreated, resp)
	}
}
