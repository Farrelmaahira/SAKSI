package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// ListCounterparties mengambil daftar rekanan/vendor dengan filter jenis dan search nama.
func (s *Store) ListCounterparties(ctx context.Context, jenis *string, search string) ([]domain.Counterparty, error) {
	query := `
		SELECT id, user_id, nama, jenis, COALESCE(npwp, ''), COALESCE(alamat, '')
		FROM counterparties
		WHERE ($1::text IS NULL OR jenis::text = $1)
		  AND ($2::text = '' OR nama ILIKE $2)
		ORDER BY nama ASC
	`
	searchTerm := ""
	if search != "" {
		searchTerm = "%" + search + "%"
	}

	rows, err := s.db.Query(ctx, query, jenis, searchTerm)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Counterparty
	for rows.Next() {
		var c domain.Counterparty
		if err := rows.Scan(&c.ID, &c.UserID, &c.Nama, &c.Jenis, &c.NPWP, &c.Alamat); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	if list == nil {
		list = []domain.Counterparty{}
	}
	return list, nil
}

// CounterpartyByID mengambil data counterparty spesifik berdasarkan ID.
func (s *Store) CounterpartyByID(ctx context.Context, id int64) (domain.Counterparty, error) {
	query := `
		SELECT id, user_id, nama, jenis, COALESCE(npwp, ''), COALESCE(alamat, '')
		FROM counterparties
		WHERE id = $1
	`
	var c domain.Counterparty
	err := s.db.QueryRow(ctx, query, id).Scan(&c.ID, &c.UserID, &c.Nama, &c.Jenis, &c.NPWP, &c.Alamat)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Counterparty{}, domain.ErrNotFound
		}
		return domain.Counterparty{}, err
	}
	return c, nil
}

// CreateContractWithDetails menyimpan kontrak baru secara atomik ke 5 tabel database.
func (s *Store) CreateContractWithDetails(ctx context.Context, p usecase.CreateContractParams) (domain.ContractDetail, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ContractDetail{}, err
	}
	defer tx.Rollback(ctx)

	// 1. Simpan tabel contracts
	var contractID int64
	var createdAt time.Time
	status := "diaudit"
	if p.AuditModel == "" || p.IntegrityScore <= 0 {
		status = "draf"
	}

	insertContractQuery := `
		INSERT INTO contracts (
			village_id, jenis, judul, nilai, tenggat, skema_pembayaran, metode_pemilihan, status, dibuat_oleh, dibuat_pada
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, now()
		) RETURNING id, dibuat_pada
	`
	err = tx.QueryRow(ctx, insertContractQuery,
		p.VillageID,
		string(p.Jenis),
		p.Judul,
		p.Nilai,
		p.Tenggat,
		p.SkemaPembayaran,
		p.MetodePemilihan,
		status,
		p.CreatedBy,
	).Scan(&contractID, &createdAt)
	if err != nil {
		return domain.ContractDetail{}, err
	}

	// 2. Simpan tabel contract_parties
	// Pihak Pertama: Desa / Kades
	insertParty1Query := `
		INSERT INTO contract_parties (contract_id, peran_pihak, village_id, user_id)
		VALUES ($1, 'pertama', $2, $3)
	`
	if _, err := tx.Exec(ctx, insertParty1Query, contractID, p.VillageID, p.CreatedBy); err != nil {
		return domain.ContractDetail{}, err
	}

	// Pihak Kedua: Rekanan / Counterparty
	insertParty2Query := `
		INSERT INTO contract_parties (contract_id, peran_pihak, counterparty_id)
		VALUES ($1, 'kedua', $2)
	`
	if _, err := tx.Exec(ctx, insertParty2Query, contractID, p.CounterpartyID); err != nil {
		return domain.ContractDetail{}, err
	}

	// 3. Simpan tabel contract_versions (versi 1)
	jawabanJSON, err := json.Marshal(p.JawabanForm)
	if err != nil {
		jawabanJSON = []byte("{}")
	}

	sumber := p.Sumber
	if sumber != "manual" {
		sumber = "ai"
	}
	var versionID int64
	insertVersionQuery := `
		INSERT INTO contract_versions (
			contract_id, nomor_versi, jawaban_form, isi, sumber, dibuat_oleh, dibuat_pada
		) VALUES (
			$1, 1, $2, $3, $4, $5, now()
		) RETURNING id
	`
	err = tx.QueryRow(ctx, insertVersionQuery, contractID, jawabanJSON, p.IsiTeks, sumber, p.CreatedBy).Scan(&versionID)
	if err != nil {
		return domain.ContractDetail{}, err
	}
	if err := insertClauses(ctx, tx, versionID, p.Clauses); err != nil {
		return domain.ContractDetail{}, err
	}

	// 4. Simpan tabel ai_audits
	// AuditModel kosong = audit AI tidak tersedia saat dibuat; kontrak tetap draf tanpa baris ai_audits.
	model := p.AuditModel
	var auditID int64
	if model != "" {
		insertAuditQuery := `
		INSERT INTO ai_audits (version_id, model, skor, status, dijalankan_pada)
		VALUES ($1, $2, $3, 'selesai', now()) RETURNING id
	`
		if err := tx.QueryRow(ctx, insertAuditQuery, versionID, model, p.IntegrityScore).Scan(&auditID); err != nil {
			return domain.ContractDetail{}, err
		}
	}
	for _, f := range p.AuditFindings {
		if _, err := tx.Exec(ctx,
			`INSERT INTO ai_audit_findings (audit_id, kode_pasal, tingkat, pesan) VALUES ($1, $2, $3, $4)`,
			auditID, f.KodePasal, f.Tingkat, f.Pesan,
		); err != nil {
			return domain.ContractDetail{}, err
		}
	}

	// 5. Simpan tabel contract_status_history
	if err := insertStatusHistory(ctx, tx, contractID, nil, status, p.CreatedBy); err != nil {
		return domain.ContractDetail{}, err
	}
	if err := insertAuditLog(ctx, tx, p.CreatedBy, "contract.create", contractID, nil, map[string]any{
		"status": status, "versionId": versionID, "sumber": sumber, "jumlahPasal": len(p.Clauses), "auditModel": model,
	}, p.ActorIP); err != nil {
		return domain.ContractDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.ContractDetail{}, err
	}

	detail := domain.ContractDetail{
		ID:              contractID,
		VillageID:       &p.VillageID,
		CounterpartyID:  &p.CounterpartyID,
		Jenis:           p.Jenis,
		Judul:           p.Judul,
		Nilai:           p.Nilai,
		Tenggat:         p.Tenggat,
		SkemaPembayaran: p.SkemaPembayaran,
		MetodePemilihan: p.MetodePemilihan,
		Status:          status,
		NomorVersi:      1,
		TeksKontrak:     p.IsiTeks,
		JawabanForm:     p.JawabanForm,
		Sumber:          sumber,
		Clauses:         p.Clauses,
		IntegrityScore:  p.IntegrityScore,
		SHA256Hash:      p.SHA256Hash,
		CreatedBy:       p.CreatedBy,
		CreatedAt:       createdAt,
	}

	return detail, nil
}

// GetContractDetail mengambil rincian kontrak, versi, pihak-pihak terkait, dan skor audit.
func (s *Store) GetContractDetail(ctx context.Context, id int64) (domain.ContractDetail, error) {
	query := `
		SELECT 
			c.id, c.village_id, COALESCE(v.nama, ''), c.jenis, c.judul, c.nilai, c.tenggat,
			COALESCE(c.skema_pembayaran, ''), COALESCE(c.metode_pemilihan, ''), c.status, c.dibuat_oleh, c.dibuat_pada,
			cp.counterparty_id, COALESCE(cp_party.nama, ''),
			cv.nomor_versi, COALESCE(cv.isi, ''), cv.jawaban_form,
			COALESCE(aa.skor, 0)
		FROM contracts c
		LEFT JOIN villages v ON c.village_id = v.id
		LEFT JOIN contract_parties cp ON c.id = cp.contract_id AND cp.peran_pihak = 'kedua'
		LEFT JOIN counterparties cp_party ON cp.counterparty_id = cp_party.id
		LEFT JOIN contract_versions cv ON c.id = cv.contract_id AND cv.nomor_versi = 1
		LEFT JOIN ai_audits aa ON cv.id = aa.version_id
		WHERE c.id = $1
	`

	var d domain.ContractDetail
	var jenisStr string
	var jawabanRaw []byte

	err := s.db.QueryRow(ctx, query, id).Scan(
		&d.ID, &d.VillageID, &d.VillageName, &jenisStr, &d.Judul, &d.Nilai, &d.Tenggat,
		&d.SkemaPembayaran, &d.MetodePemilihan, &d.Status, &d.CreatedBy, &d.CreatedAt,
		&d.CounterpartyID, &d.CounterpartyNama,
		&d.NomorVersi, &d.TeksKontrak, &jawabanRaw,
		&d.IntegrityScore,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.ContractDetail{}, domain.ErrNotFound
		}
		return domain.ContractDetail{}, err
	}

	d.Jenis = domain.ContractJenis(jenisStr)
	if len(jawabanRaw) > 0 {
		_ = json.Unmarshal(jawabanRaw, &d.JawabanForm)
	}

	return d, nil
}
