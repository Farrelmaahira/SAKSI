package postgres

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

//go:embed schema.sql
var schema string

type Store struct {
	db *pgxpool.Pool
}

var _ usecase.Store = (*Store)(nil)

func Open(ctx context.Context, url string) (*Store, error) {
	db, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, err
	}
	return &Store{db: db}, nil
}

func (s *Store) Close() {
	s.db.Close()
}

func notFound(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.ErrNotFound
	}
	return err
}

func (s *Store) CreateUserWithRole(ctx context.Context, p usecase.RegisterUserParams) (domain.User, error) {
	var user domain.User
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return user, err
	}
	defer tx.Rollback(ctx)

	var userID int64
	var createdAt time.Time
	insertUserSQL := `INSERT INTO users (nama, email, password_hash, status, dibuat_pada)
		VALUES ($1, $2, $3, 'aktif', now()) RETURNING id, dibuat_pada`
	err = tx.QueryRow(ctx, insertUserSQL, p.Nama, p.Email, p.PasswordHash).Scan(&userID, &createdAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return user, domain.ErrConflict
		}
		return user, err
	}

	insertRoleSQL := `INSERT INTO user_roles (user_id, role, village_id) VALUES ($1, $2, $3)`
	_, err = tx.Exec(ctx, insertRoleSQL, userID, string(p.Role), p.VillageID)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return user, fmt.Errorf("domain: invalid village reference: %w", domain.ErrNotFound)
		}
		return user, err
	}

	switch p.Role {
	case domain.RoleWarga:
		insertWargaSQL := `INSERT INTO warga_profiles (user_id, village_id, no_hp) VALUES ($1, $2, $3)`
		_, err = tx.Exec(ctx, insertWargaSQL, userID, p.VillageID, p.NoHP)
		if err != nil {
			return user, err
		}
	case domain.RolePenyedia:
		jenis := p.CounterpartyJenis
		if jenis == "" {
			jenis = "penyedia"
		}
		nama := p.CounterpartyName
		if nama == "" {
			nama = p.Nama
		}
		insertCounterpartySQL := `INSERT INTO counterparties (user_id, nama, jenis, npwp, alamat) VALUES ($1, $2, $3, $4, $5)`
		_, err = tx.Exec(ctx, insertCounterpartySQL, userID, nama, jenis, p.NPWP, p.Alamat)
		if err != nil {
			return user, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return user, err
	}

	user = domain.User{
		ID:                userID,
		Email:             p.Email,
		Role:              p.Role,
		Name:              p.Nama,
		Status:            "aktif",
		VillageID:         p.VillageID,
		NoHP:              p.NoHP,
		CounterpartyName:  p.CounterpartyName,
		CounterpartyJenis: p.CounterpartyJenis,
		NPWP:              p.NPWP,
		Alamat:            p.Alamat,
		CreatedAt:         createdAt,
		UpdatedAt:         createdAt,
	}
	return user, nil
}

func (s *Store) UserByEmail(ctx context.Context, email string) (domain.User, error) {
	var u domain.User
	var roleStr string
	query := `SELECT u.id, u.nama, u.email, u.password_hash, u.status, u.dibuat_pada,
		COALESCE(ur.role::text, ''), ur.village_id, COALESCE(v.nama, '')
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN villages v ON ur.village_id = v.id
		WHERE LOWER(u.email) = LOWER($1)
		LIMIT 1`
	err := s.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Status, &u.CreatedAt,
		&roleStr, &u.VillageID, &u.VillageName,
	)
	if err != nil {
		return u, notFound(err)
	}
	u.Role = domain.UserRole(roleStr)
	u.UpdatedAt = u.CreatedAt
	return u, nil
}

func (s *Store) UserByID(ctx context.Context, id int64) (domain.User, error) {
	var u domain.User
	var roleStr string
	query := `SELECT u.id, u.nama, u.email, u.password_hash, u.status, u.dibuat_pada,
		COALESCE(ur.role::text, ''), ur.village_id, COALESCE(v.nama, '')
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN villages v ON ur.village_id = v.id
		WHERE u.id = $1
		LIMIT 1`
	err := s.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Status, &u.CreatedAt,
		&roleStr, &u.VillageID, &u.VillageName,
	)
	if err != nil {
		return u, notFound(err)
	}
	u.Role = domain.UserRole(roleStr)
	u.UpdatedAt = u.CreatedAt
	return u, nil
}

func (s *Store) ListContracts(ctx context.Context, villageID string, role domain.UserRole, search string) ([]domain.Contract, error) {
	var rows pgx.Rows
	var err error

	// Auditor sees cross-village; village heads and observers are restricted by tenant villageID
	if role == domain.RoleInspektorat {
		if search != "" {
			q := `SELECT id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
				sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
				FROM contracts WHERE title ILIKE $1 OR vendor_name ILIKE $1 OR contract_number ILIKE $1 ORDER BY created_at DESC`
			rows, err = s.db.Query(ctx, q, "%"+search+"%")
		} else {
			q := `SELECT id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
				sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
				FROM contracts ORDER BY created_at DESC`
			rows, err = s.db.Query(ctx, q)
		}
	} else {
		if search != "" {
			q := `SELECT id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
				sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
				FROM contracts WHERE village_id = $1 AND (title ILIKE $2 OR vendor_name ILIKE $2 OR contract_number ILIKE $2) ORDER BY created_at DESC`
			rows, err = s.db.Query(ctx, q, villageID, "%"+search+"%")
		} else {
			q := `SELECT id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
				sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
				FROM contracts WHERE village_id = $1 ORDER BY created_at DESC`
			rows, err = s.db.Query(ctx, q, villageID)
		}
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Contract
	for rows.Next() {
		var c domain.Contract
		err := rows.Scan(&c.ID, &c.ContractNumber, &c.VillageID, &c.VillageName, &c.Title, &c.Category, &c.VendorName, &c.Amount, &c.Status,
			&c.SHA256Hash, &c.IntegrityScore, &c.Rating, &c.Volume, &c.FiscalYear, &c.ClausesCount, &c.MandatoryFulfilled, &c.CreatedBy, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, nil
}

func (s *Store) ContractByID(ctx context.Context, id string) (domain.Contract, error) {
	var c domain.Contract
	query := `SELECT id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
		sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at
		FROM contracts WHERE id = $1`
	err := s.db.QueryRow(ctx, query, id).Scan(&c.ID, &c.ContractNumber, &c.VillageID, &c.VillageName, &c.Title, &c.Category, &c.VendorName, &c.Amount, &c.Status,
		&c.SHA256Hash, &c.IntegrityScore, &c.Rating, &c.Volume, &c.FiscalYear, &c.ClausesCount, &c.MandatoryFulfilled, &c.CreatedBy, &c.CreatedAt, &c.UpdatedAt)
	return c, notFound(err)
}

func (s *Store) CreateContract(ctx context.Context, c domain.Contract) (domain.Contract, error) {
	query := `INSERT INTO contracts (id, contract_number, village_id, village_name, title, category, vendor_name, amount, status,
		sha256_hash, integrity_score, rating, volume, fiscal_year, clauses_count, mandatory_fulfilled, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`
	_, err := s.db.Exec(ctx, query, c.ID, c.ContractNumber, c.VillageID, c.VillageName, c.Title, c.Category, c.VendorName, c.Amount, string(c.Status),
		c.SHA256Hash, c.IntegrityScore, c.Rating, c.Volume, c.FiscalYear, c.ClausesCount, c.MandatoryFulfilled, c.CreatedBy, c.CreatedAt, c.UpdatedAt)
	return c, err
}

func (s *Store) UpdateContractStatus(ctx context.Context, id string, status domain.ContractStatus, hash string, score float64) error {
	query := `UPDATE contracts SET status = $1, sha256_hash = $2, integrity_score = $3, updated_at = now() WHERE id = $4`
	cmd, err := s.db.Exec(ctx, query, string(status), hash, score, id)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (s *Store) CreateEvidence(ctx context.Context, e domain.EvidenceFile) (domain.EvidenceFile, error) {
	query := `INSERT INTO evidence_files (id, contract_id, file_key, file_name, mime_type, file_size_bytes, uploaded_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := s.db.Exec(ctx, query, e.ID, e.ContractID, e.FileKey, e.FileName, e.MimeType, e.FileSizeBytes, e.UploadedBy, e.CreatedAt)
	return e, err
}

func (s *Store) ListEvidenceByContract(ctx context.Context, contractID string) ([]domain.EvidenceFile, error) {
	query := `SELECT id, contract_id, file_key, file_name, mime_type, file_size_bytes, uploaded_by, created_at FROM evidence_files WHERE contract_id = $1 ORDER BY created_at ASC`
	rows, err := s.db.Query(ctx, query, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.EvidenceFile
	for rows.Next() {
		var e domain.EvidenceFile
		if err := rows.Scan(&e.ID, &e.ContractID, &e.FileKey, &e.FileName, &e.MimeType, &e.FileSizeBytes, &e.UploadedBy, &e.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, e)
	}
	return list, nil
}

func (s *Store) GetDashboardMetrics(ctx context.Context, villageID string, role domain.UserRole) (domain.DashboardMetrics, error) {
	var m domain.DashboardMetrics
	var countQuery string
	var args []any

	if role == domain.RoleInspektorat {
		countQuery = `SELECT 
			COUNT(*),
			COALESCE(SUM(amount), 0),
			COUNT(*) FILTER (WHERE status = 'under_review'),
			COUNT(*) FILTER (WHERE status = 'sealed')
			FROM contracts`
	} else {
		countQuery = `SELECT 
			COUNT(*),
			COALESCE(SUM(amount), 0),
			COUNT(*) FILTER (WHERE status = 'under_review'),
			COUNT(*) FILTER (WHERE status = 'sealed')
			FROM contracts WHERE village_id = $1`
		args = append(args, villageID)
	}

	err := s.db.QueryRow(ctx, countQuery, args...).Scan(
		&m.ActiveContractsCount,
		&m.TotalRealizationBudget,
		&m.PendingReviewCount,
		&m.SealedContractsCount,
	)
	if err != nil {
		return m, err
	}

	m.ActiveContractsChange = 15.5
	m.RealizationChange = 8.4
	m.PendingReviewChange = -10.5
	m.SealedContractsChange = 4.4
	m.IntegrityIndex = 94

	return m, nil
}

