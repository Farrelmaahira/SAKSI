package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type querier interface {
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

func contractNomor(villageID, id int64) string { return fmt.Sprintf("SPK-%d-%04d", villageID, id) }

// scopeCond mengembalikan kondisi SQL atas alias kontrak "c" untuk cakupan pemanggil (lihat plan 7.0).
// Nilai pemanggil ditambahkan ke args sebagai placeholder, tidak pernah disambung ke SQL.
func scopeCond(sc usecase.Scope, args *[]any) string {
	add := func(v any) string { *args = append(*args, v); return fmt.Sprintf("$%d", len(*args)) }
	assigned := func(u string) string {
		return `c.id IN (SELECT oa.contract_id FROM oversight_assignments oa WHERE oa.pengawas_user_id = ` + u + `)`
	}
	// Pihak di luar desa hanya melihat kontrak yang sudah dikirim (sama dengan scopeContracts di FE).
	sent := func(cond string) string {
		return "(" + cond + ` AND c.status NOT IN ('draf', 'diaudit', 'dibatalkan'))`
	}
	inRegion := func(u, role string) string {
		return `c.village_id IN (SELECT v2.id FROM villages v2 JOIN user_roles ur2 ON ur2.region_id = v2.region_id
			WHERE ur2.user_id = ` + u + ` AND ur2.role = '` + role + `')`
	}
	switch sc.Role {
	case domain.RoleKades, domain.RolePerangkatDesa:
		if sc.VillageID == nil {
			return "FALSE"
		}
		return "c.village_id = " + add(*sc.VillageID)
	case domain.RoleBPD:
		u := add(sc.UserID)
		if sc.VillageID == nil {
			return sent(assigned(u))
		}
		return sent("(c.village_id = " + add(*sc.VillageID) + " OR " + assigned(u) + ")")
	case domain.RoleInspektorat:
		u := add(sc.UserID)
		return sent("(" + inRegion(u, "inspektorat") + " OR " + assigned(u) + ")")
	case domain.RoleAdminDaerah:
		return sent(inRegion(add(sc.UserID), "admin_daerah"))
	case domain.RolePenyedia:
		u := add(sc.UserID)
		return sent(`c.id IN (SELECT cp2.contract_id FROM contract_parties cp2 LEFT JOIN counterparties k2 ON k2.id = cp2.counterparty_id
			WHERE cp2.peran_pihak = 'kedua' AND (cp2.user_id = ` + u + ` OR k2.user_id = ` + u + `))`)
	}
	return "FALSE"
}

// contractInScope: ErrNotFound bila kontrak tidak ada, ErrForbidden bila di luar cakupan pemanggil.
func contractInScope(ctx context.Context, q querier, contractID int64, sc usecase.Scope) error {
	args := []any{contractID}
	cond := scopeCond(sc, &args)
	var ok bool
	err := q.QueryRow(ctx, `SELECT COALESCE((`+cond+`), FALSE) FROM contracts c WHERE c.id = $1`, args...).Scan(&ok)
	if err != nil {
		return notFound(err)
	}
	if !ok {
		return domain.ErrForbidden
	}
	return nil
}

type lockedContract struct {
	Status    domain.ContractStatus
	VillageID int64
	Nilai     float64
	CreatorID int64
	Judul     string
}

// lockContract memeriksa scope lalu mengunci baris kontrak (FOR UPDATE) di dalam transaksi.
func lockContract(ctx context.Context, tx pgx.Tx, contractID int64, sc usecase.Scope) (lockedContract, error) {
	var lc lockedContract
	if err := contractInScope(ctx, tx, contractID, sc); err != nil {
		return lc, err
	}
	var st string
	err := tx.QueryRow(ctx, `SELECT status::text, COALESCE(village_id, 0), nilai, dibuat_oleh, judul FROM contracts WHERE id = $1 FOR UPDATE`,
		contractID).Scan(&st, &lc.VillageID, &lc.Nilai, &lc.CreatorID, &lc.Judul)
	lc.Status = domain.ContractStatus(st)
	return lc, notFound(err)
}

// insertAuditLogObj mencatat ke audit_logs untuk jenis objek apa pun (contract, user, region_rule).
func insertAuditLogObj(ctx context.Context, tx pgx.Tx, actorID int64, aksi, jenisObjek string, idObjek int64, sebelum, sesudah any, ip string) error {
	toJSON := func(v any) []byte {
		if v == nil {
			return nil
		}
		b, _ := json.Marshal(v)
		return b
	}
	var ipArg *string
	if ip != "" {
		if len(ip) > 45 {
			ip = ip[:45]
		}
		ipArg = &ip
	}
	var actor *int64
	if actorID > 0 {
		actor = &actorID
	}
	_, err := tx.Exec(ctx, `
		INSERT INTO audit_logs (aktor_user_id, aksi, jenis_objek, id_objek, sebelum, sesudah, ip, waktu)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
		actor, aksi, jenisObjek, idObjek, toJSON(sebelum), toJSON(sesudah), ipArg)
	return err
}

// notify menyimpan notifikasi di transaksi pemanggil; userID <= 0 diabaikan (pihak belum punya akun).
func notify(ctx context.Context, tx pgx.Tx, userID int64, jenis, pesan, tautan string) error {
	if userID <= 0 {
		return nil
	}
	_, err := tx.Exec(ctx, `INSERT INTO notifications (user_id, jenis, pesan, tautan, dibuat_pada) VALUES ($1, $2, $3, $4, NOW())`,
		userID, jenis, pesan, tautan)
	return err
}

// notifyVendor memberi tahu pihak kedua (bila punya akun dan bukan pelaku aksi) tentang perubahan pada kontrak.
func notifyVendor(ctx context.Context, tx pgx.Tx, contractID, actorID int64, jenis, apa string) error {
	vendor, err := vendorUserID(ctx, tx, contractID)
	if err != nil || vendor == 0 || vendor == actorID {
		return err
	}
	var judul string
	if err := tx.QueryRow(ctx, `SELECT judul FROM contracts WHERE id = $1`, contractID).Scan(&judul); err != nil {
		return err
	}
	return notify(ctx, tx, vendor, jenis, fmt.Sprintf("Kontrak \"%s\" %s.", judul, apa), contractLink(contractID))
}

// vendorUserID mengembalikan akun pihak kedua kontrak (0 bila belum terikat akun).
func vendorUserID(ctx context.Context, q querier, contractID int64) (int64, error) {
	var uid *int64
	err := q.QueryRow(ctx, `
		SELECT COALESCE(cp.user_id, k.user_id) FROM contract_parties cp
		LEFT JOIN counterparties k ON k.id = cp.counterparty_id
		WHERE cp.contract_id = $1 AND cp.peran_pihak = 'kedua' LIMIT 1`, contractID).Scan(&uid)
	if errors.Is(err, pgx.ErrNoRows) || uid == nil {
		return 0, nil
	}
	return *uid, err
}

func contractLink(id int64) string { return fmt.Sprintf("/dashboard/kontrak/%d", id) }

// ---- Kirim ke pihak kedua ----

// SendContract: draf/diaudit -> ditinjau. Riwayat status, audit log, dan notifikasi pihak kedua dalam satu transaksi.
func (s *Store) SendContract(ctx context.Context, p usecase.SendContractParams) (int64, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			return 0, domain.ErrNotFound
		}
		return 0, err
	}
	if err := usecase.CanSend(lc.Status); err != nil {
		return 0, err
	}
	var hasParty, critical bool
	if err := tx.QueryRow(ctx, `SELECT
		EXISTS (SELECT 1 FROM contract_parties WHERE contract_id = $1 AND peran_pihak = 'kedua'),
		EXISTS (SELECT 1 FROM ai_audit_findings f WHERE f.tingkat = 'kritis' AND NOT f.sudah_diperbaiki AND f.audit_id = (
			SELECT a.id FROM ai_audits a JOIN contract_versions cv ON cv.id = a.version_id
			WHERE cv.contract_id = $1 ORDER BY a.id DESC LIMIT 1))`, p.ContractID).Scan(&hasParty, &critical); err != nil {
		return 0, err
	}
	if !hasParty {
		return 0, fmt.Errorf("%w: kontrak belum punya pihak kedua", domain.ErrInvalidState)
	}
	if critical {
		return 0, domain.ErrCriticalFindings
	}
	if err := setStatusTx(ctx, tx, p.ContractID, lc.Status, domain.StatusInReview, p.Scope.UserID); err != nil {
		return 0, err
	}
	if err := insertAuditLog(ctx, tx, p.Scope.UserID, "contract.send", p.ContractID,
		map[string]any{"status": lc.Status}, map[string]any{"status": domain.StatusInReview}, p.ActorIP); err != nil {
		return 0, err
	}
	vendor, err := vendorUserID(ctx, tx, p.ContractID)
	if err != nil {
		return 0, err
	}
	if err := notify(ctx, tx, vendor, "kontrak_dikirim",
		fmt.Sprintf("Desa mengirim kontrak \"%s\" untuk Anda tinjau.", lc.Judul), contractLink(p.ContractID)); err != nil {
		return 0, err
	}
	return lc.VillageID, tx.Commit(ctx)
}

// ---- Termin, SPK, progres ----

const termCols = `id, contract_id, urutan, persen, nominal, jatuh_tempo, status::text, realisasi_nominal, tanggal_realisasi`

func scanTerm(row pgx.Row) (domain.PaymentTerm, error) {
	var t domain.PaymentTerm
	var st string
	err := row.Scan(&t.ID, &t.ContractID, &t.Urutan, &t.Persen, &t.Nominal, &t.JatuhTempo, &st, &t.RealisasiNominal, &t.TanggalRealisasi)
	t.Status = domain.PaymentTermStatus(st)
	return t, err
}

func paidAmount(t domain.PaymentTerm) float64 {
	if t.Status != domain.TermDibayar {
		return 0
	}
	if t.RealisasiNominal != nil {
		return *t.RealisasiNominal
	}
	return t.Nominal
}

func (s *Store) ListTerminSummaries(ctx context.Context, sc usecase.Scope) ([]domain.TerminSummary, error) {
	args := []any{}
	cond := scopeCond(sc, &args)
	rows, err := s.db.Query(ctx, `
		SELECT c.id, COALESCE(c.village_id, 0), COALESCE(v.nama, ''), c.judul, c.nilai, c.status::text,
			COALESCE((SELECT wp.persen_selesai FROM work_progress wp WHERE wp.contract_id = c.id ORDER BY wp.waktu DESC, wp.id DESC LIMIT 1), 0)
		FROM contracts c LEFT JOIN villages v ON v.id = c.village_id
		WHERE c.status IN ('ditandatangani', 'dipublikasikan', 'berjalan', 'selesai') AND `+cond+`
		ORDER BY c.id DESC LIMIT 500`, args...)
	if err != nil {
		return nil, err
	}
	out := []domain.TerminSummary{}
	idx := map[int64]int{}
	ids := []int64{}
	for rows.Next() {
		var t domain.TerminSummary
		var st string
		if err := rows.Scan(&t.ContractID, &t.VillageID, &t.VillageName, &t.Judul, &t.Nilai, &st, &t.ProgresTerakhir); err != nil {
			rows.Close()
			return nil, err
		}
		t.Status = domain.ContractStatus(st)
		t.Nomor = contractNomor(t.VillageID, t.ContractID)
		t.Terms = []domain.PaymentTerm{}
		idx[t.ContractID] = len(out)
		ids = append(ids, t.ContractID)
		out = append(out, t)
	}
	rows.Close()
	if err := rows.Err(); err != nil || len(ids) == 0 {
		return out, err
	}
	trows, err := s.db.Query(ctx, `SELECT `+termCols+` FROM payment_terms WHERE contract_id = ANY($1) ORDER BY contract_id, urutan`, ids)
	if err != nil {
		return nil, err
	}
	defer trows.Close()
	for trows.Next() {
		t, err := scanTerm(trows)
		if err != nil {
			return nil, err
		}
		i := idx[t.ContractID]
		out[i].Terms = append(out[i].Terms, t)
		out[i].TotalDibayar += paidAmount(t)
	}
	return out, trows.Err()
}

func (s *Store) GetContractTermin(ctx context.Context, contractID int64, sc usecase.Scope) (domain.ContractTermin, error) {
	res := domain.ContractTermin{ContractID: contractID, Terms: []domain.PaymentTerm{}, Progress: []domain.WorkProgress{}}
	if err := contractInScope(ctx, s.db, contractID, sc); err != nil {
		return res, err
	}
	var st string
	if err := s.db.QueryRow(ctx, `SELECT status::text, nilai, COALESCE(village_id, 0) FROM contracts WHERE id = $1`, contractID).
		Scan(&st, &res.Nilai, &res.VillageID); err != nil {
		return res, notFound(err)
	}
	res.Status = domain.ContractStatus(st)

	var spk domain.SPK
	err := s.db.QueryRow(ctx, `SELECT id, contract_id, nomor, tanggal, mulai, selesai FROM spk WHERE contract_id = $1 ORDER BY id DESC LIMIT 1`, contractID).
		Scan(&spk.ID, &spk.ContractID, &spk.Nomor, &spk.Tanggal, &spk.Mulai, &spk.Selesai)
	if err == nil {
		res.SPK = &spk
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return res, err
	}

	rows, err := s.db.Query(ctx, `SELECT `+termCols+` FROM payment_terms WHERE contract_id = $1 ORDER BY urutan`, contractID)
	if err != nil {
		return res, err
	}
	for rows.Next() {
		t, err := scanTerm(rows)
		if err != nil {
			rows.Close()
			return res, err
		}
		res.Terms = append(res.Terms, t)
		res.TotalDibayar += paidAmount(t)
	}
	rows.Close()

	rows, err = s.db.Query(ctx, `
		SELECT wp.id, wp.contract_id, wp.term_id, wp.persen_selesai, COALESCE(wp.catatan, ''), wp.dilaporkan_oleh, COALESCE(u.nama, ''), wp.waktu
		FROM work_progress wp LEFT JOIN users u ON u.id = wp.dilaporkan_oleh
		WHERE wp.contract_id = $1 ORDER BY wp.waktu, wp.id`, contractID)
	if err != nil {
		return res, err
	}
	pidx := map[int64]int{}
	for rows.Next() {
		var p domain.WorkProgress
		if err := rows.Scan(&p.ID, &p.ContractID, &p.TermID, &p.PersenSelesai, &p.Catatan, &p.DilaporkanOleh, &p.PelaporNama, &p.Waktu); err != nil {
			rows.Close()
			return res, err
		}
		p.Bukti = []domain.ProgressEvidence{}
		pidx[p.ID] = len(res.Progress)
		res.Progress = append(res.Progress, p)
		res.ProgresTerakhir = p.PersenSelesai
	}
	rows.Close()

	rows, err = s.db.Query(ctx, `
		SELECT pe.progress_id, f.id, f.kunci_penyimpanan, f.mime, f.ukuran
		FROM progress_evidences pe JOIN files f ON f.id = pe.file_id JOIN work_progress wp ON wp.id = pe.progress_id
		WHERE wp.contract_id = $1 ORDER BY f.id`, contractID)
	if err != nil {
		return res, err
	}
	defer rows.Close()
	for rows.Next() {
		var pid int64
		var e domain.ProgressEvidence
		if err := rows.Scan(&pid, &e.FileID, &e.KunciPenyimpanan, &e.Mime, &e.Ukuran); err != nil {
			return res, err
		}
		if i, ok := pidx[pid]; ok {
			res.Progress[i].Bukti = append(res.Progress[i].Bukti, e)
		}
	}
	return res, rows.Err()
}

func (s *Store) SetPaymentTerms(ctx context.Context, p usecase.SetTermsParams) (domain.ContractTermin, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	var total, paid int
	if err := tx.QueryRow(ctx, `SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'dibayar') FROM payment_terms WHERE contract_id = $1`,
		p.ContractID).Scan(&total, &paid); err != nil {
		return domain.ContractTermin{}, err
	}
	if err := usecase.CanSetTerms(lc.Status, total > 0, paid > 0); err != nil {
		return domain.ContractTermin{}, err
	}
	terms, err := usecase.BuildTermSchedule(lc.Nilai, p.Terms)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	// Jadwal lama belum ada yang dibayar; progres yang merujuknya dilepas dulu agar FK tidak menolak penghapusan.
	if _, err := tx.Exec(ctx, `UPDATE work_progress SET term_id = NULL WHERE contract_id = $1 AND term_id IS NOT NULL`, p.ContractID); err != nil {
		return domain.ContractTermin{}, err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM payment_terms WHERE contract_id = $1`, p.ContractID); err != nil {
		return domain.ContractTermin{}, err
	}
	for _, t := range terms {
		if _, err := tx.Exec(ctx, `
			INSERT INTO payment_terms (contract_id, urutan, persen, nominal, jatuh_tempo, status)
			VALUES ($1, $2, $3, $4, $5, 'rencana')`, p.ContractID, t.Urutan, t.Persen, t.Nominal, t.JatuhTempo); err != nil {
			return domain.ContractTermin{}, err
		}
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.termin_set", "contract", p.ContractID,
		map[string]any{"jumlahTermin": total}, map[string]any{"jumlahTermin": len(terms)}, p.ActorIP); err != nil {
		return domain.ContractTermin{}, err
	}
	if err := notifyVendor(ctx, tx, p.ContractID, p.Scope.UserID, "termin_diatur", "memiliki jadwal termin pembayaran baru"); err != nil {
		return domain.ContractTermin{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.ContractTermin{}, err
	}
	return s.GetContractTermin(ctx, p.ContractID, p.Scope)
}

func (s *Store) SetSPK(ctx context.Context, p usecase.SetSPKParams) (domain.ContractTermin, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	if err := usecase.CanSetSPK(lc.Status); err != nil {
		return domain.ContractTermin{}, err
	}
	tag, err := tx.Exec(ctx, `UPDATE spk SET nomor = $2, tanggal = $3, mulai = $4, selesai = $5 WHERE contract_id = $1`,
		p.ContractID, p.SPK.Nomor, p.SPK.Tanggal, p.SPK.Mulai, p.SPK.Selesai)
	if err != nil {
		return domain.ContractTermin{}, err
	}
	if tag.RowsAffected() == 0 {
		if _, err := tx.Exec(ctx, `INSERT INTO spk (contract_id, nomor, tanggal, mulai, selesai) VALUES ($1, $2, $3, $4, $5)`,
			p.ContractID, p.SPK.Nomor, p.SPK.Tanggal, p.SPK.Mulai, p.SPK.Selesai); err != nil {
			return domain.ContractTermin{}, err
		}
	}
	if next := usecase.StatusAfterSPK(lc.Status); next != lc.Status {
		if err := setStatusTx(ctx, tx, p.ContractID, lc.Status, next, p.Scope.UserID); err != nil {
			return domain.ContractTermin{}, err
		}
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.spk_set", "contract", p.ContractID, nil,
		map[string]any{"nomor": p.SPK.Nomor}, p.ActorIP); err != nil {
		return domain.ContractTermin{}, err
	}
	if err := notifyVendor(ctx, tx, p.ContractID, p.Scope.UserID, "spk_diterbitkan", fmt.Sprintf("memiliki SPK baru (%s)", p.SPK.Nomor)); err != nil {
		return domain.ContractTermin{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.ContractTermin{}, err
	}
	return s.GetContractTermin(ctx, p.ContractID, p.Scope)
}

func setStatusTx(ctx context.Context, tx pgx.Tx, contractID int64, from, to domain.ContractStatus, actorID int64) error {
	if _, err := tx.Exec(ctx, `UPDATE contracts SET status = $1 WHERE id = $2`, string(to), contractID); err != nil {
		return err
	}
	dari := string(from)
	return insertStatusHistory(ctx, tx, contractID, &dari, string(to), actorID)
}

func (s *Store) ReportProgress(ctx context.Context, p usecase.ReportProgressParams) (domain.WorkProgress, int64, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.WorkProgress{}, 0, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		return domain.WorkProgress{}, 0, err
	}
	var termStatus *domain.PaymentTermStatus
	if p.TermID != nil {
		var st string
		if err := tx.QueryRow(ctx, `SELECT status::text FROM payment_terms WHERE id = $1 AND contract_id = $2 FOR UPDATE`,
			*p.TermID, p.ContractID).Scan(&st); err != nil {
			return domain.WorkProgress{}, 0, notFound(err)
		}
		ts := domain.PaymentTermStatus(st)
		termStatus = &ts
	}
	if err := usecase.CanReportProgress(lc.Status, termStatus); err != nil {
		return domain.WorkProgress{}, 0, err
	}

	if len(p.FileIDs) > 0 {
		var n int
		if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM files WHERE id = ANY($1) AND diunggah_oleh = $2`, p.FileIDs, p.Scope.UserID).Scan(&n); err != nil {
			return domain.WorkProgress{}, 0, err
		}
		if n != len(p.FileIDs) {
			return domain.WorkProgress{}, 0, fmt.Errorf("%w: fileIds harus file yang Anda unggah sendiri", domain.ErrInvalidInput)
		}
	}

	wp := domain.WorkProgress{ContractID: p.ContractID, TermID: p.TermID, PersenSelesai: p.PersenSelesai, Catatan: p.Catatan,
		DilaporkanOleh: p.Scope.UserID, Bukti: []domain.ProgressEvidence{}}
	if err := tx.QueryRow(ctx, `
		INSERT INTO work_progress (contract_id, term_id, persen_selesai, catatan, dilaporkan_oleh, waktu)
		VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, waktu`,
		p.ContractID, p.TermID, p.PersenSelesai, p.Catatan, p.Scope.UserID).Scan(&wp.ID, &wp.Waktu); err != nil {
		return domain.WorkProgress{}, 0, err
	}
	_ = tx.QueryRow(ctx, `SELECT nama FROM users WHERE id = $1`, p.Scope.UserID).Scan(&wp.PelaporNama)

	fileIDs := append([]int64{}, p.FileIDs...)
	for _, u := range p.BuktiURL {
		var id int64
		// shortcut: bukti berupa URL disimpan sebagai baris files (mime text/uri-list, ukuran 0); belum ada unggah blob khusus progres.
		if err := tx.QueryRow(ctx, `INSERT INTO files (kunci_penyimpanan, mime, ukuran, diunggah_oleh, diunggah_pada)
			VALUES ($1, 'text/uri-list', 0, $2, NOW()) RETURNING id`, u, p.Scope.UserID).Scan(&id); err != nil {
			return domain.WorkProgress{}, 0, err
		}
		fileIDs = append(fileIDs, id)
	}
	for _, fid := range fileIDs {
		if _, err := tx.Exec(ctx, `INSERT INTO progress_evidences (progress_id, file_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, wp.ID, fid); err != nil {
			return domain.WorkProgress{}, 0, err
		}
	}
	if len(fileIDs) > 0 {
		rows, err := tx.Query(ctx, `SELECT id, kunci_penyimpanan, mime, ukuran FROM files WHERE id = ANY($1) ORDER BY id`, fileIDs)
		if err != nil {
			return domain.WorkProgress{}, 0, err
		}
		for rows.Next() {
			var e domain.ProgressEvidence
			if err := rows.Scan(&e.FileID, &e.KunciPenyimpanan, &e.Mime, &e.Ukuran); err != nil {
				rows.Close()
				return domain.WorkProgress{}, 0, err
			}
			wp.Bukti = append(wp.Bukti, e)
		}
		rows.Close()
	}

	if termStatus != nil {
		if next := usecase.TermStatusAfterProgress(*termStatus); next != *termStatus {
			if _, err := tx.Exec(ctx, `UPDATE payment_terms SET status = $1 WHERE id = $2 AND status <> 'dibayar'`, string(next), *p.TermID); err != nil {
				return domain.WorkProgress{}, 0, err
			}
		}
	}
	if next := usecase.StatusAfterProgress(lc.Status, p.PersenSelesai); next != lc.Status {
		if err := setStatusTx(ctx, tx, p.ContractID, lc.Status, next, p.Scope.UserID); err != nil {
			return domain.WorkProgress{}, 0, err
		}
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.progress", "contract", p.ContractID, nil,
		map[string]any{"progressId": wp.ID, "persenSelesai": p.PersenSelesai, "termId": p.TermID}, p.ActorIP); err != nil {
		return domain.WorkProgress{}, 0, err
	}
	if lc.CreatorID != p.Scope.UserID {
		if err := notify(ctx, tx, lc.CreatorID, "progres_dilaporkan",
			fmt.Sprintf("Progres %.0f%% dilaporkan untuk kontrak \"%s\".", p.PersenSelesai, lc.Judul), contractLink(p.ContractID)+"?tab=termin"); err != nil {
			return domain.WorkProgress{}, 0, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.WorkProgress{}, 0, err
	}
	return wp, lc.VillageID, nil
}

func (s *Store) PayTerm(ctx context.Context, p usecase.PayTermParams) (domain.PaymentTerm, int64, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	t, err := scanTerm(tx.QueryRow(ctx, `SELECT `+termCols+` FROM payment_terms WHERE id = $1 AND contract_id = $2 FOR UPDATE`, p.TermID, p.ContractID))
	if err != nil {
		return domain.PaymentTerm{}, 0, notFound(err)
	}
	if err := usecase.CanPayTerm(lc.Status, t.Status); err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	nominal := t.Nominal
	if p.RealisasiNominal != nil {
		nominal = *p.RealisasiNominal
	}
	t, err = scanTerm(tx.QueryRow(ctx, `
		UPDATE payment_terms SET status = 'dibayar', realisasi_nominal = $2, tanggal_realisasi = COALESCE($3::date, CURRENT_DATE)
		WHERE id = $1 AND status <> 'dibayar' RETURNING `+termCols, p.TermID, nominal, p.TanggalRealisasi))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.PaymentTerm{}, 0, domain.ErrAlreadyPaid
		}
		return domain.PaymentTerm{}, 0, err
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.termin_paid", "contract", p.ContractID, nil,
		map[string]any{"termId": t.ID, "urutan": t.Urutan, "realisasiNominal": nominal}, p.ActorIP); err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	vendor, err := vendorUserID(ctx, tx, p.ContractID)
	if err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	if err := notify(ctx, tx, vendor, "termin_dibayar",
		fmt.Sprintf("Termin %d kontrak \"%s\" sudah dibayar desa.", t.Urutan, lc.Judul), contractLink(p.ContractID)+"?tab=termin"); err != nil {
		return domain.PaymentTerm{}, 0, err
	}
	return t, lc.VillageID, tx.Commit(ctx)
}

// ---- Segel ----

// VerifySeal: hash = SHA-256 penuh atau awalan (>= usecase.MinSealPrefix). Awalan yang cocok ke lebih dari
// satu hash dianggap tidak cocok. Hasil tidak cocok juga dicatat (seal_id NULL, hash_dicari terisi).
func (s *Store) VerifySeal(ctx context.Context, hash string, verifierID *int64) (domain.SealVerifyResult, error) {
	searched := hash
	if len(hash) < 64 {
		rows, err := s.db.Query(ctx, `SELECT DISTINCT sha256 FROM document_seals WHERE sha256 LIKE $1 LIMIT 2`, hash+"%")
		if err != nil {
			return domain.SealVerifyResult{}, err
		}
		var full []string
		for rows.Next() {
			var h string
			if err := rows.Scan(&h); err != nil {
				rows.Close()
				return domain.SealVerifyResult{}, err
			}
			full = append(full, h)
		}
		rows.Close()
		if err := rows.Err(); err != nil {
			return domain.SealVerifyResult{}, err
		}
		if len(full) != 1 {
			s.recordSealVerification(ctx, nil, verifierID, "tidak_cocok", searched)
			return domain.SealVerifyResult{Cocok: false}, nil
		}
		hash = full[0]
	}
	var seg domain.SealInfo
	var k domain.SealContractInfo
	var villageID int64
	err := s.db.QueryRow(ctx, `
		SELECT ds.id, ds.version_id, cv.nomor_versi, ds.sha256, ds.waktu_segel, ds.segel_sebelumnya_id,
			COALESCE(ds.chain, ''), COALESCE(ds.tx_hash, ''), c.id, COALESCE(c.village_id, 0), c.judul, COALESCE(v.nama, '')
		FROM document_seals ds
		JOIN contract_versions cv ON cv.id = ds.version_id
		JOIN contracts c ON c.id = cv.contract_id
		LEFT JOIN villages v ON v.id = c.village_id
		WHERE ds.sha256 = $1 ORDER BY ds.id DESC LIMIT 1`, hash).
		Scan(&seg.ID, &seg.VersionID, &seg.NomorVersi, &seg.SHA256, &seg.WaktuSegel, &seg.SegelSebelumnyaID,
			&seg.Chain, &seg.TxHash, &k.ID, &villageID, &k.Judul, &k.VillageName)
	if errors.Is(err, pgx.ErrNoRows) {
		s.recordSealVerification(ctx, nil, verifierID, "tidak_cocok", searched)
		return domain.SealVerifyResult{Cocok: false}, nil
	}
	if err != nil {
		return domain.SealVerifyResult{}, err
	}
	k.Nomor = contractNomor(villageID, k.ID)
	s.recordSealVerification(ctx, &seg.ID, verifierID, "cocok", searched)
	return domain.SealVerifyResult{Cocok: true, Segel: &seg, Kontrak: &k}, nil
}

// recordSealVerification: pencatatan tidak boleh menggagalkan jawaban verifikasi.
// Butuh scripts/migrate_seal_verifications.sql (seal_id nullable + hash_dicari); bila belum, hanya warning.
func (s *Store) recordSealVerification(ctx context.Context, sealID, verifierID *int64, hasil, searched string) {
	if _, err := s.db.Exec(ctx, `INSERT INTO seal_verifications (seal_id, diverifikasi_oleh, hasil, hash_dicari, waktu) VALUES ($1, $2, $3, $4, NOW())`,
		sealID, verifierID, hasil, searched); err != nil {
		slog.Warn("gagal mencatat seal_verifications", "hasil", hasil, "err", err)
	}
}

func (s *Store) ListSeals(ctx context.Context, sc usecase.Scope) ([]domain.SealSummary, error) {
	args := []any{}
	cond := scopeCond(sc, &args)
	rows, err := s.db.Query(ctx, `
		SELECT ds.id, c.id, COALESCE(c.village_id, 0), COALESCE(v.nama, ''), c.judul, ds.version_id, cv.nomor_versi, ds.sha256,
			ds.waktu_segel, ds.segel_sebelumnya_id, COALESCE(ds.chain, ''), COALESCE(ds.tx_hash, ''),
			(SELECT COUNT(*) FROM seal_verifications sv WHERE sv.seal_id = ds.id)
		FROM document_seals ds
		JOIN contract_versions cv ON cv.id = ds.version_id
		JOIN contracts c ON c.id = cv.contract_id
		LEFT JOIN villages v ON v.id = c.village_id
		WHERE `+cond+` ORDER BY ds.id DESC LIMIT 500`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.SealSummary{}
	for rows.Next() {
		var x domain.SealSummary
		if err := rows.Scan(&x.SealID, &x.ContractID, &x.VillageID, &x.VillageName, &x.Judul, &x.VersionID, &x.NomorVersi, &x.SHA256,
			&x.WaktuSegel, &x.SegelSebelumnyaID, &x.Chain, &x.TxHash, &x.JumlahVerifikasi); err != nil {
			return nil, err
		}
		x.Nomor = contractNomor(x.VillageID, x.ContractID)
		out = append(out, x)
	}
	return out, rows.Err()
}

// ---- Tindak lanjut laporan warga ----

type reportRow struct {
	Status     domain.ReportStatus
	ContractID int64
	PelaporID  int64
	Kode       string
}

func (s *Store) reportForCaller(ctx context.Context, q querier, reportID int64, sc usecase.Scope, lock bool) (reportRow, error) {
	var r reportRow
	var st string
	sql := `SELECT status::text, contract_id, pelapor_user_id, kode_pelacakan FROM citizen_reports WHERE id = $1`
	if lock {
		sql += ` FOR UPDATE`
	}
	if err := q.QueryRow(ctx, sql, reportID).Scan(&st, &r.ContractID, &r.PelaporID, &r.Kode); err != nil {
		return r, notFound(err)
	}
	r.Status = domain.ReportStatus(st)
	if sc.Role == domain.RoleWarga {
		if r.PelaporID != sc.UserID {
			return r, domain.ErrForbidden
		}
		return r, nil
	}
	return r, contractInScope(ctx, q, r.ContractID, sc)
}

func (s *Store) ListReportActions(ctx context.Context, reportID int64, sc usecase.Scope) ([]domain.ReportAction, error) {
	rep, err := s.reportForCaller(ctx, s.db, reportID, sc, false)
	if err != nil {
		return nil, err
	}
	acts := s.loadActions(ctx, reportID)
	// Identitas pelapor disamarkan untuk desa dan penyedia (sama seperti daftar laporan).
	if sc.Role != domain.RoleWarga && sc.Role != domain.RoleBPD && sc.Role != domain.RoleInspektorat {
		for i := range acts {
			if acts[i].AktorUserID == rep.PelaporID {
				acts[i].AktorNama = "Warga terverifikasi"
			}
		}
	}
	return acts, nil
}

func (s *Store) AddReportAction(ctx context.Context, p usecase.ReportActionParams) (domain.ReportAction, domain.ReportStatus, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ReportAction{}, "", err
	}
	defer tx.Rollback(ctx)
	rep, err := s.reportForCaller(ctx, tx, p.ReportID, p.Scope, true)
	if err != nil {
		return domain.ReportAction{}, "", err
	}
	next, err := usecase.NextReportStatus(rep.Status, p.Tindakan, p.Status)
	if err != nil {
		return domain.ReportAction{}, "", err
	}
	act := domain.ReportAction{ReportID: p.ReportID, AktorUserID: p.Scope.UserID, Tindakan: p.Tindakan, Catatan: p.Catatan, DiteruskanKeRole: p.DiteruskanKeRole}
	var catatan, ke *string
	if p.Catatan != "" {
		catatan = &p.Catatan
	}
	if p.DiteruskanKeRole != "" {
		ke = &p.DiteruskanKeRole
	}
	if err := tx.QueryRow(ctx, `
		INSERT INTO report_actions (report_id, aktor_user_id, tindakan, catatan, diteruskan_ke_role, waktu)
		VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, waktu`,
		p.ReportID, p.Scope.UserID, p.Tindakan, catatan, ke).Scan(&act.ID, &act.Waktu); err != nil {
		return domain.ReportAction{}, "", err
	}
	_ = tx.QueryRow(ctx, `SELECT nama FROM users WHERE id = $1`, p.Scope.UserID).Scan(&act.AktorNama)
	if next != rep.Status {
		if _, err := tx.Exec(ctx, `UPDATE citizen_reports SET status = $1 WHERE id = $2`, string(next), p.ReportID); err != nil {
			return domain.ReportAction{}, "", err
		}
	}
	if err := insertAuditLogObj(ctx, tx, p.Scope.UserID, "contract.report_action", "contract", rep.ContractID,
		map[string]any{"reportId": p.ReportID, "status": rep.Status},
		map[string]any{"reportId": p.ReportID, "status": next, "tindakan": p.Tindakan}, p.ActorIP); err != nil {
		return domain.ReportAction{}, "", err
	}
	jenis, pesan := "laporan_ditanggapi", fmt.Sprintf("Laporan %s ditanggapi petugas (status: %s).", rep.Kode, next)
	switch next {
	case domain.ReportStatusDiteruskan:
		jenis, pesan = "laporan_diteruskan", fmt.Sprintf("Laporan %s diteruskan ke %s.", rep.Kode, p.DiteruskanKeRole)
	case domain.ReportStatusSelesai, domain.ReportStatusDitolak:
		jenis, pesan = "laporan_ditutup", fmt.Sprintf("Laporan %s ditutup (status: %s).", rep.Kode, next)
	}
	if err := notify(ctx, tx, rep.PelaporID, jenis, pesan, fmt.Sprintf("/dashboard/laporan/%d", p.ReportID)); err != nil {
		return domain.ReportAction{}, "", err
	}
	return act, next, tx.Commit(ctx)
}

// publicProgress membaca ringkasan progres publik (tanpa catatan dan nama pelapor).
func (s *Store) publicProgress(ctx context.Context, contractID int64, nilai float64) (*domain.PublicProgress, error) {
	pp := &domain.PublicProgress{Termin: []domain.PublicTermProgress{}}
	err := s.db.QueryRow(ctx, `SELECT persen_selesai, waktu FROM work_progress WHERE contract_id = $1 ORDER BY waktu DESC, id DESC LIMIT 1`, contractID).
		Scan(&pp.PersenTerakhir, &pp.TerakhirDilaporkan)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	err = s.db.QueryRow(ctx, `SELECT mulai, selesai FROM spk WHERE contract_id = $1 ORDER BY id DESC LIMIT 1`, contractID).Scan(&pp.SPKMulai, &pp.SPKSelesai)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return nil, err
	}
	rows, err := s.db.Query(ctx, `SELECT `+termCols+` FROM payment_terms WHERE contract_id = $1 ORDER BY urutan`, contractID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var paid float64
	for rows.Next() {
		t, err := scanTerm(rows)
		if err != nil {
			return nil, err
		}
		paid += paidAmount(t)
		pp.Termin = append(pp.Termin, domain.PublicTermProgress{Urutan: t.Urutan, Persen: t.Persen, Status: t.Status, JatuhTempo: t.JatuhTempo})
	}
	if nilai > 0 {
		pp.PersenDibayar = math.Round(paid/nilai*10000) / 100
	}
	return pp, rows.Err()
}

// ---- Pembatalan kontrak ----

func (s *Store) CancelContract(ctx context.Context, p usecase.CancelContractParams) (int64, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	lc, err := lockContract(ctx, tx, p.ContractID, p.Scope)
	if err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			return 0, domain.ErrNotFound // desa lain = 404, bukan 403, agar id kontrak tidak bisa ditebak
		}
		return 0, err
	}
	already, err := usecase.CanCancel(lc.Status)
	if err != nil {
		return 0, err
	}
	if already {
		return lc.VillageID, nil
	}
	// Status ditinjau tetap bisa sudah ditandatangani satu pihak; tanda tangan = sudah masuk tahap penandatanganan.
	var signed int
	if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM signatures sg JOIN contract_versions cv ON cv.id = sg.version_id WHERE cv.contract_id = $1`,
		p.ContractID).Scan(&signed); err != nil {
		return 0, err
	}
	if signed > 0 {
		return 0, domain.ErrContractNotEditable
	}
	if err := setStatusTx(ctx, tx, p.ContractID, lc.Status, domain.StatusCancelled, p.Scope.UserID); err != nil {
		return 0, err
	}
	if err := insertAuditLog(ctx, tx, p.Scope.UserID, "contract.cancel", p.ContractID,
		map[string]any{"status": lc.Status}, map[string]any{"status": domain.StatusCancelled}, p.ActorIP); err != nil {
		return 0, err
	}
	vendor, err := vendorUserID(ctx, tx, p.ContractID)
	if err != nil {
		return 0, err
	}
	pesan := fmt.Sprintf("Kontrak \"%s\" dibatalkan oleh desa.", lc.Judul)
	for _, uid := range uniqueIDs(vendor, lc.CreatorID) {
		if uid == p.Scope.UserID {
			continue
		}
		if err := notify(ctx, tx, uid, "kontrak_dibatalkan", pesan, contractLink(p.ContractID)); err != nil {
			return 0, err
		}
	}
	return lc.VillageID, tx.Commit(ctx)
}
