package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

const maxReportDeskripsi = 5000

type CreateReportJSONRequest struct {
	ContractID int64    `json:"contractId"`
	Kategori   string   `json:"kategori"`
	Deskripsi  string   `json:"deskripsi"`
	LokasiLat  *float64 `json:"lokasiLat,omitempty"`
	LokasiLng  *float64 `json:"lokasiLng,omitempty"`
}

// HandleCreateCitizenReport menangani pembuatan laporan pengaduan masyarakat (JSON atau multipart upload).
func HandleCreateCitizenReport(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, _ := ClaimsFromContext(r.Context())
		if role != domain.RoleWarga {
			WriteError(w, http.StatusForbidden, "hanya warga terdaftar yang dapat membuat pengaduan masyarakat")
			return
		}

		var contractID int64
		var kategori, deskripsi string
		var lokasiLat, lokasiLng *float64
		var fileIDs []int64

		contentType := r.Header.Get("Content-Type")
		if strings.HasPrefix(contentType, "multipart/form-data") {
			if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB limit
				WriteError(w, http.StatusBadRequest, "gagal memproses multipart form data")
				return
			}

			cID, err := strconv.ParseInt(r.FormValue("contractId"), 10, 64)
			if err != nil || cID <= 0 {
				WriteError(w, http.StatusBadRequest, "contractId tidak valid")
				return
			}
			contractID = cID
			kategori = strings.TrimSpace(r.FormValue("kategori"))
			deskripsi = strings.TrimSpace(r.FormValue("deskripsi"))

			if latStr := r.FormValue("lokasiLat"); latStr != "" {
				if lat, err := strconv.ParseFloat(latStr, 64); err == nil {
					lokasiLat = &lat
				}
			}
			if lngStr := r.FormValue("lokasiLng"); lngStr != "" {
				if lng, err := strconv.ParseFloat(lngStr, 64); err == nil {
					lokasiLng = &lng
				}
			}

			// Simpan file lampiran foto jika ada
			if r.MultipartForm != nil && r.MultipartForm.File != nil {
				files := r.MultipartForm.File["photos"]
				for _, fHeader := range files {
					file, err := fHeader.Open()
					if err != nil {
						continue
					}

					ext := strings.ToLower(filepath.Ext(fHeader.Filename))
					if ext == "" {
						ext = ".jpg"
					}
					randBytes := make([]byte, 4)
					_, _ = rand.Read(randBytes)
					fileKey := fmt.Sprintf("reports/%d-%s%s", time.Now().UnixNano(), hex.EncodeToString(randBytes), ext)

					mime := fHeader.Header.Get("Content-Type")
					if mime == "" {
						mime = "image/jpeg"
					}

					savedKey, err := d.Storage.Save(r.Context(), fileKey, file, fHeader.Size, mime)
					file.Close()
					if err != nil {
						WriteError(w, http.StatusBadRequest, fmt.Sprintf("gagal menyimpan foto: %v", err))
						return
					}

					fID, err := d.Store.SaveUploadedFile(r.Context(), savedKey, mime, fHeader.Size, userID)
					if err == nil && fID > 0 {
						fileIDs = append(fileIDs, fID)
					}
				}
			}
		} else {
			// Fallback ke JSON payload
			var req CreateReportJSONRequest
			r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				WriteError(w, http.StatusBadRequest, "invalid request body")
				return
			}
			contractID = req.ContractID
			kategori = strings.TrimSpace(req.Kategori)
			deskripsi = strings.TrimSpace(req.Deskripsi)
			lokasiLat = req.LokasiLat
			lokasiLng = req.LokasiLng
		}

		if contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "contractId wajib diisi")
			return
		}
		if kategori == "" {
			WriteError(w, http.StatusBadRequest, "kategori kejanggalan wajib dipilih")
			return
		}
		if len(deskripsi) < 15 {
			WriteError(w, http.StatusBadRequest, "deskripsi laporan minimal 15 karakter")
			return
		}
		// FE menggabungkan "[pasal] teks - Lokasi: ..." ke deskripsi (tidak ada kolom pasal/lokasi teks), jadi batasnya longgar.
		if utf8.RuneCountInString(deskripsi) > maxReportDeskripsi {
			WriteErrorCode(w, http.StatusBadRequest, "INVALID_INPUT", "deskripsi laporan maksimal 5000 karakter")
			return
		}
		if utf8.RuneCountInString(kategori) > 255 {
			WriteErrorCode(w, http.StatusBadRequest, "INVALID_INPUT", "kategori maksimal 255 karakter")
			return
		}

		// Anti-spam laporan warga per akun (SWOT #2). Tanpa Redis tetap dibatasi in-memory.
		if !usecase.Allow(r.Context(), d.Limiter, usecase.KeyRLReport(userID), usecase.LimitReportPerHr, usecase.WindowReportRL) {
			w.Header().Set("Retry-After", strconv.Itoa(int(usecase.WindowReportRL.Seconds())))
			WriteErrorCode(w, http.StatusTooManyRequests, "RATE_LIMITED", "batas laporan tercapai (maks. 5 per jam), coba lagi nanti")
			return
		}

		reportInput := domain.CitizenReport{
			ContractID:    contractID,
			PelaporUserID: userID,
			Kategori:      kategori,
			Deskripsi:     deskripsi,
			LokasiLat:     lokasiLat,
			LokasiLng:     lokasiLng,
		}

		created, err := d.Store.CreateCitizenReport(r.Context(), reportInput, fileIDs)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			WriteError(w, http.StatusInternalServerError, "gagal menyimpan laporan pengaduan")
			return
		}

		WriteJSON(w, http.StatusCreated, created)
	}
}

// HandleListReports mengembalikan daftar laporan pengaduan masyarakat secara adaptif sesuai peran pengguna:
// - Warga: hanya laporan yang diajukan oleh pengguna tersebut
// - Kades & BPD: seluruh laporan warga di desa terkait (dengan proteksi privasi pelapor)
// - Inspektorat: seluruh laporan pengaduan lintas desa
func HandleListReports(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, userVillageID := ClaimsFromContext(r.Context())
		if userID <= 0 {
			WriteError(w, http.StatusUnauthorized, "pengguna tidak terautentikasi")
			return
		}

		filter := usecase.ListReportsFilter{
			RequesterRole:   role,
			RequesterUserID: userID,
			Search:          r.URL.Query().Get("q"),
		}

		if userVillageID != nil {
			filter.VillageID = *userVillageID
		} else if vParam := r.URL.Query().Get("villageId"); vParam != "" {
			if vID, err := strconv.ParseInt(vParam, 10, 64); err == nil {
				filter.VillageID = vID
			}
		}

		if cParam := r.URL.Query().Get("contractId"); cParam != "" {
			if cID, err := strconv.ParseInt(cParam, 10, 64); err == nil && cID > 0 {
				filter.ContractID = &cID
			}
		}

		if sParam := r.URL.Query().Get("status"); sParam != "" {
			st := domain.ReportStatus(sParam)
			filter.Status = &st
		}

		reports, err := d.Store.ListCitizenReports(r.Context(), filter)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "gagal memuat daftar laporan: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, reports)
	}
}

// HandleListMyReports adalah alias untuk kompatibilitas mundur.
func HandleListMyReports(d *Deps) http.HandlerFunc {
	return HandleListReports(d)
}

// HandleListContractReports mengembalikan seluruh laporan warga pada suatu kontrak untuk peran Kades/BPD/Inspektorat dengan validasi kepemilikan desa (anti-IDOR).
func HandleListContractReports(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		contractID, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			parts := strings.Split(idStr, "-")
			if len(parts) > 0 {
				contractID, _ = strconv.ParseInt(parts[len(parts)-1], 10, 64)
			}
		}
		if contractID <= 0 {
			WriteError(w, http.StatusBadRequest, "parameter ID kontrak tidak valid")
			return
		}

		_, role, userVillageID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades && role != domain.RolePerangkatDesa && role != domain.RoleBPD && role != domain.RoleInspektorat {
			WriteError(w, http.StatusForbidden, "hanya perangkat desa, BPD, atau inspektorat yang dapat melihat daftar laporan kontrak")
			return
		}

		var villageID int64
		if userVillageID != nil {
			villageID = *userVillageID
		} else if role != domain.RoleInspektorat {
			WriteError(w, http.StatusBadRequest, "akun perangkat desa harus terikat dengan ID desa")
			return
		}

		reports, err := d.Store.ListCitizenReportsByContract(r.Context(), contractID, villageID, role)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "kontrak tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "Anda tidak memiliki akses melihat laporan kontrak desa lain")
				return
			}
			WriteError(w, http.StatusInternalServerError, "gagal memuat daftar laporan kontrak: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, reports)
	}
}

// HandleGetReportDetail mengembalikan detail laporan beserta hak akses dan perlindungan identitas pelapor.
func HandleGetReportDetail(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		reportID, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil || reportID <= 0 {
			WriteError(w, http.StatusBadRequest, "parameter ID laporan tidak valid")
			return
		}

		report, err := d.Store.GetCitizenReportByID(r.Context(), reportID, scopeOf(r))
		if err != nil {
			// Laporan di luar cakupan juga 404 (bukan 403) agar id tidak bisa ditebak.
			writeDomainErr(w, err, "laporan pengaduan tidak ditemukan")
			return
		}

		WriteJSON(w, http.StatusOK, report)
	}
}

