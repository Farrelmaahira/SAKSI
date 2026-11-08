package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// DTO untuk modul kontrak

type ContractOptionItem struct {
	Value       string `json:"value"`
	Label       string `json:"label"`
	Description string `json:"description,omitempty"`
}

type ContractOptionsResponse struct {
	JenisKontrak    []ContractOptionItem `json:"jenisKontrak"`
	MetodePemilihan []ContractOptionItem `json:"metodePemilihan"`
	SkemaPembayaran []ContractOptionItem `json:"skemaPembayaran"`
}

type WizardQuestionsRequest struct {
	Jenis          string `json:"jenis"`
	CounterpartyID int64  `json:"counterpartyId,omitempty"`
}

type WizardQuestionsResponse struct {
	Jenis      string                  `json:"jenis"`
	VendorName string                  `json:"vendorName,omitempty"`
	Questions  []domain.WizardQuestion `json:"questions"`
}

type WizardPreviewRequest struct {
	CounterpartyID   int64          `json:"counterpartyId"`
	Jenis            string         `json:"jenis"`
	Judul            string         `json:"judul"`
	Nilai            float64        `json:"nilai"`
	Tenggat          string         `json:"tenggat"` // "YYYY-MM-DD"
	SkemaPembayaran  string         `json:"skemaPembayaran"`
	MetodePemilihan  string         `json:"metodePemilihan"`
	JawabanForm      map[string]any `json:"jawabanForm"`
	DrafTeksOverride string         `json:"drafTeksOverride,omitempty"`
}

type CreateContractPayload struct {
	CounterpartyID   int64          `json:"counterpartyId"`
	Jenis            string         `json:"jenis"`
	Judul            string         `json:"judul"`
	Nilai            float64        `json:"nilai"`
	Tenggat          string         `json:"tenggat"` // "YYYY-MM-DD"
	SkemaPembayaran  string         `json:"skemaPembayaran"`
	MetodePemilihan  string         `json:"metodePemilihan"`
	JawabanForm      map[string]any `json:"jawabanForm"`
	DrafTeksOverride string         `json:"drafTeksOverride,omitempty"`
}

type CreateContractRequest struct {
	ContractNumber string `json:"contractNumber"`
	Title          string `json:"title"`
	Category       string `json:"category"`
	VendorName     string `json:"vendorName"`
	Amount         int64  `json:"amount"`
	Volume         string `json:"volume"`
	FiscalYear     int    `json:"fiscalYear"`
	ContractText   string `json:"contractText"`
}

type VerifyContractRequest struct {
	ContractText string `json:"contractText"`
}

type AuditResponse struct {
	IntegrityScore     float64 `json:"integrityScore"`
	MandatoryFulfilled int     `json:"mandatoryFulfilled"`
	TotalMandatory     int     `json:"totalMandatory"`
	SHA256Hash         string  `json:"sha256Hash"`
	Summary            string  `json:"summary"`
}

// Handlers untuk modul kontrak

// HandleGetContractOptions mengembalikan daftar opsi enumerasi jenis kontrak, metode pemilihan, dan skema termin.
func HandleGetContractOptions(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		res := ContractOptionsResponse{
			JenisKontrak: []ContractOptionItem{
				{Value: "pengadaan", Label: "Pengadaan Barang & Jasa", Description: "Pengadaan barang fisik, material, atau pekerjaan konstruksi desa"},
				{Value: "hibah", Label: "Perjanjian Hibah Desa", Description: "Bantuan belanja hibah barang/uang kepada masyarakat atau kelompok desa"},
				{Value: "kerja_sama_bumdes", Label: "Kerja Sama BUMDes", Description: "Kemitraan usaha produktif dan bagi hasil bersama BUMDes"},
				{Value: "sewa_aset", Label: "Sewa Pemanfaatan Aset", Description: "Sewa tanah kas desa, gedung serbaguna, atau kios desa"},
				{Value: "umkm", Label: "Kemitraan UMKM Lokal", Description: "Pengadaan langsung ramah UMKM lokal desa"},
			},
			MetodePemilihan: []ContractOptionItem{
				{Value: "pengadaan_langsung", Label: "Pengadaan Langsung", Description: "Untuk nilai s.d ambang batas peraturan daerah"},
				{Value: "permintaan_penawaran", Label: "Permintaan Penawaran", Description: "Membandingkan minimal 2 penawaran penyedia"},
				{Value: "lelang_desa", Label: "Tender / Lelang Desa", Description: "Pengadaan terbuka skala besar di atas batas pengadaan langsung"},
				{Value: "swakelola", Label: "Swakelola Bersama Masyarakat", Description: "Dikerjakan gotong royong dengan partisipasi warga"},
			},
			SkemaPembayaran: []ContractOptionItem{
				{Value: "sekaligus", Label: "Pembayaran Sekaligus (100%)", Description: "Dibayar penuh setelah seluruh pekerjaan rampung & BAST disahkan"},
				{Value: "termin", Label: "Pembayaran Bertahap (Termin)", Description: "Dibayar bertahap sesuai progres fisik (misal: 30%, 70%, 100%)"},
				{Value: "uang_muka_termin", Label: "Uang Muka & Termin", Description: "Pemberian uang muka maksimal sesuai aturan daerah diikuti termin"},
			},
		}

		WriteJSON(w, http.StatusOK, res)
	}
}

// HandleWizardQuestions mengembalikan form kuesioner dinamis untuk jenis kontrak tertentu.
func HandleWizardQuestions(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req WizardQuestionsRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		rawJenis := strings.ToLower(strings.TrimSpace(req.Jenis))
		jenis := domain.ContractJenis(rawJenis)
		if !jenis.Valid() {
			WriteError(w, http.StatusBadRequest, "jenis kontrak tidak valid")
			return
		}

		vendorName := ""
		if req.CounterpartyID > 0 {
			if cp, err := d.Store.CounterpartyByID(r.Context(), req.CounterpartyID); err == nil {
				vendorName = cp.Nama
			}
		}

		questions := usecase.GenerateWizardQuestions(jenis, vendorName)
		WriteJSON(w, http.StatusOK, WizardQuestionsResponse{
			Jenis:      string(jenis),
			VendorName: vendorName,
			Questions:  questions,
		})
	}
}

// HandleWizardPreview menghasilkan draf teks kontrak dan skor audit awal tanpa menyimpan ke database.
func HandleWizardPreview(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, vID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades && role != domain.RoleAdminDaerah {
			WriteError(w, http.StatusForbidden, "hanya kepala desa yang dapat melakukan pratinjau draf kontrak")
			return
		}

		var req WizardPreviewRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		rawJenis := strings.ToLower(strings.TrimSpace(req.Jenis))
		jenis := domain.ContractJenis(rawJenis)
		if !jenis.Valid() {
			WriteError(w, http.StatusBadRequest, "jenis kontrak tidak valid")
			return
		}

		if req.CounterpartyID <= 0 {
			WriteError(w, http.StatusBadRequest, "counterpartyId is required")
			return
		}

		cp, err := d.Store.CounterpartyByID(r.Context(), req.CounterpartyID)
		if err != nil {
			WriteError(w, http.StatusBadRequest, "rekanan/pihak kedua tidak ditemukan")
			return
		}

		kadesName := "Kepala Desa"
		villageName := "Desa"
		if u, err := d.Store.UserByID(r.Context(), uid); err == nil {
			if u.Name != "" {
				kadesName = u.Name
			}
			if u.VillageName != "" {
				villageName = u.VillageName
			}
		}

		tenggat, _ := time.Parse("2006-01-02", req.Tenggat)
		if tenggat.IsZero() {
			tenggat = time.Now().AddDate(0, 1, 0)
		}

		params := usecase.CreateContractDraftParams{
			Jenis:           jenis,
			Judul:           req.Judul,
			KadesName:       kadesName,
			VillageName:     villageName,
			VendorName:      cp.Nama,
			VendorNPWP:      cp.NPWP,
			VendorAddress:   cp.Alamat,
			Nilai:           req.Nilai,
			Tenggat:         tenggat,
			SkemaPembayaran: req.SkemaPembayaran,
			MetodePemilihan: req.MetodePemilihan,
			JawabanForm:     req.JawabanForm,
		}

		draftText := req.DrafTeksOverride
		if draftText == "" {
			var err error
			draftText, err = usecase.RenderContractDraft(params)
			if err != nil {
				WriteError(w, http.StatusInternalServerError, "failed to render draft: "+err.Error())
				return
			}
		}

		score, fulfilled, total, summary, hash := usecase.AuditContractDraft(draftText)

		_ = vID
		WriteJSON(w, http.StatusOK, domain.ContractDraftPreview{
			Judul:              req.Judul,
			Jenis:              string(jenis),
			Nilai:              req.Nilai,
			TeksDraf:           draftText,
			SHA256Hash:         hash,
			IntegrityScore:     score,
			MandatoryFulfilled: fulfilled,
			TotalMandatory:     total,
			Summary:            summary,
		})
	}
}

// HandleCreateContractWizard memvalidasi otorisasi kades dan menyimpan kontrak baru secara atomik.
func HandleCreateContractWizard(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid, role, vID := ClaimsFromContext(r.Context())
		if role != domain.RoleKades {
			WriteError(w, http.StatusForbidden, "hanya kepala desa yang berhak membuat kontrak")
			return
		}
		if vID == nil || *vID <= 0 {
			WriteError(w, http.StatusBadRequest, "villageId is required for kades contract creation")
			return
		}

		var req CreateContractPayload
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		judul := strings.TrimSpace(req.Judul)
		if len(judul) < 3 {
			WriteError(w, http.StatusBadRequest, "judul kontrak minimal 3 karakter")
			return
		}

		rawJenis := strings.ToLower(strings.TrimSpace(req.Jenis))
		jenis := domain.ContractJenis(rawJenis)
		if !jenis.Valid() {
			WriteError(w, http.StatusBadRequest, "jenis kontrak tidak valid")
			return
		}

		if req.CounterpartyID <= 0 {
			WriteError(w, http.StatusBadRequest, "counterpartyId is required")
			return
		}

		cp, err := d.Store.CounterpartyByID(r.Context(), req.CounterpartyID)
		if err != nil {
			WriteError(w, http.StatusBadRequest, "rekanan/pihak kedua tidak ditemukan")
			return
		}

		if req.Nilai <= 0 {
			WriteError(w, http.StatusBadRequest, "nilai kontrak harus lebih besar dari 0")
			return
		}

		tenggat, err := time.Parse("2006-01-02", req.Tenggat)
		if err != nil {
			tenggat = time.Now().AddDate(0, 1, 0)
		}

		kadesName := "Kepala Desa"
		villageName := "Desa"
		if u, err := d.Store.UserByID(r.Context(), uid); err == nil {
			if u.Name != "" {
				kadesName = u.Name
			}
			if u.VillageName != "" {
				villageName = u.VillageName
			}
		}

		draftParams := usecase.CreateContractDraftParams{
			Jenis:           jenis,
			Judul:           judul,
			KadesName:       kadesName,
			VillageName:     villageName,
			VendorName:      cp.Nama,
			VendorNPWP:      cp.NPWP,
			VendorAddress:   cp.Alamat,
			Nilai:           req.Nilai,
			Tenggat:         tenggat,
			SkemaPembayaran: req.SkemaPembayaran,
			MetodePemilihan: req.MetodePemilihan,
			JawabanForm:     req.JawabanForm,
		}

		draftText := strings.TrimSpace(req.DrafTeksOverride)
		if draftText == "" {
			draftText, err = usecase.RenderContractDraft(draftParams)
			if err != nil {
				WriteError(w, http.StatusInternalServerError, "failed to render draft: "+err.Error())
				return
			}
		}

		score, _, _, _, hash := usecase.AuditContractDraft(draftText)

		createParams := usecase.CreateContractParams{
			VillageID:       *vID,
			CounterpartyID:  req.CounterpartyID,
			Jenis:           jenis,
			Judul:           judul,
			Nilai:           req.Nilai,
			Tenggat:         tenggat,
			SkemaPembayaran: req.SkemaPembayaran,
			MetodePemilihan: req.MetodePemilihan,
			JawabanForm:     req.JawabanForm,
			IsiTeks:         draftText,
			CreatedBy:       uid,
			IntegrityScore:  score,
			SHA256Hash:      hash,
		}

		detail, err := d.Store.CreateContractWithDetails(r.Context(), createParams)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to create contract: "+err.Error())
			return
		}

		WriteJSON(w, http.StatusCreated, detail)
	}
}

// HandleListContracts mengambil daftar kontrak yang difilter berdasar desa/role.
func HandleListContracts(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		search := r.URL.Query().Get("q")
		list, err := d.Store.ListContracts(r.Context(), villageID, role, search)
		if err != nil {
			WriteError(w, http.StatusInternalServerError, "failed to query contracts: "+err.Error())
			return
		}
		WriteJSON(w, http.StatusOK, list)
	}
}

// HandleGetContract mengambil data spesifik kontrak dengan validasi otorisasi IDOR.
func HandleGetContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, role, vID := ClaimsFromContext(r.Context())
		villageID := formatVillageID(vID)
		contractID := r.PathValue("id")
		contract, err := d.Store.ContractByID(r.Context(), contractID)
		if err != nil {
			if errors.Is(err, domain.ErrNotFound) {
				WriteError(w, http.StatusNotFound, "contract not found")
				return
			}
			WriteError(w, http.StatusNotFound, "contract not found")
			return
		}

		if err := usecase.AuthorizeContractAccess(role, villageID, contract); err != nil {
			WriteError(w, http.StatusForbidden, "access denied: IDOR violation")
			return
		}

		WriteJSON(w, http.StatusOK, contract)
	}
}

// HandleAuditContract menjalankan audit teks kontrak melalui AI Engine atau fallback.
func HandleAuditContract(d *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req VerifyContractRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, "invalid request body")
			return
		}

		var score float64
		var fulfilled, total int
		var summary, hash string

		if d.AIEngine != nil {
			var err error
			score, fulfilled, total, summary, err = d.AIEngine.AuditClauses(r.Context(), req.ContractText)
			if err != nil {
				// Fallback to rule auditor if AI fails
				score, fulfilled, total, summary, hash = usecase.AuditContractDraft(req.ContractText)
			} else {
				hasher := sha256.New()
				hasher.Write([]byte(req.ContractText))
				hash = hex.EncodeToString(hasher.Sum(nil))
			}
		} else {
			score, fulfilled, total, summary, hash = usecase.AuditContractDraft(req.ContractText)
		}

		WriteJSON(w, http.StatusOK, AuditResponse{
			IntegrityScore:     score,
			MandatoryFulfilled: fulfilled,
			TotalMandatory:     total,
			SHA256Hash:         hash,
			Summary:            summary,
		})
	}
}
