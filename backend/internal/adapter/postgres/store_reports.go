package postgres

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
)

// ListPublicContracts mengambil daftar kontrak publik (status dipublikasikan, berjalan, selesai).
func (s *Store) ListPublicContracts(ctx context.Context, villageID int64, search string) ([]domain.PublicContractSummary, error) {
	query := `
		SELECT 
			c.id, 
			c.judul, 
			c.jenis::text, 
			c.nilai, 
			c.tenggat, 
			c.status::text,
			COALESCE(c.village_id, 0),
			COALESCE(v.nama, '') AS village_name,
			COALESCE(cpy.nama, '') AS counterparty_nama
		FROM contracts c
		LEFT JOIN villages v ON v.id = c.village_id
		LEFT JOIN contract_parties cp ON cp.contract_id = c.id AND cp.peran_pihak = 'kedua'
		LEFT JOIN counterparties cpy ON cpy.id = cp.counterparty_id
		WHERE c.status::text IN ('dipublikasikan', 'berjalan', 'selesai')
		  AND ($1::bigint = 0 OR c.village_id = $1)
		  AND ($2::text = '' OR c.judul ILIKE $2)
		ORDER BY c.dibuat_pada DESC
	`
	searchTerm := ""
	if search != "" {
		searchTerm = "%" + search + "%"
	}

	rows, err := s.db.Query(ctx, query, villageID, searchTerm)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.PublicContractSummary
	for rows.Next() {
		var item domain.PublicContractSummary
		if err := rows.Scan(
			&item.ID,
			&item.Judul,
			&item.Jenis,
			&item.Nilai,
			&item.Tenggat,
			&item.Status,
			&item.VillageID,
			&item.VillageName,
			&item.CounterpartyNama,
		); err != nil {
			return nil, err
		}
		item.Nomor = fmt.Sprintf("SPK-%d-%04d", item.VillageID, item.ID)
		list = append(list, item)
	}
	if list == nil {
		list = []domain.PublicContractSummary{}
	}
	return list, nil
}

// GetPublicContractDetail mengambil detail kontrak publik beserta teks klausul pasalnya.
func (s *Store) GetPublicContractDetail(ctx context.Context, villageID int64, contractID int64) (domain.PublicContractDetail, error) {
	query := `
		SELECT 
			c.id, 
			c.judul, 
			c.jenis::text, 
			c.nilai, 
			c.tenggat, 
			c.status::text,
			COALESCE(c.village_id, 0),
			COALESCE(v.nama, '') AS village_name,
			COALESCE(cpy.nama, '') AS counterparty_nama,
			COALESCE(cv.isi, '') AS isi_teks,
			COALESCE(aa.skor, 0) AS integrity_score
		FROM contracts c
		LEFT JOIN villages v ON v.id = c.village_id
		LEFT JOIN contract_parties cp ON cp.contract_id = c.id AND cp.peran_pihak = 'kedua'
		LEFT JOIN counterparties cpy ON cpy.id = cp.counterparty_id
		LEFT JOIN LATERAL (
			SELECT id, isi FROM contract_versions
			WHERE contract_id = c.id
			ORDER BY nomor_versi DESC
			LIMIT 1
		) cv ON true
		LEFT JOIN LATERAL (
			SELECT skor FROM ai_audits
			WHERE version_id = cv.id
			ORDER BY dijalankan_pada DESC
			LIMIT 1
		) aa ON true
		WHERE c.id = $1
		  AND c.status::text IN ('dipublikasikan', 'berjalan', 'selesai')
		  AND ($2::bigint = 0 OR c.village_id = $2)
	`
	var res domain.PublicContractDetail
	err := s.db.QueryRow(ctx, query, contractID, villageID).Scan(
		&res.ID,
		&res.Judul,
		&res.Jenis,
		&res.Nilai,
		&res.Tenggat,
		&res.Status,
		&res.VillageID,
		&res.VillageName,
		&res.CounterpartyNama,
		&res.IsiTeks,
		&res.IntegrityScore,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.PublicContractDetail{}, domain.ErrNotFound
		}
		return domain.PublicContractDetail{}, err
	}

	res.Nomor = fmt.Sprintf("SPK-%d-%04d", res.VillageID, res.ID)
	// Ekstraksi klausul dari isi teks
	res.KlausulList = extractClauses(res.IsiTeks)
	return res, nil
}

// SetContractStatus mengupdate status kontrak (misal untuk transisi lifecycle publik).
func (s *Store) SetContractStatus(ctx context.Context, id int64, status string) error {
	_, err := s.db.Exec(ctx, `UPDATE contracts SET status = $1::contracts_status_enum WHERE id = $2`, status, id)
	return err
}


// extractClauses mem-parsing judul-judul pasal dari naskah SPK
func extractClauses(text string) []string {
	var clauses []string
	lines := strings.Split(text, "\n")
	for _, l := range lines {
		trimmed := strings.TrimSpace(l)
		if strings.HasPrefix(strings.ToUpper(trimmed), "PASAL ") {
			clauses = append(clauses, trimmed)
		}
	}
	if len(clauses) == 0 {
		clauses = []string{
			"Pasal 1 - Lingkup Pekerjaan / Pengadaan",
			"Pasal 2 - Nilai Kontrak dan Skema Pembayaran",
			"Pasal 3 - Waktu Pelaksanaan dan Tenggat",
			"Pasal 4 - Hak dan Kewajiban",
			"Pasal 5 - Sanksi dan Denda Keterlambatan",
		}
	}
	return clauses
}

// SaveUploadedFile menyimpan metadata file ke tabel files
func (s *Store) SaveUploadedFile(ctx context.Context, key string, mime string, size int64, uploadedBy int64) (int64, error) {
	query := `
		INSERT INTO files (kunci_penyimpanan, mime, ukuran, diunggah_oleh, diunggah_pada)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id
	`
	var fileID int64
	err := s.db.QueryRow(ctx, query, key, mime, size, uploadedBy).Scan(&fileID)
	if err != nil {
		return 0, err
	}
	return fileID, nil
}

// CreateCitizenReport menyimpan laporan pengaduan masyarakat secara atomik
func (s *Store) CreateCitizenReport(ctx context.Context, r domain.CitizenReport, fileIDs []int64) (domain.CitizenReport, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.CitizenReport{}, err
	}
	defer tx.Rollback(ctx)

	// Pastikan kontrak ada dan valid
	var contractTitle string
	err = tx.QueryRow(ctx, `SELECT judul FROM contracts WHERE id = $1`, r.ContractID).Scan(&contractTitle)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.CitizenReport{}, fmt.Errorf("contract %d not found: %w", r.ContractID, domain.ErrNotFound)
		}
		return domain.CitizenReport{}, err
	}
	r.ContractTitle = contractTitle

	// Generate kode pelacakan unik format LAP-YYYYMMDD-XXXX
	if r.KodePelacakan == "" {
		r.KodePelacakan = generateTrackingCode()
	}

	reportQuery := `
		INSERT INTO citizen_reports (
			contract_id, pelapor_user_id, kode_pelacakan, kategori, deskripsi, lokasi_lat, lokasi_lng, status, dibuat_pada
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'diterima', NOW())
		RETURNING id, status, dibuat_pada
	`
	var statusStr string
	err = tx.QueryRow(
		ctx,
		reportQuery,
		r.ContractID,
		r.PelaporUserID,
		r.KodePelacakan,
		r.Kategori,
		r.Deskripsi,
		r.LokasiLat,
		r.LokasiLng,
	).Scan(&r.ID, &statusStr, &r.DibuatPada)
	if err != nil {
		return domain.CitizenReport{}, err
	}
	r.Status = domain.ReportStatus(statusStr)

	// Hubungkan lampiran foto jika ada
	for _, fID := range fileIDs {
		_, err = tx.Exec(ctx, `INSERT INTO report_attachments (report_id, file_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, r.ID, fID)
		if err != nil {
			return domain.CitizenReport{}, err
		}
	}

	// Buat action log awal "Laporan Diterima"
	actionQuery := `
		INSERT INTO report_actions (report_id, aktor_user_id, tindakan, catatan, waktu)
		VALUES ($1, $2, 'klarifikasi', 'Laporan pengaduan masyarakat telah diterima sistem SAKSI.', NOW())
		RETURNING id, waktu
	`
	var action domain.ReportAction
	action.ReportID = r.ID
	action.AktorUserID = r.PelaporUserID
	action.Tindakan = "klarifikasi"
	action.Catatan = "Laporan pengaduan masyarakat telah diterima sistem SAKSI."
	_ = tx.QueryRow(ctx, actionQuery, r.ID, r.PelaporUserID).Scan(&action.ID, &action.Waktu)
	r.Actions = []domain.ReportAction{action}

	if err := tx.Commit(ctx); err != nil {
		return domain.CitizenReport{}, err
	}

	return r, nil
}

// ListCitizenReportsByReporter mengambil seluruh laporan yang dikirimkan oleh seorang warga
func (s *Store) ListCitizenReportsByReporter(ctx context.Context, reporterID int64) ([]domain.CitizenReport, error) {
	query := `
		SELECT 
			cr.id, 
			cr.contract_id, 
			COALESCE(c.judul, '') AS contract_title,
			cr.pelapor_user_id, 
			COALESCE(u.nama, '') AS pelapor_nama,
			cr.kode_pelacakan, 
			cr.kategori, 
			cr.deskripsi, 
			cr.lokasi_lat, 
			cr.lokasi_lng, 
			cr.status::text, 
			cr.dibuat_pada
		FROM citizen_reports cr
		LEFT JOIN contracts c ON c.id = cr.contract_id
		LEFT JOIN users u ON u.id = cr.pelapor_user_id
		WHERE cr.pelapor_user_id = $1
		ORDER BY cr.dibuat_pada DESC
	`
	rows, err := s.db.Query(ctx, query, reporterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.CitizenReport
	for rows.Next() {
		var r domain.CitizenReport
		var statusStr string
		if err := rows.Scan(
			&r.ID,
			&r.ContractID,
			&r.ContractTitle,
			&r.PelaporUserID,
			&r.PelaporNama,
			&r.KodePelacakan,
			&r.Kategori,
			&r.Deskripsi,
			&r.LokasiLat,
			&r.LokasiLng,
			&statusStr,
			&r.DibuatPada,
		); err != nil {
			return nil, err
		}
		r.Status = domain.ReportStatus(statusStr)

		// Attachments
		r.Attachments = s.loadAttachments(ctx, r.ID)
		list = append(list, r)
	}
	if list == nil {
		list = []domain.CitizenReport{}
	}
	return list, nil
}

// GetCitizenReportByID mengambil satu laporan spesifik dengan pengecekan privasi role
func (s *Store) GetCitizenReportByID(ctx context.Context, reportID int64, requesterID int64, requesterRole domain.UserRole) (domain.CitizenReport, error) {
	query := `
		SELECT 
			cr.id, 
			cr.contract_id, 
			COALESCE(c.judul, '') AS contract_title,
			cr.pelapor_user_id, 
			COALESCE(u.nama, '') AS pelapor_nama,
			cr.kode_pelacakan, 
			cr.kategori, 
			cr.deskripsi, 
			cr.lokasi_lat, 
			cr.lokasi_lng, 
			cr.status::text, 
			cr.dibuat_pada
		FROM citizen_reports cr
		LEFT JOIN contracts c ON c.id = cr.contract_id
		LEFT JOIN users u ON u.id = cr.pelapor_user_id
		WHERE cr.id = $1
	`
	var r domain.CitizenReport
	var statusStr string
	err := s.db.QueryRow(ctx, query, reportID).Scan(
		&r.ID,
		&r.ContractID,
		&r.ContractTitle,
		&r.PelaporUserID,
		&r.PelaporNama,
		&r.KodePelacakan,
		&r.Kategori,
		&r.Deskripsi,
		&r.LokasiLat,
		&r.LokasiLng,
		&statusStr,
		&r.DibuatPada,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.CitizenReport{}, domain.ErrNotFound
		}
		return domain.CitizenReport{}, err
	}
	r.Status = domain.ReportStatus(statusStr)

	// Validasi Hak Akses (IDOR)
	if requesterRole == domain.RoleWarga && r.PelaporUserID != requesterID {
		return domain.CitizenReport{}, domain.ErrForbidden
	}

	// Enforce privasi: Perangkat desa / Kades hanya melihat nama tersamar "Warga terverifikasi"
	if requesterRole == domain.RoleKades || requesterRole == domain.RolePenyedia {
		r.PelaporNama = "Warga terverifikasi"
	}

	r.Attachments = s.loadAttachments(ctx, r.ID)
	r.Actions = s.loadActions(ctx, r.ID)

	return r, nil
}

func (s *Store) loadAttachments(ctx context.Context, reportID int64) []domain.ReportAttachment {
	query := `
		SELECT f.id, f.kunci_penyimpanan, f.mime, f.ukuran, f.diunggah_pada
		FROM report_attachments ra
		JOIN files f ON f.id = ra.file_id
		WHERE ra.report_id = $1
		ORDER BY f.id ASC
	`
	rows, err := s.db.Query(ctx, query, reportID)
	if err != nil {
		return []domain.ReportAttachment{}
	}
	defer rows.Close()

	var list []domain.ReportAttachment
	for rows.Next() {
		var a domain.ReportAttachment
		if err := rows.Scan(&a.FileID, &a.KunciPenyimpanan, &a.Mime, &a.Ukuran, &a.DiunggahPada); err == nil {
			list = append(list, a)
		}
	}
	if list == nil {
		list = []domain.ReportAttachment{}
	}
	return list
}

func (s *Store) loadActions(ctx context.Context, reportID int64) []domain.ReportAction {
	query := `
		SELECT ra.id, ra.report_id, ra.aktor_user_id, COALESCE(u.nama, ''), ra.tindakan::text, COALESCE(ra.catatan, ''), COALESCE(ra.diteruskan_ke_role::text, ''), ra.waktu
		FROM report_actions ra
		LEFT JOIN users u ON u.id = ra.aktor_user_id
		WHERE ra.report_id = $1
		ORDER BY ra.waktu ASC
	`
	rows, err := s.db.Query(ctx, query, reportID)
	if err != nil {
		return []domain.ReportAction{}
	}
	defer rows.Close()

	var list []domain.ReportAction
	for rows.Next() {
		var act domain.ReportAction
		if err := rows.Scan(&act.ID, &act.ReportID, &act.AktorUserID, &act.AktorNama, &act.Tindakan, &act.Catatan, &act.DiteruskanKeRole, &act.Waktu); err == nil {
			list = append(list, act)
		}
	}
	if list == nil {
		list = []domain.ReportAction{}
	}
	return list
}

func generateTrackingCode() string {
	b := make([]byte, 2)
	_, _ = rand.Read(b)
	randSuffix := strings.ToUpper(hex.EncodeToString(b))
	return fmt.Sprintf("LAP-%s-%s", time.Now().Format("20060102"), randSuffix)
}
