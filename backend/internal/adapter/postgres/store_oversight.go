package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// ---- Notifikasi ----

func (s *Store) ListNotifications(ctx context.Context, userID int64, unreadOnly bool, limit int, before int64) ([]domain.Notification, int, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, jenis, pesan, COALESCE(tautan, ''), dibaca_pada, dibuat_pada FROM notifications
		WHERE user_id = $1 AND (NOT $2::boolean OR dibaca_pada IS NULL) AND ($3::bigint = 0 OR id < $3)
		ORDER BY id DESC LIMIT $4`, userID, unreadOnly, before, limit)
	if err != nil {
		return nil, 0, err
	}
	out := []domain.Notification{}
	for rows.Next() {
		var n domain.Notification
		if err := rows.Scan(&n.ID, &n.Jenis, &n.Pesan, &n.Tautan, &n.DibacaPada, &n.DibuatPada); err != nil {
			rows.Close()
			return nil, 0, err
		}
		n.Dibaca = n.DibacaPada != nil
		out = append(out, n)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	var unread int
	err = s.db.QueryRow(ctx, `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND dibaca_pada IS NULL`, userID).Scan(&unread)
	return out, unread, err
}

func (s *Store) MarkNotificationRead(ctx context.Context, userID, id int64) error {
	tag, err := s.db.Exec(ctx, `UPDATE notifications SET dibaca_pada = COALESCE(dibaca_pada, NOW()) WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (s *Store) MarkAllNotificationsRead(ctx context.Context, userID int64) (int64, error) {
	tag, err := s.db.Exec(ctx, `UPDATE notifications SET dibaca_pada = NOW() WHERE user_id = $1 AND dibaca_pada IS NULL`, userID)
	return tag.RowsAffected(), err
}

// ---- Jejak audit ----

func (s *Store) ListAuditLogs(ctx context.Context, f usecase.AuditLogFilter) ([]domain.AuditLogEntry, error) {
	args := []any{}
	cond := scopeCond(f.Scope, &args)
	add := func(v any) string { args = append(args, v); return fmt.Sprintf("$%d", len(args)) }
	where := "((c.id IS NOT NULL AND " + cond + ") OR al.aktor_user_id = " + add(f.Scope.UserID) + ")"
	if f.ContractID != nil {
		where += " AND al.jenis_objek = 'contract' AND al.id_objek = " + add(*f.ContractID)
	}
	if f.ActorID != nil {
		where += " AND al.aktor_user_id = " + add(*f.ActorID)
	}
	if f.From != "" {
		where += " AND al.waktu >= " + add(f.From) + "::date"
	}
	if f.To != "" {
		where += " AND al.waktu < (" + add(f.To) + "::date + 1)"
	}
	if f.Before > 0 {
		where += " AND al.id < " + add(f.Before)
	}
	rows, err := s.db.Query(ctx, `
		SELECT al.id, al.aktor_user_id, COALESCE(u.nama, ''),
			COALESCE((SELECT ur.role::text FROM user_roles ur WHERE ur.user_id = al.aktor_user_id ORDER BY ur.id LIMIT 1), ''),
			al.aksi, al.jenis_objek, al.id_objek, c.id, COALESCE(c.judul, ''), c.village_id, COALESCE(v.nama, ''),
			al.sebelum, al.sesudah, al.waktu
		FROM audit_logs al
		LEFT JOIN users u ON u.id = al.aktor_user_id
		LEFT JOIN contracts c ON al.jenis_objek = 'contract' AND c.id = al.id_objek
		LEFT JOIN villages v ON v.id = c.village_id
		WHERE `+where+` ORDER BY al.id DESC LIMIT `+add(f.Limit), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.AuditLogEntry{}
	for rows.Next() {
		var e domain.AuditLogEntry
		var seb, ses []byte
		if err := rows.Scan(&e.ID, &e.AktorUserID, &e.AktorNama, &e.AktorRole, &e.Aksi, &e.JenisObjek, &e.IDObjek,
			&e.ContractID, &e.ContractJudul, &e.VillageID, &e.VillageName, &seb, &ses, &e.Waktu); err != nil {
			return nil, err
		}
		e.Sebelum, e.Sesudah = seb, ses
		out = append(out, e)
	}
	return out, rows.Err()
}

// ---- LHP ----

const reportSelect = `
	SELECT ar.id, ar.contract_id, c.judul, c.village_id, COALESCE(v.nama, ''), ar.jenis::text, ar.penyusun_user_id,
		COALESCE(u.nama, ''), COALESCE(ar.ringkasan, ''), ar.status::text, ar.terbit_pada,
		(SELECT COUNT(*) FROM audit_report_findings f WHERE f.report_id = ar.id)`

const reportFrom = `
	FROM audit_reports ar
	JOIN contracts c ON c.id = ar.contract_id
	LEFT JOIN villages v ON v.id = c.village_id
	LEFT JOIN users u ON u.id = ar.penyusun_user_id`

func scanReport(row pgx.Row, extra ...any) (domain.AuditReport, error) {
	var r domain.AuditReport
	dest := append([]any{&r.ID, &r.ContractID, &r.ContractJudul, &r.VillageID, &r.VillageName, &r.Jenis, &r.PenyusunUserID,
		&r.PenyusunNama, &r.Ringkasan, &r.Status, &r.TerbitPada, &r.JumlahTemuan}, extra...)
	return r, row.Scan(dest...)
}

// desaOnlyPublished: desa/BPD hanya melihat LHP yang sudah terbit.
func desaOnlyPublished(r domain.UserRole) bool {
	return r == domain.RoleKades || r == domain.RolePerangkatDesa || r == domain.RoleBPD
}

func (s *Store) CreateAuditReport(ctx context.Context, p usecase.CreateAuditReportParams) (domain.AuditReport, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.AuditReport{}, err
	}
	defer tx.Rollback(ctx)
	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		return domain.AuditReport{}, err
	}
	var id int64
	if err := tx.QueryRow(ctx, `
		INSERT INTO audit_reports (contract_id, jenis, penyusun_user_id, ringkasan, status, terbit_pada)
		VALUES ($1, $2, $3, $4, CASE WHEN $5::boolean THEN 'terbit' ELSE 'draf' END::audit_reports_status_enum,
			CASE WHEN $5::boolean THEN NOW() END)
		RETURNING id`, p.ContractID, p.Jenis, p.Scope.UserID, p.Ringkasan, p.Terbit).Scan(&id); err != nil {
		return domain.AuditReport{}, err
	}
	for _, f := range p.Findings {
		if _, err := tx.Exec(ctx, `INSERT INTO audit_report_findings (report_id, objek, temuan, tingkat, rekomendasi) VALUES ($1, $2, $3, $4, $5)`,
			id, f.Objek, f.Temuan, f.Tingkat, f.Rekomendasi); err != nil {
			return domain.AuditReport{}, err
		}
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.lhp_create", "contract", p.ContractID, nil,
		map[string]any{"reportId": id, "jenis": p.Jenis, "terbit": p.Terbit, "jumlahTemuan": len(p.Findings)}, p.ActorIP); err != nil {
		return domain.AuditReport{}, err
	}
	if p.Terbit {
		if err := notifyLHP(ctx, tx, lc, p.ContractID); err != nil {
			return domain.AuditReport{}, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.AuditReport{}, err
	}
	return s.GetAuditReport(ctx, id, p.Scope)
}

func notifyLHP(ctx context.Context, tx pgx.Tx, lc lockedContract, contractID int64) error {
	return notify(ctx, tx, lc.CreatorID, "lhp_terbit",
		fmt.Sprintf("Inspektorat menerbitkan laporan hasil pemeriksaan untuk kontrak \"%s\".", lc.Judul), contractLink(contractID))
}

func (s *Store) ListAuditReports(ctx context.Context, sc usecase.Scope, contractID *int64, status string) ([]domain.AuditReport, error) {
	args := []any{}
	where := scopeCond(sc, &args)
	add := func(v any) string { args = append(args, v); return fmt.Sprintf("$%d", len(args)) }
	if desaOnlyPublished(sc.Role) {
		where += " AND ar.status = 'terbit'"
	}
	if contractID != nil {
		where += " AND ar.contract_id = " + add(*contractID)
	}
	if status != "" {
		where += " AND ar.status::text = " + add(status)
	}
	rows, err := s.db.Query(ctx, reportSelect+reportFrom+` WHERE `+where+` ORDER BY ar.id DESC LIMIT 200`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.AuditReport{}
	for rows.Next() {
		r, err := scanReport(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func (s *Store) GetAuditReport(ctx context.Context, id int64, sc usecase.Scope) (domain.AuditReport, error) {
	args := []any{id}
	cond := scopeCond(sc, &args)
	var visible bool
	r, err := scanReport(s.db.QueryRow(ctx, reportSelect+`, COALESCE((`+cond+`), FALSE)`+reportFrom+` WHERE ar.id = $1`, args...), &visible)
	if err != nil {
		return domain.AuditReport{}, notFound(err)
	}
	if !visible {
		return domain.AuditReport{}, domain.ErrForbidden
	}
	if desaOnlyPublished(sc.Role) && r.Status != "terbit" {
		return domain.AuditReport{}, domain.ErrNotFound
	}
	rows, err := s.db.Query(ctx, `SELECT id, objek::text, temuan, tingkat::text, COALESCE(rekomendasi, '') FROM audit_report_findings WHERE report_id = $1 ORDER BY id`, id)
	if err != nil {
		return domain.AuditReport{}, err
	}
	defer rows.Close()
	r.Findings = []domain.AuditReportFinding{}
	for rows.Next() {
		var f domain.AuditReportFinding
		if err := rows.Scan(&f.ID, &f.Objek, &f.Temuan, &f.Tingkat, &f.Rekomendasi); err != nil {
			return domain.AuditReport{}, err
		}
		r.Findings = append(r.Findings, f)
	}
	return r, rows.Err()
}

func (s *Store) PublishAuditReport(ctx context.Context, id int64, sc usecase.Scope, ip string) (domain.AuditReport, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.AuditReport{}, err
	}
	defer tx.Rollback(ctx)
	var status string
	var penyusun, contractID int64
	if err := tx.QueryRow(ctx, `SELECT status::text, penyusun_user_id, contract_id FROM audit_reports WHERE id = $1 FOR UPDATE`, id).
		Scan(&status, &penyusun, &contractID); err != nil {
		return domain.AuditReport{}, notFound(err)
	}
	if penyusun != sc.UserID {
		return domain.AuditReport{}, domain.ErrForbidden
	}
	if status == "terbit" {
		return domain.AuditReport{}, fmt.Errorf("%w: LHP sudah terbit", domain.ErrInvalidState)
	}
	lc, err := lockContract(ctx, tx, contractID, sc)
	if err != nil {
		return domain.AuditReport{}, err
	}
	if _, err := tx.Exec(ctx, `UPDATE audit_reports SET status = 'terbit', terbit_pada = NOW() WHERE id = $1 AND status <> 'terbit'`, id); err != nil {
		return domain.AuditReport{}, err
	}
	if err := insertAuditLogObj(ctx, tx, sc.UserID, "contract.lhp_publish", "contract", contractID, nil, map[string]any{"reportId": id}, ip); err != nil {
		return domain.AuditReport{}, err
	}
	if err := notifyLHP(ctx, tx, lc, contractID); err != nil {
		return domain.AuditReport{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.AuditReport{}, err
	}
	return s.GetAuditReport(ctx, id, sc)
}

// ---- Admin daerah ----

func (s *Store) RegionIDsForUser(ctx context.Context, userID int64, role domain.UserRole) ([]int64, error) {
	rows, err := s.db.Query(ctx, `SELECT DISTINCT region_id FROM user_roles WHERE user_id = $1 AND role::text = $2 AND region_id IS NOT NULL ORDER BY region_id`,
		userID, string(role))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []int64{}
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		out = append(out, id)
	}
	return out, rows.Err()
}

const ruleSelect = `SELECT rr.id, rr.region_id, r.nama, rr.ambang_pembelian_langsung, rr.ambang_penawaran, COALESCE(rr.dasar_hukum, ''), rr.berlaku_sejak
	FROM region_rules rr JOIN regions r ON r.id = rr.region_id`

func scanRule(row pgx.Row) (domain.RegionRule, error) {
	var x domain.RegionRule
	err := row.Scan(&x.ID, &x.RegionID, &x.RegionNama, &x.AmbangPembelianLangsung, &x.AmbangPenawaran, &x.DasarHukum, &x.BerlakuSejak)
	return x, err
}

func (s *Store) ListRegionRules(ctx context.Context, regionIDs []int64) ([]domain.RegionRule, error) {
	rows, err := s.db.Query(ctx, ruleSelect+` WHERE rr.region_id = ANY($1) ORDER BY rr.region_id, rr.berlaku_sejak DESC, rr.id DESC`, regionIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.RegionRule{}
	for rows.Next() {
		x, err := scanRule(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, x)
	}
	return out, rows.Err()
}

func (s *Store) CreateRegionRule(ctx context.Context, p usecase.CreateRegionRuleParams) (domain.RegionRule, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.RegionRule{}, err
	}
	defer tx.Rollback(ctx)
	var dasar *string
	if p.DasarHukum != "" {
		dasar = &p.DasarHukum
	}
	var id int64
	if err := tx.QueryRow(ctx, `
		INSERT INTO region_rules (region_id, ambang_pembelian_langsung, ambang_penawaran, dasar_hukum, berlaku_sejak)
		VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		p.RegionID, p.AmbangPembelianLangsung, p.AmbangPenawaran, dasar, p.BerlakuSejak).Scan(&id); err != nil {
		return domain.RegionRule{}, err
	}
	if err := insertAuditLogObj(ctx, tx, p.ActorID, "region_rule.create", "region_rule", id, nil, map[string]any{
		"regionId": p.RegionID, "ambangPembelianLangsung": p.AmbangPembelianLangsung, "ambangPenawaran": p.AmbangPenawaran,
		"berlakuSejak": p.BerlakuSejak.Format("2006-01-02")}, p.ActorIP); err != nil {
		return domain.RegionRule{}, err
	}
	x, err := scanRule(tx.QueryRow(ctx, ruleSelect+` WHERE rr.id = $1`, id))
	if err != nil {
		return domain.RegionRule{}, err
	}
	return x, tx.Commit(ctx)
}

func (s *Store) ListPengawas(ctx context.Context, regionIDs []int64, jenis string) ([]domain.Pengawas, error) {
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT ON (u.id) u.id, u.nama, u.email, ur.role::text, ur.village_id, COALESCE(v.nama, ''), COALESCE(ur.region_id, v.region_id)
		FROM user_roles ur JOIN users u ON u.id = ur.user_id LEFT JOIN villages v ON v.id = ur.village_id
		WHERE ur.role::text = $1 AND COALESCE(ur.region_id, v.region_id) = ANY($2)
		ORDER BY u.id`, jenis, regionIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Pengawas{}
	for rows.Next() {
		var p domain.Pengawas
		if err := rows.Scan(&p.UserID, &p.Nama, &p.Email, &p.Jenis, &p.VillageID, &p.VillageName, &p.RegionID); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

const assignSelect = `
	SELECT oa.id, oa.contract_id, c.judul, COALESCE(v.nama, ''), oa.pengawas_user_id, COALESCE(u.nama, ''), oa.jenis::text, oa.ditetapkan_pada
	FROM oversight_assignments oa
	JOIN contracts c ON c.id = oa.contract_id
	LEFT JOIN villages v ON v.id = c.village_id
	LEFT JOIN users u ON u.id = oa.pengawas_user_id`

func scanAssign(row pgx.Row) (domain.OversightAssignment, error) {
	var a domain.OversightAssignment
	err := row.Scan(&a.ID, &a.ContractID, &a.ContractJudul, &a.VillageName, &a.PengawasUserID, &a.PengawasNama, &a.Jenis, &a.DitetapkanPada)
	return a, err
}

func (s *Store) ListOversightAssignments(ctx context.Context, regionIDs []int64, contractID *int64) ([]domain.OversightAssignment, error) {
	rows, err := s.db.Query(ctx, assignSelect+` WHERE v.region_id = ANY($1) AND ($2::bigint IS NULL OR oa.contract_id = $2) ORDER BY oa.id DESC LIMIT 500`,
		regionIDs, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.OversightAssignment{}
	for rows.Next() {
		a, err := scanAssign(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (s *Store) CreateOversightAssignment(ctx context.Context, p usecase.AssignOversightParams) (domain.OversightAssignment, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.OversightAssignment{}, err
	}
	defer tx.Rollback(ctx)

	var regionID *int64
	var judul string
	if err := tx.QueryRow(ctx, `SELECT v.region_id, c.judul FROM contracts c LEFT JOIN villages v ON v.id = c.village_id WHERE c.id = $1 FOR UPDATE OF c`,
		p.ContractID).Scan(&regionID, &judul); err != nil {
		return domain.OversightAssignment{}, notFound(err)
	}
	inRegion := false
	for _, r := range p.RegionIDs {
		if regionID != nil && *regionID == r {
			inRegion = true
		}
	}
	if !inRegion {
		return domain.OversightAssignment{}, domain.ErrForbidden
	}
	var ok bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (SELECT 1 FROM user_roles ur LEFT JOIN villages v ON v.id = ur.village_id
			WHERE ur.user_id = $1 AND ur.role::text = $2 AND COALESCE(ur.region_id, v.region_id) = $3)`,
		p.PengawasUserID, p.Jenis, *regionID).Scan(&ok); err != nil {
		return domain.OversightAssignment{}, err
	}
	if !ok {
		return domain.OversightAssignment{}, fmt.Errorf("%w: pengawas harus akun %s di wilayah kontrak ini", domain.ErrInvalidInput, p.Jenis)
	}
	if err := tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM oversight_assignments WHERE contract_id = $1 AND pengawas_user_id = $2 AND jenis::text = $3)`,
		p.ContractID, p.PengawasUserID, p.Jenis).Scan(&ok); err != nil {
		return domain.OversightAssignment{}, err
	}
	if ok {
		return domain.OversightAssignment{}, domain.ErrConflict
	}
	var id int64
	if err := tx.QueryRow(ctx, `INSERT INTO oversight_assignments (contract_id, pengawas_user_id, jenis, ditetapkan_pada) VALUES ($1, $2, $3, NOW()) RETURNING id`,
		p.ContractID, p.PengawasUserID, p.Jenis).Scan(&id); err != nil {
		return domain.OversightAssignment{}, err
	}
	if err := insertAuditLogObj(ctx, tx, p.ActorID, "contract.oversight_assign", "contract", p.ContractID, nil,
		map[string]any{"assignmentId": id, "pengawasUserId": p.PengawasUserID, "jenis": p.Jenis}, p.ActorIP); err != nil {
		return domain.OversightAssignment{}, err
	}
	if err := notify(ctx, tx, p.PengawasUserID, "pengawas_ditugaskan",
		fmt.Sprintf("Anda ditugaskan mengawasi kontrak \"%s\".", judul), contractLink(p.ContractID)); err != nil {
		return domain.OversightAssignment{}, err
	}
	a, err := scanAssign(tx.QueryRow(ctx, assignSelect+` WHERE oa.id = $1`, id))
	if err != nil {
		return domain.OversightAssignment{}, err
	}
	return a, tx.Commit(ctx)
}
