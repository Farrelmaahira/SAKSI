package domain

import (
	"errors"
	"time"
)

const MaxUploadBytes = 5 * 1024 * 1024

var (
	ErrNotFound            = errors.New("domain: resource not found")
	ErrUnauthorized        = errors.New("domain: unauthorized")
	ErrForbidden           = errors.New("domain: access forbidden")
	ErrConflict            = errors.New("domain: resource conflict")
	ErrContractNotEditable = errors.New("domain: contract is not editable in current status")
	ErrInvalidInput        = errors.New("domain: invalid input")
)

type UserRole string

const (
	RoleKades         UserRole = "kades"
	RolePerangkatDesa UserRole = "perangkat_desa"
	RoleBPD           UserRole = "bpd"
	RoleInspektorat   UserRole = "inspektorat"
	RolePenyedia      UserRole = "penyedia"
	RoleAdminDaerah   UserRole = "admin_daerah"
	RoleWarga         UserRole = "warga"
)

func (r UserRole) Valid() bool {
	switch r {
	case RoleKades, RolePerangkatDesa, RoleBPD, RoleInspektorat, RolePenyedia, RoleAdminDaerah, RoleWarga:
		return true
	default:
		return false
	}
}

func (r UserRole) CanSelfRegister() bool {
	switch r {
	case RoleKades, RolePenyedia, RoleWarga:
		return true
	default:
		return false
	}
}

type User struct {
	ID                int64     `json:"id"`
	Email             string    `json:"email"`
	PasswordHash      string    `json:"-"`
	Role              UserRole  `json:"role"`
	Name              string    `json:"name"`
	NIP               string    `json:"nip,omitempty"`
	Status            string    `json:"status"`
	VillageID         *int64    `json:"villageId,omitempty"`
	VillageName       string    `json:"villageName,omitempty"`
	RegionID          *int64    `json:"regionId,omitempty"`
	NoHP              string    `json:"noHp,omitempty"`
	CounterpartyID    *int64    `json:"counterpartyId,omitempty"`
	CounterpartyName  string    `json:"counterpartyName,omitempty"`
	CounterpartyJenis string    `json:"counterpartyJenis,omitempty"`
	NPWP              string    `json:"npwp,omitempty"`
	Alamat            string    `json:"alamat,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type ContractJenis string

const (
	JenisPengadaan       ContractJenis = "pengadaan"
	JenisHibah           ContractJenis = "hibah"
	JenisKerjaSamaBUMDes ContractJenis = "kerja_sama_bumdes"
	JenisSewaAset        ContractJenis = "sewa_aset"
	JenisUMKM            ContractJenis = "umkm"
)

func (j ContractJenis) Valid() bool {
	switch j {
	case JenisPengadaan, JenisHibah, JenisKerjaSamaBUMDes, JenisSewaAset, JenisUMKM:
		return true
	default:
		return false
	}
}

type Counterparty struct {
	ID     int64  `json:"id"`
	UserID *int64 `json:"userId,omitempty"`
	Nama   string `json:"nama"`
	Jenis  string `json:"jenis"`
	NPWP   string `json:"npwp,omitempty"`
	Alamat string `json:"alamat,omitempty"`
}

type WizardQuestionOption struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type WizardQuestion struct {
	Key         string                 `json:"key"`
	Label       string                 `json:"label"`
	Description string                 `json:"description,omitempty"`
	Type        string                 `json:"type"` // "text", "textarea", "number", "date", "select"
	Required    bool                   `json:"required"`
	Options     []WizardQuestionOption `json:"options,omitempty"`
	Placeholder string                 `json:"placeholder,omitempty"`
}

type ContractDraftPreview struct {
	Judul              string         `json:"judul"`
	Jenis              string         `json:"jenis"`
	Nilai              float64        `json:"nilai"`
	TeksDraf           string         `json:"teksDraf"`
	SHA256Hash         string         `json:"sha256Hash"`
	IntegrityScore     float64        `json:"integrityScore"`
	MandatoryFulfilled int            `json:"mandatoryFulfilled"`
	TotalMandatory     int            `json:"totalMandatory"`
	Summary            string         `json:"summary"`
	AuditModel         string         `json:"auditModel"`
	Findings           []AuditFinding `json:"findings"`
	Clauses            []Clause       `json:"clauses"`
	DraftModel         string         `json:"model"` // model DraftContract
}

// AuditFinding adalah satu temuan audit klausul (tabel ai_audit_findings).
type AuditFinding struct {
	KodePasal *string `json:"kodePasal"`
	Tingkat   string  `json:"tingkat"` // kritis | saran
	Pesan     string  `json:"pesan"`
}

// AuditResult adalah hasil audit dari AI Engine atau rule auditor; Model mencatat siapa yang mengaudit.
type AuditResult struct {
	Score     float64        `json:"score"`
	Fulfilled int            `json:"fulfilled"`
	Total     int            `json:"total"`
	Summary   string         `json:"summary"`
	Model     string         `json:"model"`
	Findings  []AuditFinding `json:"findings"`
}

// Clause adalah satu pasal kontrak (contract_clauses / clause_library). Bentuk JSON disepakati FE ↔ BE.
type Clause struct {
	KodePasal        string `json:"kodePasal"`
	Judul            string `json:"judul"`
	Isi              string `json:"isi"`
	Urutan           int    `json:"urutan"`
	LegalReferenceID int64  `json:"legalReferenceId"` // 0 = tanpa dasar hukum
}

// LibraryClause adalah pasal template dari clause_library.
type LibraryClause struct {
	Clause
	Wajib bool `json:"wajib"`
}

type LegalReference struct {
	ID         int64  `json:"id"`
	Peraturan  string `json:"peraturan"`
	NomorPasal string `json:"nomorPasal"`
	Isi        string `json:"isi"`
}

// ContractTemplate adalah template terbaru per jenis kontrak untuk satu wilayah (atau nasional).
type ContractTemplate struct {
	ID      int64           `json:"id"`
	Jenis   ContractJenis   `json:"jenis"`
	Versi   int             `json:"versi"`
	Clauses []LibraryClause `json:"clauses"`
}

// DraftingOptions adalah template, clause_library, dan legal_references yang berlaku di satu wilayah.
type DraftingOptions struct {
	RegionID        int64              `json:"regionId"`
	Templates       []ContractTemplate `json:"templates"`
	LegalReferences []LegalReference   `json:"legalReferences"`
}

// Template mengembalikan template untuk jenis tertentu (zero value bila tidak ada).
func (o DraftingOptions) Template(j ContractJenis) ContractTemplate {
	for _, t := range o.Templates {
		if t.Jenis == j {
			return t
		}
	}
	return ContractTemplate{Jenis: j}
}

// ContractDraftState adalah keadaan kontrak + versi terakhir yang dibutuhkan untuk audit/publikasi.
type ContractDraftState struct {
	ContractID int64
	VillageID  int64
	Jenis      ContractJenis
	Status     ContractStatus
	VersionID  int64
	NomorVersi int
	Sumber     string
	Isi        string
	Clauses    []Clause
}

// ContractAudit adalah baris ai_audits terakhir beserta temuannya.
type ContractAudit struct {
	ID             int64
	VersionID      int64
	NomorVersi     int
	Sumber         string
	Model          string
	Skor           float64
	DijalankanPada time.Time
	Findings       []AuditFinding
}

type Publication struct {
	ID            int64     `json:"id"`
	ContractID    int64     `json:"contractId"`
	VersionID     int64     `json:"versionId"`
	IsiTersaring  string    `json:"isiTersaring"`
	RedactedKinds []string  `json:"redactedKinds"`
	Waktu         time.Time `json:"waktu"`
}

type ContractDetail struct {
	ID               int64          `json:"id"`
	VillageID        *int64         `json:"villageId,omitempty"`
	VillageName      string         `json:"villageName,omitempty"`
	CounterpartyID   *int64         `json:"counterpartyId,omitempty"`
	CounterpartyNama string         `json:"counterpartyNama,omitempty"`
	Jenis            ContractJenis  `json:"jenis"`
	Judul            string         `json:"judul"`
	Nilai            float64        `json:"nilai"`
	Tenggat          time.Time      `json:"tenggat"`
	SkemaPembayaran  string         `json:"skemaPembayaran,omitempty"`
	MetodePemilihan  string         `json:"metodePemilihan,omitempty"`
	Status           string         `json:"status"`
	NomorVersi       int            `json:"nomorVersi"`
	TeksKontrak      string         `json:"teksKontrak,omitempty"`
	JawabanForm      map[string]any `json:"jawabanForm,omitempty"`
	Sumber           string         `json:"sumber,omitempty"`
	Clauses          []Clause       `json:"clauses,omitempty"`
	IntegrityScore   float64        `json:"integrityScore"`
	SHA256Hash       string         `json:"sha256Hash"`
	AuditError       string         `json:"auditError,omitempty"` // audit AI gagal saat dibuat; kontrak tetap tersimpan sebagai draf
	CreatedBy        int64          `json:"createdBy"`
	CreatedAt        time.Time      `json:"createdAt"`
}

type ContractStatus string

const (
	StatusDraft     ContractStatus = "draf"
	StatusAudited   ContractStatus = "diaudit"
	StatusInReview  ContractStatus = "ditinjau"
	StatusSigned    ContractStatus = "ditandatangani"
	StatusPublished ContractStatus = "dipublikasikan"
	StatusRunning   ContractStatus = "berjalan"
	StatusDone      ContractStatus = "selesai"
	StatusCancelled ContractStatus = "dibatalkan"

	// Backward-compatibility aliases
	StatusUnderReview   ContractStatus = "ditinjau"
	StatusAuditComplete ContractStatus = "diaudit"
	StatusSealed        ContractStatus = "ditandatangani"
)

// Locked true bila isi kontrak tidak boleh diubah lagi (status ≥ ditandatangani, atau dibatalkan).
func (s ContractStatus) Locked() bool {
	switch s {
	case StatusSigned, StatusPublished, StatusRunning, StatusDone, StatusCancelled:
		return true
	}
	return false
}

type ContractVersion struct {
	ID          int64          `json:"id"`
	ContractID  int64          `json:"contractId"`
	NomorVersi  int            `json:"nomorVersi"`
	JawabanForm map[string]any `json:"jawabanForm,omitempty"`
	Isi         string         `json:"isi"`
	Sumber      string         `json:"sumber"` // "ai" | "manual"
	Clauses     []Clause       `json:"clauses,omitempty"`
	DibuatOleh  int64          `json:"createdBy"`
	CreatedAt   time.Time      `json:"createdAt"`
}

type ContractReview struct {
	ID        int64     `json:"id"`
	VersionID int64     `json:"versionId"`
	PartyID   int64     `json:"partyId"`
	ClauseID  *int64    `json:"clauseId,omitempty"`
	Komentar  string    `json:"komentar"`
	Status    string    `json:"status"` // "setuju" | "minta_revisi"
	Waktu     time.Time `json:"waktu"`
}

type Signature struct {
	ID           int64     `json:"id"`
	VersionID    int64     `json:"versionId"`
	PartyID      int64     `json:"partyId"`
	SignerUserID int64     `json:"signerUserId"`
	Metode       string    `json:"metode"` // "simulasi" | "psre"
	Referensi    string    `json:"referensi"`
	Waktu        time.Time `json:"waktu"`
}

type DocumentSeal struct {
	ID                int64     `json:"id"`
	VersionID         int64     `json:"versionId"`
	FileID            int64     `json:"fileId"`
	SHA256            string    `json:"sha256"`
	WaktuSegel        time.Time `json:"waktuSegel"`
	SegelSebelumnyaID *int64    `json:"segelSebelumnyaId,omitempty"`
	Chain             string    `json:"chain,omitempty"`
	TxHash            string    `json:"txHash,omitempty"`
}

type ContractLifecycleDetail struct {
	Contract   ContractDetail    `json:"contract"`
	Version    ContractVersion   `json:"currentVersion"`
	Versions   []ContractVersion `json:"versions"`
	Reviews    []ContractReview  `json:"reviews"`
	Signatures []Signature       `json:"signatures"`
	Seal       *DocumentSeal     `json:"seal,omitempty"`
}

type Contract struct {
	ID                 string         `json:"id"`
	ContractNumber     string         `json:"contractNumber"`
	VillageID          string         `json:"villageId"`
	VillageName        string         `json:"villageName"`
	Title              string         `json:"title"`
	Category           string         `json:"category"`
	VendorName         string         `json:"vendorName"`
	Amount             int64          `json:"amount"`
	Status             ContractStatus `json:"status"`
	SHA256Hash         string         `json:"sha256Hash"`
	IntegrityScore     float64        `json:"integrityScore"`
	Rating             float64        `json:"rating"`
	Volume             string         `json:"volume"`
	FiscalYear         int            `json:"fiscalYear"`
	ClausesCount       int            `json:"clausesCount"`
	MandatoryFulfilled int            `json:"mandatoryFulfilled"`
	CreatedBy          string         `json:"createdBy"`
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`
}

type EvidenceFile struct {
	ID            string    `json:"id"`
	ContractID    string    `json:"contractId"`
	FileKey       string    `json:"fileKey"`
	FileName      string    `json:"fileName"`
	MimeType      string    `json:"mimeType"`
	FileSizeBytes int64     `json:"fileSizeBytes"`
	UploadedBy    string    `json:"uploadedBy"`
	CreatedAt     time.Time `json:"createdAt"`
}

type DashboardMetrics struct {
	ActiveContractsCount   int     `json:"activeContractsCount"`
	ActiveContractsChange  float64 `json:"activeContractsChange"`
	TotalRealizationBudget int64   `json:"totalRealizationBudget"`
	RealizationChange      float64 `json:"realizationChange"`
	PendingReviewCount     int     `json:"pendingReviewCount"`
	PendingReviewChange    float64 `json:"pendingReviewChange"`
	SealedContractsCount   int     `json:"sealedContractsCount"`
	SealedContractsChange  float64 `json:"sealedContractsChange"`
	IntegrityIndex         int     `json:"integrityIndex"`
}

// Model untuk Pengaduan Warga (Citizen Reports) & Kontrak Publik

type ReportStatus string

const (
	ReportStatusDiterima        ReportStatus = "diterima"
	ReportStatusDiverifikasi    ReportStatus = "diverifikasi"
	ReportStatusDitindaklanjuti ReportStatus = "ditindaklanjuti"
	ReportStatusDiteruskan      ReportStatus = "diteruskan"
	ReportStatusSelesai         ReportStatus = "selesai"
	ReportStatusDitolak         ReportStatus = "ditolak"
)

type ReportAttachment struct {
	FileID           int64     `json:"fileId"`
	KunciPenyimpanan string    `json:"kunciPenyimpanan"`
	Mime             string    `json:"mime"`
	Ukuran           int64     `json:"ukuran"`
	DiunggahPada     time.Time `json:"diunggahPada"`
}

type ReportAction struct {
	ID               int64     `json:"id"`
	ReportID         int64     `json:"reportId"`
	AktorUserID      int64     `json:"aktorUserId"`
	AktorNama        string    `json:"aktorNama,omitempty"`
	Tindakan         string    `json:"tindakan"`
	Catatan          string    `json:"catatan,omitempty"`
	DiteruskanKeRole string    `json:"diteruskanKeRole,omitempty"`
	Waktu            time.Time `json:"waktu"`
}

type CitizenReport struct {
	ID            int64              `json:"id"`
	ContractID    int64              `json:"contractId"`
	ContractTitle string             `json:"contractTitle,omitempty"`
	PelaporUserID int64              `json:"pelaporUserId"`
	PelaporNama   string             `json:"pelaporNama,omitempty"`
	KodePelacakan string             `json:"kodePelacakan"`
	Kategori      string             `json:"kategori"`
	Deskripsi     string             `json:"deskripsi"`
	LokasiLat     *float64           `json:"lokasiLat,omitempty"`
	LokasiLng     *float64           `json:"lokasiLng,omitempty"`
	Status        ReportStatus       `json:"status"`
	DibuatPada    time.Time          `json:"dibuatPada"`
	Attachments   []ReportAttachment `json:"attachments,omitempty"`
	Actions       []ReportAction     `json:"actions,omitempty"`
}

type PublicContractSummary struct {
	ID               int64     `json:"id"`
	Nomor            string    `json:"nomor"`
	Judul            string    `json:"judul"`
	Jenis            string    `json:"jenis"`
	Nilai            float64   `json:"nilai"`
	Tenggat          time.Time `json:"tenggat"`
	Status           string    `json:"status"`
	VillageID        int64     `json:"villageId"`
	VillageName      string    `json:"villageName"`
	CounterpartyNama string    `json:"counterpartyNama"`
}

type PublicContractDetail struct {
	PublicContractSummary
	IsiTeks        string          `json:"isiTeks"`
	KlausulList    []string        `json:"klausulList"`
	IntegrityScore float64         `json:"integrityScore"`
	SHA256Hash     string          `json:"sha256Hash"`
	Progres        *PublicProgress `json:"progres,omitempty"`
}

// PublicProgress ringkasan progres untuk portal publik: tanpa catatan dan tanpa nama pelapor.
type PublicProgress struct {
	PersenTerakhir     float64              `json:"persenTerakhir"`
	TerakhirDilaporkan *time.Time           `json:"terakhirDilaporkan"`
	SPKMulai           *time.Time           `json:"spkMulai"`
	SPKSelesai         *time.Time           `json:"spkSelesai"`
	PersenDibayar      float64              `json:"persenDibayar"`
	Termin             []PublicTermProgress `json:"termin"`
}

type PublicTermProgress struct {
	Urutan     int               `json:"urutan"`
	Persen     float64           `json:"persen"`
	Status     PaymentTermStatus `json:"status"`
	JatuhTempo time.Time         `json:"jatuhTempo"`
}
