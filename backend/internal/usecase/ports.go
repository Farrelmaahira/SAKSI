package usecase

import (
	"context"
	"errors"
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
	VillageID       int64
	CounterpartyID  int64
	Jenis           domain.ContractJenis
	Judul           string
	Nilai           float64
	Tenggat         time.Time
	SkemaPembayaran string
	MetodePemilihan string
	JawabanForm     map[string]any
	IsiTeks         string
	CreatedBy       int64
	IntegrityScore  float64
	SHA256Hash      string
	AuditModel      string
	AuditFindings   []domain.AuditFinding
	Sumber          string          // "ai" | "manual"; kosong = "ai"
	Clauses         []domain.Clause // disimpan ke contract_clauses
	ActorIP         string
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
	// Clauses non-nil = versi manual dari editor pasal (menggantikan JawabanForm/DrafTeksOverride).
	Clauses []domain.Clause
	ActorIP string
}

type SaveAuditParams struct {
	ContractID int64
	VersionID  int64
	ActorID    int64
	ActorIP    string
	Result     domain.AuditResult
}

type PublishParams struct {
	ContractID    int64
	VersionID     int64
	ActorID       int64
	ActorIP       string
	IsiTersaring  string
	RedactedKinds []string
}

type SubmitReviewParams struct {
	ContractID   int64
	VendorUserID int64
	ClauseID     *int64
	Komentar     string
	Status       string // "setuju" | "minta_revisi"
	ActorIP      string
}

type SignContractParams struct {
	ContractID int64
	UserID     int64
	CallerRole domain.UserRole
	StorageKey string
	Metode     string // "simulasi" | "psre"
	// VillageID desa di token kades; kades hanya boleh menandatangani kontrak desanya sendiri.
	VillageID *int64
	ActorIP   string
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
	// GetCitizenReportByID: ErrNotFound juga untuk laporan di luar cakupan pemanggil (cegah menebak id).
	GetCitizenReportByID(ctx context.Context, reportID int64, sc Scope) (domain.CitizenReport, error)
	ListCitizenReportsByContract(ctx context.Context, contractID int64, villageID int64, requesterRole domain.UserRole) ([]domain.CitizenReport, error)
	ListCitizenReports(ctx context.Context, filter ListReportsFilter) ([]domain.CitizenReport, error)
	SaveUploadedFile(ctx context.Context, key string, mime string, size int64, uploadedBy int64) (int64, error)

	// Contract Lifecycle
	ReviseContract(ctx context.Context, p ReviseContractParams) (domain.ContractVersion, error)
	SubmitContractReview(ctx context.Context, p SubmitReviewParams) (domain.ContractReview, error)
	SignContract(ctx context.Context, p SignContractParams) (domain.Signature, *domain.DocumentSeal, error)
	GetContractLifecycleDetail(ctx context.Context, contractID int64, callerUserID int64, callerRole domain.UserRole, callerVillageID *int64) (domain.ContractLifecycleDetail, error)

	// Drafting AI + manual
	RegionIDByVillage(ctx context.Context, villageID int64) (int64, error)
	DraftingOptions(ctx context.Context, regionID int64) (domain.DraftingOptions, error)
	ContractDraftState(ctx context.Context, contractID int64) (domain.ContractDraftState, error)
	SaveContractAudit(ctx context.Context, p SaveAuditParams) (int64, error)
	// LatestContractAudit: villageID kontrak untuk otorisasi; audit nil bila belum pernah diaudit.
	LatestContractAudit(ctx context.Context, contractID int64) (villageID int64, audit *domain.ContractAudit, err error)
	PublishContract(ctx context.Context, p PublishParams) (domain.Publication, error)

	// Termin, SPK, progres pekerjaan
	ListTerminSummaries(ctx context.Context, sc Scope) ([]domain.TerminSummary, error)
	GetContractTermin(ctx context.Context, contractID int64, sc Scope) (domain.ContractTermin, error)
	SetPaymentTerms(ctx context.Context, p SetTermsParams) (domain.ContractTermin, error)
	SetSPK(ctx context.Context, p SetSPKParams) (domain.ContractTermin, error)
	// ReportProgress mengembalikan juga villageID kontrak untuk invalidasi cache publik.
	ReportProgress(ctx context.Context, p ReportProgressParams) (domain.WorkProgress, int64, error)
	PayTerm(ctx context.Context, p PayTermParams) (domain.PaymentTerm, int64, error)

	// Tindak lanjut laporan warga
	ListReportActions(ctx context.Context, reportID int64, sc Scope) ([]domain.ReportAction, error)
	AddReportAction(ctx context.Context, p ReportActionParams) (domain.ReportAction, domain.ReportStatus, error)

	// Segel
	VerifySeal(ctx context.Context, hash string, verifierID *int64) (domain.SealVerifyResult, error)
	ListSeals(ctx context.Context, sc Scope) ([]domain.SealSummary, error)

	// Notifikasi
	ListNotifications(ctx context.Context, userID int64, unreadOnly bool, limit int, before int64) ([]domain.Notification, int, error)
	MarkNotificationRead(ctx context.Context, userID, id int64) error
	MarkAllNotificationsRead(ctx context.Context, userID int64) (int64, error)

	// Jejak audit dan LHP
	ListAuditLogs(ctx context.Context, f AuditLogFilter) ([]domain.AuditLogEntry, error)
	CreateAuditReport(ctx context.Context, p CreateAuditReportParams) (domain.AuditReport, error)
	ListAuditReports(ctx context.Context, sc Scope, contractID *int64, status string) ([]domain.AuditReport, error)
	GetAuditReport(ctx context.Context, id int64, sc Scope) (domain.AuditReport, error)
	PublishAuditReport(ctx context.Context, id int64, sc Scope, ip string) (domain.AuditReport, error)

	// Admin daerah
	RegionIDsForUser(ctx context.Context, userID int64, role domain.UserRole) ([]int64, error)
	ListRegionRules(ctx context.Context, regionIDs []int64) ([]domain.RegionRule, error)
	CreateRegionRule(ctx context.Context, p CreateRegionRuleParams) (domain.RegionRule, error)
	ListPengawas(ctx context.Context, regionIDs []int64, jenis string) ([]domain.Pengawas, error)
	ListOversightAssignments(ctx context.Context, regionIDs []int64, contractID *int64) ([]domain.OversightAssignment, error)
	CreateOversightAssignment(ctx context.Context, p AssignOversightParams) (domain.OversightAssignment, error)

	// Profil dan kata sandi
	UpdateProfile(ctx context.Context, p UpdateProfileParams) (domain.User, error)
	ChangePassword(ctx context.Context, userID int64, newHash, ip string) error
	CreatePasswordReset(ctx context.Context, userID int64, tokenHash string, ttl time.Duration) error
	// ResetPassword: ErrNotFound bila token tidak ada, kedaluwarsa, atau sudah dipakai.
	ResetPassword(ctx context.Context, tokenHash, newHash, ip string) error
}

type Storage interface {
	Save(ctx context.Context, key string, r io.Reader, size int64, contentType string) (string, error)
	Open(ctx context.Context, key string) (io.ReadCloser, int64, string, error)
}

// ErrAIUnavailable: semua model AI gagal (UNAVAILABLE, DEADLINE_EXCEEDED). Adapter mengembalikan *AIUnavailableError.
var ErrAIUnavailable = errors.New("ai engine tidak tersedia")

type AuditInput struct {
	Jenis              domain.ContractJenis
	Clauses            []domain.Clause
	MandatoryKodePasal []string
	LegalReferences    []domain.LegalReference
}

type DraftInput struct {
	Jenis           domain.ContractJenis
	Jawaban         map[string]string
	ClauseLibrary   []domain.Clause
	LegalReferences []domain.LegalReference
}

type DraftOutput struct {
	Clauses []domain.Clause
	Model   string
}

type RedactOutput struct {
	Text          string
	RedactedKinds []string
}

// AIEngine adalah layanan ai-engine (gRPC saksi.ai.v1.AiEngine). AI hanya penasihat; semua hasil bisa disunting manusia.
type AIEngine interface {
	AuditClauses(ctx context.Context, in AuditInput) (domain.AuditResult, error)
	DraftContract(ctx context.Context, in DraftInput) (DraftOutput, error)
	RedactText(ctx context.Context, text string) (RedactOutput, error)
}

// Cache adalah cache-aside bersama antar instance (Redis). Postgres tetap sumber kebenaran.
// Get mengembalikan ok=false saat miss. Semua kunci wajib punya TTL.
type Cache interface {
	Get(ctx context.Context, key string) (val []byte, ok bool, err error)
	Set(ctx context.Context, key string, val []byte, ttl time.Duration) error
	Del(ctx context.Context, keys ...string) error
	DelPrefix(ctx context.Context, prefix string) error
}

// RateLimiter menghitung percobaan per kunci dalam satu jendela waktu (fixed window).
type RateLimiter interface {
	Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error)
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
