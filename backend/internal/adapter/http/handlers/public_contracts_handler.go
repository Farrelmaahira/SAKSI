package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// HandleListPublicContracts mengembalikan daftar kontrak publik yang berjalan atau selesai.
func HandleListPublicContracts(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, userVillageID := ClaimsFromContext(r.Context())
		search := r.URL.Query().Get("search")

		var villageID int64
		// Jika warga, filter default ke desa warga tersebut
		if role == domain.RoleWarga && userVillageID != nil {
			villageID = *userVillageID
		} else if vParam := r.URL.Query().Get("villageId"); vParam != "" {
			if parsed, err := strconv.ParseInt(vParam, 10, 64); err == nil {
				villageID = parsed
			}
		} else if userVillageID != nil {
			villageID = *userVillageID
		}

		// shortcut: hanya daftar tanpa pencarian yang di-cache (page 0 = semua); tambah pagination bila daftar membesar.
		key := usecase.KeyPublicContracts(villageID, 0)
		var list []domain.PublicContractSummary
		if search == "" && usecase.CacheGetJSON(r.Context(), d.Cache, key, &list) {
			WriteJSON(w, http.StatusOK, list)
			return
		}
		list, err := d.Store.ListPublicContracts(r.Context(), villageID, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "gagal memuat daftar kontrak publik")
			return
		}
		if search == "" {
			usecase.CacheSetJSON(r.Context(), d.Cache, key, list, usecase.TTLPublicList)
		}

		WriteJSON(w, http.StatusOK, list)
	}
}

// HandleGetPublicContractDetail mengembalikan rincian kontrak publik dan daftar klausul pasalnya.
func HandleGetPublicContractDetail(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil || contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "parameter ID kontrak tidak valid")
			return
		}

		_, role, userVillageID := ClaimsFromContext(r.Context())
		var villageID int64
		if role == domain.RoleWarga && userVillageID != nil {
			villageID = *userVillageID
		}

		// Cache berisi detail publik yang sudah diredaksi, dibaca tanpa filter desa; cakupan desa warga
		// tetap ditegakkan setelah baca (cache maupun DB).
		key := usecase.KeyPublicContract(contractID)
		var detail domain.PublicContractDetail
		if !usecase.CacheGetJSON(r.Context(), d.Cache, key, &detail) {
			detail, err = d.Store.GetPublicContractDetail(r.Context(), 0, contractID)
			if err != nil {
				if errors.Is(err, domain.ErrNotFound) {
					WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan atau belum dipublikasikan")
					return
				}
				WriteError(w, http.StatusInternalServerError, "gagal mengambil detail kontrak")
				return
			}
			usecase.CacheSetJSON(r.Context(), d.Cache, key, detail, usecase.TTLPublicDetail)
		}
		if villageID != 0 && detail.VillageID != villageID {
			WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan atau belum dipublikasikan")
			return
		}

		WriteJSON(w, http.StatusOK, detail)
	}
}

