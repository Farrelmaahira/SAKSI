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
	RoleKades       UserRole = "kades"
	RoleBPD         UserRole = "bpd"
	RoleInspektorat UserRole = "inspektorat"
	RolePenyedia    UserRole = "penyedia"
	RoleAdminDaerah UserRole = "admin_daerah"
	RoleWarga       UserRole = "warga"
)

func (r UserRole) Valid() bool {
	switch r {
	case RoleKades, RoleBPD, RoleInspektorat, RolePenyedia, RoleAdminDaerah, RoleWarga:
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

