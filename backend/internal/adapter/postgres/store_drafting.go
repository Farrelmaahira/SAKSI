package postgres

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// insertAuditLog mencatat perubahan kontrak ke audit_logs di dalam transaksi pemanggil.
func insertAuditLog(ctx context.Context, tx pgx.Tx, actorID int64, aksi string, contractID int64, sebelum, sesudah any, ip string) error {
	return insertAuditLogObj(ctx, tx, actorID, aksi, "contract", contractID, sebelum, sesudah, ip)
}

func insertStatusHistory(ctx context.Context, tx pgx.Tx, contractID int64, dari *string, ke string, actorID int64) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO contract_status_history (contract_id, status_dari, status_ke, aktor_user_id, waktu)
		VALUES ($1, $2, $3, $4, NOW())`, contractID, dari, ke, actorID)
	return err
}

func insertClauses(ctx context.Context, tx pgx.Tx, versionID int64, clauses []domain.Clause) error {
	for _, c := range clauses {
		var ref *int64
		if c.LegalReferenceID > 0 {
			ref = &c.LegalReferenceID
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO contract_clauses (version_id, kode_pasal, isi, urutan, legal_reference_id)
			VALUES ($1, $2, $3, $4, $5)`, versionID, c.KodePasal, c.Isi, c.Urutan, ref); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) RegionIDByVillage(ctx context.Context, villageID int64) (int64, error) {
	var regionID int64
	err := s.db.QueryRow(ctx, `SELECT region_id FROM villages WHERE id = $1`, villageID).Scan(&regionID)
	return regionID, notFound(err)
}

// DraftingOptions memuat template terbaru per jenis (template wilayah diutamakan atas nasional),
// clause_library-nya, dan seluruh legal_references.
func (s *Store) DraftingOptions(ctx context.Context, regionID int64) (domain.DraftingOptions, error) {
	o := domain.DraftingOptions{RegionID: regionID, Templates: []domain.ContractTemplate{}, LegalReferences: []domain.LegalReference{}}
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT ON (jenis) id, jenis::text, versi
		FROM contract_templates
		WHERE region_id IS NULL OR region_id = $1
		ORDER BY jenis, (region_id IS NULL), versi DESC`, regionID)
	if err != nil {
		return o, err
	}
	idx := map[int64]int{}
	var ids []int64
	for rows.Next() {
		var t domain.ContractTemplate
		var jenis string
		if err := rows.Scan(&t.ID, &jenis, &t.Versi); err != nil {
			rows.Close()
			return o, err
		}
		t.Jenis = domain.ContractJenis(jenis)
		t.Clauses = []domain.LibraryClause{}
		idx[t.ID] = len(o.Templates)
		ids = append(ids, t.ID)
		o.Templates = append(o.Templates, t)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return o, err
	}

	if len(ids) > 0 {
		rows, err = s.db.Query(ctx, `
			SELECT template_id, kode_pasal, judul, isi, wajib
			FROM clause_library WHERE template_id = ANY($1) ORDER BY template_id, id`, ids)
		if err != nil {
			return o, err
		}
		for rows.Next() {
			var tid int64
			var c domain.LibraryClause
			if err := rows.Scan(&tid, &c.KodePasal, &c.Judul, &c.Isi, &c.Wajib); err != nil {
				rows.Close()
				return o, err
			}
			t := &o.Templates[idx[tid]]
			c.Urutan = len(t.Clauses) + 1
			t.Clauses = append(t.Clauses, c)
		}
		rows.Close()
		if err := rows.Err(); err != nil {
			return o, err
		}
	}

	rows, err = s.db.Query(ctx, `SELECT id, peraturan, nomor_pasal, isi FROM legal_references ORDER BY id`)
	if err != nil {
		return o, err
	}
	defer rows.Close()
	for rows.Next() {
		var r domain.LegalReference
		if err := rows.Scan(&r.ID, &r.Peraturan, &r.NomorPasal, &r.Isi); err != nil {
			return o, err
		}
		o.LegalReferences = append(o.LegalReferences, r)
	}
	return o, rows.Err()
}

// ContractDraftState memuat status kontrak dan versi terakhir beserta pasalnya.
func (s *Store) ContractDraftState(ctx context.Context, contractID int64) (domain.ContractDraftState, error) {
	var st domain.ContractDraftState
	var village *int64
	var jenis, status string
	err := s.db.QueryRow(ctx, `
		SELECT c.id, c.village_id, c.jenis::text, c.status::text, cv.id, cv.nomor_versi, cv.sumber::text, COALESCE(cv.isi, '')
		FROM contracts c
		JOIN LATERAL (
			SELECT id, nomor_versi, sumber, isi FROM contract_versions
			WHERE contract_id = c.id ORDER BY nomor_versi DESC LIMIT 1
		) cv ON true
		WHERE c.id = $1`, contractID).Scan(&st.ContractID, &village, &jenis, &status, &st.VersionID, &st.NomorVersi, &st.Sumber, &st.Isi)
	if err != nil {
		return st, notFound(err)
	}
	if village != nil {
		st.VillageID = *village
	}
	st.Jenis, st.Status = domain.ContractJenis(jenis), domain.ContractStatus(status)
	byVersion, err := s.clausesByVersion(ctx, `cc.version_id = $1`, st.VersionID)
	if err != nil {
		return st, err
	}
	st.Clauses = clausesOrParsed(byVersion[st.VersionID], st.Isi)
	return st, nil
}

// clausesByVersion membaca contract_clauses; judul diambil dari naskah versi karena tabel tidak punya kolom judul.
func (s *Store) clausesByVersion(ctx context.Context, where string, arg int64) (map[int64][]domain.Clause, error) {
	rows, err := s.db.Query(ctx, `
		SELECT cc.version_id, cc.kode_pasal, cc.isi, cc.urutan, COALESCE(cc.legal_reference_id, 0), COALESCE(cv.isi, '')
		FROM contract_clauses cc JOIN contract_versions cv ON cv.id = cc.version_id
		WHERE `+where+` ORDER BY cc.version_id, cc.urutan`, arg)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[int64][]domain.Clause{}
	titles := map[int64]map[int]string{}
	for rows.Next() {
		var vid int64
		var c domain.Clause
		var naskah string
		if err := rows.Scan(&vid, &c.KodePasal, &c.Isi, &c.Urutan, &c.LegalReferenceID, &naskah); err != nil {
			return nil, err
		}
		if titles[vid] == nil {
			titles[vid] = usecase.TitlesByUrutan(naskah)
		}
		c.Judul = titles[vid][c.Urutan]
		out[vid] = append(out[vid], c)
	}
	return out, rows.Err()
}

// clausesOrParsed: versi lama (sebelum editor pasal) tidak punya baris contract_clauses, jadi pasal diparsing dari naskah.
func clausesOrParsed(rows []domain.Clause, isi string) []domain.Clause {
	if len(rows) > 0 {
		return rows
	}
	if parsed := usecase.ClausesFromText(isi); parsed != nil {
		return parsed
	}
	return []domain.Clause{}
}

// SaveContractAudit menyimpan ai_audits + ai_audit_findings; status draf naik ke diaudit.
func (s *Store) SaveContractAudit(ctx context.Context, p usecase.SaveAuditParams) (int64, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(ctx)

	var status string
	if err := tx.QueryRow(ctx, `SELECT status::text FROM contracts WHERE id = $1 FOR UPDATE`, p.ContractID).Scan(&status); err != nil {
		return 0, notFound(err)
	}
	if status == string(domain.StatusCancelled) {
		return 0, domain.ErrContractNotEditable
	}
	var auditID int64
	if err := tx.QueryRow(ctx, `
		INSERT INTO ai_audits (version_id, model, skor, status, dijalankan_pada)
		SELECT id, $2, $3, 'selesai', NOW() FROM contract_versions WHERE id = $1 AND contract_id = $4
		RETURNING id`, p.VersionID, p.Result.Model, p.Result.Score, p.ContractID).Scan(&auditID); err != nil {
		return 0, notFound(err)
	}
	for _, f := range p.Result.Findings {
		if _, err := tx.Exec(ctx, `INSERT INTO ai_audit_findings (audit_id, kode_pasal, tingkat, pesan) VALUES ($1, $2, $3, $4)`,
			auditID, f.KodePasal, f.Tingkat, f.Pesan); err != nil {
			return 0, err
		}
	}
	if status == string(domain.StatusDraft) {
		tag, err := tx.Exec(ctx, `UPDATE contracts SET status = 'diaudit' WHERE id = $1 AND status = 'draf'`, p.ContractID)
		if err != nil {
			return 0, err
		}
		if tag.RowsAffected() == 1 {
			if err := insertStatusHistory(ctx, tx, p.ContractID, &status, string(domain.StatusAudited), p.ActorID); err != nil {
				return 0, err
			}
		}
	}
	if err := insertAuditLog(ctx, tx, p.ActorID, "contract.audit", p.ContractID, nil, map[string]any{
		"versionId": p.VersionID, "auditId": auditID, "model": p.Result.Model, "skor": p.Result.Score,
	}, p.ActorIP); err != nil {
		return 0, err
	}
	return auditID, tx.Commit(ctx)
}

// PublishContract menyimpan teks yang sudah diredaksi dan mengubah status ditandatangani → dipublikasikan.
func (s *Store) PublishContract(ctx context.Context, p usecase.PublishParams) (domain.Publication, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.Publication{}, err
	}
	defer tx.Rollback(ctx)

	var status string
	var latest int64
	err = tx.QueryRow(ctx, `
		SELECT c.status::text, (SELECT id FROM contract_versions WHERE contract_id = c.id ORDER BY nomor_versi DESC LIMIT 1)
		FROM contracts c WHERE c.id = $1 FOR UPDATE OF c`, p.ContractID).Scan(&status, &latest)
	if err != nil {
		return domain.Publication{}, notFound(err)
	}
	if status != string(domain.StatusSigned) {
		return domain.Publication{}, domain.ErrContractNotEditable
	}
	if latest != p.VersionID {
		return domain.Publication{}, domain.ErrConflict
	}

	kinds := p.RedactedKinds
	if kinds == nil {
		kinds = []string{}
	}
	kolom, _ := json.Marshal(map[string]any{"redactedKinds": kinds})
	pub := domain.Publication{ContractID: p.ContractID, VersionID: p.VersionID, IsiTersaring: p.IsiTersaring, RedactedKinds: kinds}
	if err := tx.QueryRow(ctx, `
		INSERT INTO publications (contract_id, version_id, isi_tersaring, kolom_tampil, dipublikasikan_oleh, waktu)
		VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, waktu`,
		p.ContractID, p.VersionID, p.IsiTersaring, kolom, p.ActorID).Scan(&pub.ID, &pub.Waktu); err != nil {
		return domain.Publication{}, err
	}
	tag, err := tx.Exec(ctx, `UPDATE contracts SET status = 'dipublikasikan' WHERE id = $1 AND status = 'ditandatangani'`, p.ContractID)
	if err != nil {
		return domain.Publication{}, err
	}
	if tag.RowsAffected() != 1 {
		return domain.Publication{}, domain.ErrContractNotEditable
	}
	if err := insertStatusHistory(ctx, tx, p.ContractID, &status, string(domain.StatusPublished), p.ActorID); err != nil {
		return domain.Publication{}, err
	}
	if err := insertAuditLog(ctx, tx, p.ActorID, "contract.publish", p.ContractID,
		map[string]any{"status": status},
		map[string]any{"status": domain.StatusPublished, "publicationId": pub.ID, "versionId": p.VersionID, "redactedKinds": kinds},
		p.ActorIP); err != nil {
		return domain.Publication{}, err
	}
	if err := notifyVendor(ctx, tx, p.ContractID, p.ActorID, "kontrak_dipublikasikan", "dipublikasikan untuk warga"); err != nil {
		return domain.Publication{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.Publication{}, err
	}
	return pub, nil
}

// LatestContractAudit mengambil audit terakhir dari versi mana pun milik kontrak.
func (s *Store) LatestContractAudit(ctx context.Context, contractID int64) (int64, *domain.ContractAudit, error) {
	var village *int64
	if err := s.db.QueryRow(ctx, `SELECT village_id FROM contracts WHERE id = $1`, contractID).Scan(&village); err != nil {
		return 0, nil, notFound(err)
	}
	var villageID int64
	if village != nil {
		villageID = *village
	}
	var a domain.ContractAudit
	err := s.db.QueryRow(ctx, `
		SELECT aa.id, cv.id, cv.nomor_versi, cv.sumber::text, aa.model, COALESCE(aa.skor, 0), aa.dijalankan_pada
		FROM ai_audits aa JOIN contract_versions cv ON cv.id = aa.version_id
		WHERE cv.contract_id = $1
		ORDER BY aa.dijalankan_pada DESC, aa.id DESC
		LIMIT 1`, contractID).Scan(&a.ID, &a.VersionID, &a.NomorVersi, &a.Sumber, &a.Model, &a.Skor, &a.DijalankanPada)
	if errors.Is(err, pgx.ErrNoRows) {
		return villageID, nil, nil
	}
	if err != nil {
		return 0, nil, err
	}
	rows, err := s.db.Query(ctx, `SELECT kode_pasal, tingkat::text, pesan FROM ai_audit_findings WHERE audit_id = $1 ORDER BY id`, a.ID)
	if err != nil {
		return 0, nil, err
	}
	defer rows.Close()
	a.Findings = []domain.AuditFinding{}
	for rows.Next() {
		f := domain.AuditFinding{Sumber: domain.SumberLLM}
		if a.Model == usecase.RuleAuditorModel {
			f.Sumber = domain.SumberAturan
		}
		if err := rows.Scan(&f.KodePasal, &f.Tingkat, &f.Pesan); err != nil {
			return 0, nil, err
		}
		a.Findings = append(a.Findings, f)
	}
	return villageID, &a, rows.Err()
}
