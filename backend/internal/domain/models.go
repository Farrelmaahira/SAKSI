package domain

import (
	"errors"
	"time"
)

const MaxUploadBytes = 5 * 1024 * 1024

var (
	ErrNotFound     = errors.New("domain: resource not found")
	ErrUnauthorized = errors.New("domain: unauthorized")
	ErrForbidden    = errors.New("domain: access forbidden")
	ErrConflict     = errors.New("domain: resource conflict")
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
	Judul              string  `json:"judul"`
	Jenis              string  `json:"jenis"`
	Nilai              float64 `json:"nilai"`
	TeksDraf           string  `json:"teksDraf"`
	SHA256Hash         string  `json:"sha256Hash"`
	IntegrityScore     float64 `json:"integrityScore"`
	MandatoryFulfilled int     `json:"mandatoryFulfilled"`
	TotalMandatory     int     `json:"totalMandatory"`
	Summary            string  `json:"summary"`
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
	IntegrityScore   float64        `json:"integrityScore"`
	SHA256Hash       string         `json:"sha256Hash"`
	CreatedBy        int64          `json:"createdBy"`
	CreatedAt        time.Time      `json:"createdAt"`
}

type ContractStatus string

const (
	StatusDraft         ContractStatus = "draft"
	StatusUnderReview   ContractStatus = "under_review"
	StatusAuditComplete ContractStatus = "audit_complete"
	StatusSealed        ContractStatus = "sealed"
)

type Contract struct {
	ID                string         `json:"id"`
	ContractNumber    string         `json:"contractNumber"`
	VillageID         string         `json:"villageId"`
	VillageName       string         `json:"villageName"`
	Title             string         `json:"title"`
	Category          string         `json:"category"`
	VendorName        string         `json:"vendorName"`
	Amount            int64          `json:"amount"`
	Status            ContractStatus `json:"status"`
	SHA256Hash        string         `json:"sha256Hash"`
	IntegrityScore    float64        `json:"integrityScore"`
	Rating            float64        `json:"rating"`
	Volume            string         `json:"volume"`
	FiscalYear        int            `json:"fiscalYear"`
	ClausesCount      int            `json:"clausesCount"`
	MandatoryFulfilled int           `json:"mandatoryFulfilled"`
	CreatedBy         string         `json:"createdBy"`
	CreatedAt         time.Time      `json:"createdAt"`
	UpdatedAt         time.Time      `json:"updatedAt"`
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
	ReportStatusDiterima       ReportStatus = "diterima"
	ReportStatusDiverifikasi   ReportStatus = "diverifikasi"
	ReportStatusDitindaklanjuti ReportStatus = "ditindaklanjuti"
	ReportStatusDiteruskan     ReportStatus = "diteruskan"
	ReportStatusSelesai        ReportStatus = "selesai"
	ReportStatusDitolak        ReportStatus = "ditolak"
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
	ID              int64              `json:"id"`
	ContractID      int64              `json:"contractId"`
	ContractTitle   string             `json:"contractTitle,omitempty"`
	PelaporUserID   int64              `json:"pelaporUserId"`
	PelaporNama     string             `json:"pelaporNama,omitempty"`
	KodePelacakan   string             `json:"kodePelacakan"`
	Kategori        string             `json:"kategori"`
	Deskripsi       string             `json:"deskripsi"`
	LokasiLat       *float64           `json:"lokasiLat,omitempty"`
	LokasiLng       *float64           `json:"lokasiLng,omitempty"`
	Status          ReportStatus       `json:"status"`
	DibuatPada      time.Time          `json:"dibuatPada"`
	Attachments     []ReportAttachment `json:"attachments,omitempty"`
	Actions         []ReportAction     `json:"actions,omitempty"`
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
	IsiTeks        string   `json:"isiTeks"`
	KlausulList    []string `json:"klausulList"`
	IntegrityScore float64  `json:"integrityScore"`
	SHA256Hash     string   `json:"sha256Hash"`
}


