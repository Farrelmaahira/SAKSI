package usecase

import (
	"context"
	"io"
	"time"

	"saksi-backend/internal/domain"
)

type RegisterUserParams struct {
	Nama              string
	Email             string
	PasswordHash      string
	Role              domain.UserRole
	VillageID         *int64
	NoHP              string
	CounterpartyName  string
	CounterpartyJenis string
	NPWP              string
	Alamat            string
}

type CreateContractParams struct {
	VillageID        int64
	CounterpartyID   int64
	Jenis            domain.ContractJenis
	Judul            string
	Nilai            float64
	Tenggat          time.Time
	SkemaPembayaran  string
	MetodePemilihan  string
	JawabanForm      map[string]any
	IsiTeks          string
	CreatedBy        int64
	IntegrityScore   float64
	SHA256Hash       string
	AuditModel       string
	AuditFindings    []domain.AuditFinding
}

type ListReportsFilter struct {
	RequesterRole   domain.UserRole
	RequesterUserID int64
	VillageID       int64
	ContractID      *int64
	Status          *domain.ReportStatus
	Search          string
}

type ReviseContractParams struct {
	ContractID       int64
	KadesUserID      int64
	VillageID        int64
	JawabanForm      map[string]any
	DrafTeksOverride string
}

type SubmitReviewParams struct {
	ContractID   int64
	VendorUserID int64
	ClauseID     *int64
	Komentar     string
	Status       string // "setuju" | "minta_revisi"
}

type SignContractParams struct {
	ContractID int64
	UserID     int64
	CallerRole domain.UserRole
	StorageKey string
	Metode     string // "simulasi" | "psre"
}

type Store interface {
	CreateUserWithRole(ctx context.Context, p RegisterUserParams) (domain.User, error)
	UserByEmail(ctx context.Context, email string) (domain.User, error)
	UserByID(ctx context.Context, id int64) (domain.User, error)

	ListCounterparties(ctx context.Context, jenis *string, search string) ([]domain.Counterparty, error)
	CounterpartyByID(ctx context.Context, id int64) (domain.Counterparty, error)
	CreateContractWithDetails(ctx context.Context, p CreateContractParams) (domain.ContractDetail, error)
	GetContractDetail(ctx context.Context, id int64) (domain.ContractDetail, error)

	ListContracts(ctx context.Context, villageID string, role domain.UserRole, query string) ([]domain.Contract, error)
	ContractByID(ctx context.Context, id string) (domain.Contract, error)
	CreateContract(ctx context.Context, c domain.Contract) (domain.Contract, error)
	UpdateContractStatus(ctx context.Context, id string, status domain.ContractStatus, hash string, score float64) error

	CreateEvidence(ctx context.Context, e domain.EvidenceFile) (domain.EvidenceFile, error)
	ListEvidenceByContract(ctx context.Context, contractID string) ([]domain.EvidenceFile, error)

	GetDashboardMetrics(ctx context.Context, villageID string, role domain.UserRole) (domain.DashboardMetrics, error)

	// Public Contracts & Citizen Reports
	ListPublicContracts(ctx context.Context, villageID int64, search string) ([]domain.PublicContractSummary, error)
	GetPublicContractDetail(ctx context.Context, villageID int64, contractID int64) (domain.PublicContractDetail, error)
	CreateCitizenReport(ctx context.Context, r domain.CitizenReport, fileIDs []int64) (domain.CitizenReport, error)
	ListCitizenReportsByReporter(ctx context.Context, reporterID int64) ([]domain.CitizenReport, error)
	GetCitizenReportByID(ctx context.Context, reportID int64, requesterID int64, requesterRole domain.UserRole) (domain.CitizenReport, error)
	ListCitizenReportsByContract(ctx context.Context, contractID int64, villageID int64, requesterRole domain.UserRole) ([]domain.CitizenReport, error)
	ListCitizenReports(ctx context.Context, filter ListReportsFilter) ([]domain.CitizenReport, error)
	SaveUploadedFile(ctx context.Context, key string, mime string, size int64, uploadedBy int64) (int64, error)

	// Contract Lifecycle
	ReviseContract(ctx context.Context, p ReviseContractParams) (domain.ContractVersion, error)
	SubmitContractReview(ctx context.Context, p SubmitReviewParams) (domain.ContractReview, error)
	SignContract(ctx context.Context, p SignContractParams) (domain.Signature, *domain.DocumentSeal, error)
	GetContractLifecycleDetail(ctx context.Context, contractID int64, callerUserID int64, callerRole domain.UserRole, callerVillageID *int64) (domain.ContractLifecycleDetail, error)
}

type Storage interface {
	Save(ctx context.Context, key string, r io.Reader, size int64, contentType string) (string, error)
	Open(ctx context.Context, key string) (io.ReadCloser, int64, string, error)
}

type AIEngine interface {
	AuditClauses(ctx context.Context, contractText string) (domain.AuditResult, error)
}

func AuthorizeContractAccess(callerRole domain.UserRole, callerVillageID string, contract domain.Contract) error {
	if callerRole == domain.RoleInspektorat {
		return nil
	}
	if contract.VillageID != callerVillageID {
		return domain.ErrForbidden
	}
	return nil
}

