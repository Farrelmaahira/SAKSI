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

	"saksi-backend/internal/domain"
)

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

// HandleListMyReports mengembalikan riwayat laporan pengaduan yang diajukan oleh pengguna saat ini.
func HandleListMyReports(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, _, _ := ClaimsFromContext(r.Context())
		if userID <= 0 {
			WriteError(w, http.StatusUnauthorized, "pengguna tidak terautentikasi")
			return
		}

		reports, err := d.Store.ListCitizenReportsByReporter(r.Context(), userID)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "gagal memuat daftar laporan saya")
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

		userID, role, _ := ClaimsFromContext(r.Context())
		report, err := d.Store.GetCitizenReportByID(r.Context(), reportID, userID, role)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "laporan pengaduan tidak ditemukan")
				return
			}
			if errors.Is(err, domain.ErrForbidden) {
				WriteError(w, http.StatusForbidden, "Anda tidak memiliki akses melihat laporan ini")
				return
			}
			WriteError(w, http.StatusInternalServerError, "gagal memuat detail laporan")
			return
		}

		WriteJSON(w, http.StatusOK, report)
	}
}
