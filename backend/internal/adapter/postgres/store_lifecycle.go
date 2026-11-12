package postgres

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// ReviseContract membuat versi revisi baru (versi N+1) untuk kontrak yang ada.
func (s *Store) ReviseContract(ctx context.Context, p usecase.ReviseContractParams) (domain.ContractVersion, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ContractVersion{}, err
	}
	defer tx.Rollback(ctx)

	// 1. Ambil info kontrak dan kunci baris untuk update
	queryLock := `
		SELECT 
			c.id, c.village_id, c.status,
			COALESCE(v.nama, ''), COALESCE(u.nama, ''),
			COALESCE(cp_party.nama, ''), COALESCE(cp_party.npwp, ''), COALESCE(cp_party.alamat, ''),
			c.jenis, c.judul, c.nilai, c.tenggat, COALESCE(c.skema_pembayaran, ''), COALESCE(c.metode_pemilihan, '')
		FROM contracts c
		LEFT JOIN villages v ON c.village_id = v.id
		LEFT JOIN users u ON u.id = $2
		LEFT JOIN contract_parties cp ON c.id = cp.contract_id AND cp.peran_pihak = 'kedua'
		LEFT JOIN counterparties cp_party ON cp.counterparty_id = cp_party.id
		WHERE c.id = $1
		FOR UPDATE OF c
	`

	var contractID, villageID int64
	var status, villageName, kadesName, vendorName, vendorNPWP, vendorAddress string
	var jenis, judul, skemaPembayaran, metodePemilihan string
	var nilai float64
	var tenggat time.Time

	err = tx.QueryRow(ctx, queryLock, p.ContractID, p.KadesUserID).Scan(
		&contractID, &villageID, &status,
		&villageName, &kadesName,
		&vendorName, &vendorNPWP, &vendorAddress,
		&jenis, &judul, &nilai, &tenggat, &skemaPembayaran, &metodePemilihan,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.ContractVersion{}, domain.ErrNotFound
		}
		return domain.ContractVersion{}, err
	}

	// Validasi kepemilikan desa
	if p.VillageID > 0 && villageID != p.VillageID {
		return domain.ContractVersion{}, domain.ErrForbidden
	}

	// Status ≥ ditandatangani (atau dibatalkan) terkunci: segel SHA-256 tidak boleh berubah.
	if domain.ContractStatus(status).Locked() {
		return domain.ContractVersion{}, domain.ErrContractNotEditable
	}

	// 2. Ambil nomor versi terakhir
	var currentMaxVersion int
	queryMaxVersion := `SELECT COALESCE(MAX(nomor_versi), 0) FROM contract_versions WHERE contract_id = $1`
	if err := tx.QueryRow(ctx, queryMaxVersion, contractID).Scan(&currentMaxVersion); err != nil {
		return domain.ContractVersion{}, err
	}
	nextVersion := currentMaxVersion + 1

	// 3. Tentukan isi draf teks kontrak
	draftParams := usecase.CreateContractDraftParams{
		Jenis:           domain.ContractJenis(jenis),
		Judul:           judul,
		Nilai:           nilai,
		Tenggat:         tenggat,
		SkemaPembayaran: skemaPembayaran,
		MetodePemilihan: metodePemilihan,
		VillageName:     villageName,
		KadesName:       kadesName,
		VendorName:      vendorName,
		VendorNPWP:      vendorNPWP,
		VendorAddress:   vendorAddress,
		JawabanForm:     p.JawabanForm,
	}
	clauses := p.Clauses
	teksKontrak := strings.TrimSpace(p.DrafTeksOverride)
	switch {
	case clauses != nil: // editor pasal manual
		teksKontrak = usecase.ComposeContractText(draftParams, clauses)
	case teksKontrak == "":
		clauses = usecase.RuleDraftClauses(draftParams)
		teksKontrak = usecase.ComposeContractText(draftParams, clauses)
	}

	jawabanJSON, err := json.Marshal(p.JawabanForm)
	if err != nil {
		jawabanJSON = []byte("{}")
	}

	// 5. Simpan ke contract_versions
	var versionID int64
	var createdAt time.Time
	insertVersionQuery := `
		INSERT INTO contract_versions (
			contract_id, nomor_versi, jawaban_form, isi, sumber, dibuat_oleh, dibuat_pada
		) VALUES (
			$1, $2, $3, $4, 'manual', $5, NOW()
		) RETURNING id, dibuat_pada
	`
	err = tx.QueryRow(ctx, insertVersionQuery, contractID, nextVersion, jawabanJSON, teksKontrak, p.KadesUserID).Scan(&versionID, &createdAt)
	if err != nil {
		return domain.ContractVersion{}, err
	}
	if err := insertClauses(ctx, tx, versionID, clauses); err != nil {
		return domain.ContractVersion{}, err
	}

	// 6. Versi baru belum diaudit: status kembali ke draf sampai POST /contracts/{id}/audit dijalankan
	//    (tidak ada skor pengganti dari rule engine; keputusan 2026-11-10).
	newStatus := string(domain.StatusDraft)
	tag, err := tx.Exec(ctx, `UPDATE contracts SET status = $1 WHERE id = $2
		AND status NOT IN ('ditandatangani', 'dipublikasikan', 'berjalan', 'selesai', 'dibatalkan')`, newStatus, contractID)
	if err != nil {
		return domain.ContractVersion{}, err
	}
	if tag.RowsAffected() != 1 {
		return domain.ContractVersion{}, domain.ErrContractNotEditable
	}

	// 8. Catat riwayat status dan audit log
	if err := insertStatusHistory(ctx, tx, contractID, &status, newStatus, p.KadesUserID); err != nil {
		return domain.ContractVersion{}, err
	}
	if err := insertAuditLog(ctx, tx, p.KadesUserID, "contract.revise", contractID,
		map[string]any{"status": status, "nomorVersi": currentMaxVersion},
		map[string]any{"status": newStatus, "nomorVersi": nextVersion, "versionId": versionID, "sumber": "manual", "jumlahPasal": len(clauses)},
		p.ActorIP); err != nil {
		return domain.ContractVersion{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.ContractVersion{}, err
	}

	return domain.ContractVersion{
		ID:          versionID,
		ContractID:  contractID,
		NomorVersi:  nextVersion,
		JawabanForm: p.JawabanForm,
		Isi:         teksKontrak,
		Sumber:      "manual",
		Clauses:     clauses,
		DibuatOleh:  p.KadesUserID,
		CreatedAt:   createdAt,
	}, nil
}

// SubmitContractReview menyimpan review/tanggapan dari rekanan/penyedia terhadap draf kontrak.
func (s *Store) SubmitContractReview(ctx context.Context, p usecase.SubmitReviewParams) (domain.ContractReview, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.ContractReview{}, err
	}
	defer tx.Rollback(ctx)

	// 1. Verifikasi kepemilikan dan dapatkan party_id pihak rekanan
	queryParty := `
		SELECT cp.id, c.status
		FROM contract_parties cp
		JOIN contracts c ON cp.contract_id = c.id
		LEFT JOIN counterparties cparty ON cp.counterparty_id = cparty.id
		WHERE c.id = $1 
		  AND (cparty.user_id = $2 OR cp.user_id = $2)
		  AND cp.peran_pihak = 'kedua'
		FOR UPDATE OF c
	`
	var partyID int64
	var contractStatus string
	err = tx.QueryRow(ctx, queryParty, p.ContractID, p.VendorUserID).Scan(&partyID, &contractStatus)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.ContractReview{}, domain.ErrNotFound // bukan pihak kedua kontrak ini: 404, id tidak bisa ditebak
		}
		return domain.ContractReview{}, err
	}

	// Tinjauan hanya setelah desa mengirim kontrak (POST /contracts/{id}/send) dan sebelum tanda tangan.
	if contractStatus != string(domain.StatusInReview) {
		return domain.ContractReview{}, fmt.Errorf("%w: kontrak belum dikirim untuk ditinjau atau sudah lewat tahap peninjauan", domain.ErrInvalidState)
	}

	// 2. Ambil versi terbaru kontrak
	var versionID int64
	queryVersion := `SELECT id FROM contract_versions WHERE contract_id = $1 ORDER BY nomor_versi DESC LIMIT 1`
	err = tx.QueryRow(ctx, queryVersion, p.ContractID).Scan(&versionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.ContractReview{}, domain.ErrNotFound
		}
		return domain.ContractReview{}, err
	}

	// Normalisasi status review enum ("setuju" atau "minta_revisi")
	reviewStatus := strings.ToLower(strings.TrimSpace(p.Status))
	if reviewStatus == "disetujui" || reviewStatus == "approve" || reviewStatus == "approved" {
		reviewStatus = "setuju"
	} else if reviewStatus == "perlu_revisi" || reviewStatus == "revisi" || reviewStatus == "minta-revisi" {
		reviewStatus = "minta_revisi"
	}
	if reviewStatus != "setuju" && reviewStatus != "minta_revisi" {
		return domain.ContractReview{}, fmt.Errorf("invalid review status: must be 'setuju' or 'minta_revisi'")
	}

	// 3. Simpan ke contract_reviews
	var reviewID int64
	var waktu time.Time
	insertReviewQuery := `
		INSERT INTO contract_reviews (version_id, party_id, clause_id, komentar, status, waktu)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, waktu
	`
	err = tx.QueryRow(ctx, insertReviewQuery, versionID, partyID, p.ClauseID, p.Komentar, reviewStatus).Scan(&reviewID, &waktu)
	if err != nil {
		return domain.ContractReview{}, err
	}

	if err := insertAuditLog(ctx, tx, p.VendorUserID, "contract.review", p.ContractID, nil,
		map[string]any{"reviewId": reviewID, "versionId": versionID, "status": reviewStatus}, p.ActorIP); err != nil {
		return domain.ContractReview{}, err
	}
	var creatorID int64
	var judul string
	if err := tx.QueryRow(ctx, `SELECT dibuat_oleh, judul FROM contracts WHERE id = $1`, p.ContractID).Scan(&creatorID, &judul); err != nil {
		return domain.ContractReview{}, err
	}
	if err := notify(ctx, tx, creatorID, "kontrak_ditinjau",
		fmt.Sprintf("Penyedia mengirim tinjauan (%s) untuk kontrak \"%s\".", reviewStatus, judul), contractLink(p.ContractID)); err != nil {
		return domain.ContractReview{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.ContractReview{}, err
	}

	return domain.ContractReview{
		ID:        reviewID,
		VersionID: versionID,
		PartyID:   partyID,
		ClauseID:  p.ClauseID,
		Komentar:  p.Komentar,
		Status:    reviewStatus,
		Waktu:     waktu,
	}, nil
}

// SignContract mencatat tanda tangan digital untuk pihak kades atau rekanan dan melakukan auto-seal jika kedua pihak telah menandatangani.
func (s *Store) SignContract(ctx context.Context, p usecase.SignContractParams) (domain.Signature, *domain.DocumentSeal, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return domain.Signature{}, nil, err
	}
	defer tx.Rollback(ctx)

	// 1. Kunci baris kontrak untuk mencegah race condition tanda tangan bersamaan
	var contractStatus string
	err = tx.QueryRow(ctx, `SELECT status FROM contracts WHERE id = $1 FOR UPDATE`, p.ContractID).Scan(&contractStatus)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Signature{}, nil, domain.ErrNotFound
		}
		return domain.Signature{}, nil, err
	}

	if contractStatus == string(domain.StatusSigned) || contractStatus == string(domain.StatusPublished) {
		return domain.Signature{}, nil, errors.New("contract is already fully signed and sealed")
	}
	if contractStatus == string(domain.StatusCancelled) {
		return domain.Signature{}, nil, domain.ErrContractNotEditable
	}

	// 2. Cari party_id untuk pengguna pemanggil
	var partyID int64
	if p.CallerRole == domain.RoleKades {
		// Kades hanya boleh menandatangani kontrak desanya sendiri (cegah IDOR lintas desa).
		if p.VillageID == nil {
			return domain.Signature{}, nil, domain.ErrForbidden
		}
		queryParty := `
			SELECT cp.id
			FROM contract_parties cp
			JOIN contracts c ON c.id = cp.contract_id
			WHERE cp.contract_id = $1 AND cp.peran_pihak = 'pertama' AND c.village_id = $2
		`
		err = tx.QueryRow(ctx, queryParty, p.ContractID, *p.VillageID).Scan(&partyID)
	} else if p.CallerRole == domain.RolePenyedia {
		queryParty := `
			SELECT cp.id
			FROM contract_parties cp
			LEFT JOIN counterparties cparty ON cp.counterparty_id = cparty.id
			WHERE cp.contract_id = $1 
			  AND (cparty.user_id = $2 OR cp.user_id = $2)
			  AND cp.peran_pihak = 'kedua'
		`
		err = tx.QueryRow(ctx, queryParty, p.ContractID, p.UserID).Scan(&partyID)
	} else {
		return domain.Signature{}, nil, domain.ErrForbidden
	}

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Signature{}, nil, domain.ErrForbidden
		}
		return domain.Signature{}, nil, err
	}

	// 3. Ambil versi terbaru kontrak
	var versionID int64
	var teksKontrak string
	queryVersion := `SELECT id, isi FROM contract_versions WHERE contract_id = $1 ORDER BY nomor_versi DESC LIMIT 1`
	err = tx.QueryRow(ctx, queryVersion, p.ContractID).Scan(&versionID, &teksKontrak)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Signature{}, nil, domain.ErrNotFound
		}
		return domain.Signature{}, nil, err
	}

	// 4. Periksa apakah party ini sudah menandatangani versi ini sebelumnya
	var existingSigID int64
	checkSigQuery := `SELECT id FROM signatures WHERE version_id = $1 AND party_id = $2`
	err = tx.QueryRow(ctx, checkSigQuery, versionID, partyID).Scan(&existingSigID)
	if err == nil {
		return domain.Signature{}, nil, domain.ErrConflict
	} else if !errors.Is(err, pgx.ErrNoRows) {
		return domain.Signature{}, nil, err
	}

	// 5. Simpan data tanda tangan
	metode := p.Metode
	if metode != "psre" {
		metode = "simulasi"
	}

	var sigID int64
	var waktuSig time.Time
	insertSigQuery := `
		INSERT INTO signatures (version_id, party_id, signer_user_id, waktu, metode, referensi)
		VALUES ($1, $2, $3, NOW(), $4, $5)
		RETURNING id, waktu
	`
	err = tx.QueryRow(ctx, insertSigQuery, versionID, partyID, p.UserID, metode, p.StorageKey).Scan(&sigID, &waktuSig)
	if err != nil {
		return domain.Signature{}, nil, err
	}

	sigResult := domain.Signature{
		ID:           sigID,
		VersionID:    versionID,
		PartyID:      partyID,
		SignerUserID: p.UserID,
		Metode:       metode,
		Referensi:    p.StorageKey,
		Waktu:        waktuSig,
	}

	// 6. Periksa apakah SEMUA pihak pada kontrak ini telah menandatangani versi ini
	var unsignedCount int
	queryUnsigned := `
		SELECT COUNT(*)
		FROM contract_parties cp
		LEFT JOIN signatures s ON s.party_id = cp.id AND s.version_id = $1
		WHERE cp.contract_id = $2 AND s.id IS NULL
	`
	if err := tx.QueryRow(ctx, queryUnsigned, versionID, p.ContractID).Scan(&unsignedCount); err != nil {
		return domain.Signature{}, nil, err
	}

	var sealResult *domain.DocumentSeal

	// 7. Jika seluruh pihak sudah menandatangani -> jalankan AUTO-SEAL
	if unsignedCount == 0 {
		// Hitung hash SHA256 dari teks kontrak
		hasher := sha256.New()
		hasher.Write([]byte(teksKontrak))
		sha256Hash := hex.EncodeToString(hasher.Sum(nil))

		// Simpan record dokumen ke tabel files
		fileKey := fmt.Sprintf("contracts/%d/sealed_v%d.json", p.ContractID, versionID)
		fileSize := int64(len(teksKontrak))
		var fileID int64
		insertFileQuery := `
			INSERT INTO files (kunci_penyimpanan, mime, ukuran, diunggah_oleh, diunggah_pada)
			VALUES ($1, 'application/json', $2, $3, NOW())
			RETURNING id
		`
		if err := tx.QueryRow(ctx, insertFileQuery, fileKey, fileSize, p.UserID).Scan(&fileID); err != nil {
			return domain.Signature{}, nil, err
		}

		// Simpan ke document_seals
		var sealID int64
		var waktuSegel time.Time
		chainName := "saksi-ledger-simulated"
		txHash := "tx_" + sha256Hash[:32]
		var prevSealID *int64
		insertSealQuery := `
			INSERT INTO document_seals (version_id, file_id, sha256, waktu_segel, segel_sebelumnya_id, chain, tx_hash)
			VALUES ($1, $2, $3, NOW(), (
				SELECT ds.id FROM document_seals ds JOIN contract_versions v ON v.id = ds.version_id
				WHERE v.contract_id = $6 ORDER BY ds.id DESC LIMIT 1), $4, $5)
			RETURNING id, waktu_segel, segel_sebelumnya_id
		`
		err = tx.QueryRow(ctx, insertSealQuery, versionID, fileID, sha256Hash, chainName, txHash, p.ContractID).Scan(&sealID, &waktuSegel, &prevSealID)
		if err != nil {
			return domain.Signature{}, nil, err
		}

		// Update status kontrak ke "ditandatangani"
		statusSigned := string(domain.StatusSigned)
		if _, err := tx.Exec(ctx, `UPDATE contracts SET status = $1 WHERE id = $2`, statusSigned, p.ContractID); err != nil {
			return domain.Signature{}, nil, err
		}

		// Catat ke riwayat status
		insertHistoryQuery := `
			INSERT INTO contract_status_history (contract_id, status_ke, aktor_user_id, waktu)
			VALUES ($1, $2, $3, NOW())
		`
		if _, err := tx.Exec(ctx, insertHistoryQuery, p.ContractID, statusSigned, p.UserID); err != nil {
			return domain.Signature{}, nil, err
		}

		sealResult = &domain.DocumentSeal{
			ID:                sealID,
			VersionID:         versionID,
			FileID:            fileID,
			SHA256:            sha256Hash,
			WaktuSegel:        waktuSegel,
			SegelSebelumnyaID: prevSealID,
			Chain:             chainName,
			TxHash:            txHash,
		}
	}

	if err := insertAuditLog(ctx, tx, p.UserID, "contract.sign", p.ContractID, nil,
		map[string]any{"signatureId": sigID, "partyId": partyID, "versionId": versionID, "metode": metode}, p.ActorIP); err != nil {
		return domain.Signature{}, nil, err
	}
	var creatorID int64
	var judul string
	if err := tx.QueryRow(ctx, `SELECT dibuat_oleh, judul FROM contracts WHERE id = $1`, p.ContractID).Scan(&creatorID, &judul); err != nil {
		return domain.Signature{}, nil, err
	}
	vendorID, err := vendorUserID(ctx, tx, p.ContractID)
	if err != nil {
		return domain.Signature{}, nil, err
	}
	link := contractLink(p.ContractID)
	if sealResult != nil {
		if err := insertAuditLog(ctx, tx, p.UserID, "contract.seal", p.ContractID, nil,
			map[string]any{"sealId": sealResult.ID, "sha256": sealResult.SHA256, "segelSebelumnyaId": prevSealIDOf(sealResult)}, p.ActorIP); err != nil {
			return domain.Signature{}, nil, err
		}
		for _, uid := range uniqueIDs(creatorID, vendorID) {
			if err := notify(ctx, tx, uid, "kontrak_disegel", fmt.Sprintf("Kontrak \"%s\" sudah ditandatangani semua pihak dan disegel.", judul), link); err != nil {
				return domain.Signature{}, nil, err
			}
		}
	} else {
		other := vendorID
		if p.CallerRole != domain.RoleKades {
			other = creatorID
		}
		if other != p.UserID {
			if err := notify(ctx, tx, other, "kontrak_ditandatangani", fmt.Sprintf("Pihak lain sudah menandatangani kontrak \"%s\". Giliran Anda.", judul), link); err != nil {
				return domain.Signature{}, nil, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Signature{}, nil, err
	}

	return sigResult, sealResult, nil
}

// GetContractLifecycleDetail memuat detail kontrak beserta seluruh riwayat versi, tanggapan review, tanda tangan, dan segel dokumen.
func (s *Store) GetContractLifecycleDetail(ctx context.Context, contractID int64, callerUserID int64, callerRole domain.UserRole, callerVillageID *int64) (domain.ContractLifecycleDetail, error) {
	// 1. Ambil detail kontrak dasar
	contractDetail, err := s.GetContractDetail(ctx, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}

	// 2. Otorisasi IDOR dengan aturan cakupan bersama; di luar cakupan = 404 agar id tidak bisa ditebak.
	if err := contractInScope(ctx, s.db, contractID, usecase.Scope{UserID: callerUserID, Role: callerRole, VillageID: callerVillageID}); err != nil {
		if errors.Is(err, domain.ErrForbidden) {
			return domain.ContractLifecycleDetail{}, domain.ErrNotFound
		}
		return domain.ContractLifecycleDetail{}, err
	}

	// 3. Ambil seluruh riwayat versi kontrak
	queryVersions := `
		SELECT id, contract_id, nomor_versi, jawaban_form, COALESCE(isi, ''), sumber, dibuat_oleh, dibuat_pada
		FROM contract_versions
		WHERE contract_id = $1
		ORDER BY nomor_versi ASC
	`
	rowsV, err := s.db.Query(ctx, queryVersions, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}
	defer rowsV.Close()

	var versions []domain.ContractVersion
	var currentVersion domain.ContractVersion
	for rowsV.Next() {
		var v domain.ContractVersion
		var rawJawaban []byte
		if err := rowsV.Scan(&v.ID, &v.ContractID, &v.NomorVersi, &rawJawaban, &v.Isi, &v.Sumber, &v.DibuatOleh, &v.CreatedAt); err != nil {
			return domain.ContractLifecycleDetail{}, err
		}
		if len(rawJawaban) > 0 {
			_ = json.Unmarshal(rawJawaban, &v.JawabanForm)
		}
		versions = append(versions, v)
		if v.NomorVersi >= currentVersion.NomorVersi {
			currentVersion = v
		}
	}

	byVersion, err := s.clausesByVersion(ctx, `cv.contract_id = $1`, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}
	for i := range versions {
		versions[i].Clauses = clausesOrParsed(byVersion[versions[i].ID], versions[i].Isi)
		if versions[i].ID == currentVersion.ID {
			currentVersion.Clauses = versions[i].Clauses
		}
	}

	// 4. Ambil seluruh review
	queryReviews := `
		SELECT cr.id, cr.version_id, cr.party_id, cr.clause_id, COALESCE(cr.komentar, ''), cr.status, cr.waktu
		FROM contract_reviews cr
		JOIN contract_versions cv ON cr.version_id = cv.id
		WHERE cv.contract_id = $1
		ORDER BY cr.waktu ASC
	`
	rowsR, err := s.db.Query(ctx, queryReviews, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}
	defer rowsR.Close()

	var reviews []domain.ContractReview
	for rowsR.Next() {
		var r domain.ContractReview
		var statusStr string
		if err := rowsR.Scan(&r.ID, &r.VersionID, &r.PartyID, &r.ClauseID, &r.Komentar, &statusStr, &r.Waktu); err != nil {
			return domain.ContractLifecycleDetail{}, err
		}
		r.Status = statusStr
		reviews = append(reviews, r)
	}
	if reviews == nil {
		reviews = []domain.ContractReview{}
	}

	// 5. Ambil seluruh tanda tangan
	querySignatures := `
		SELECT s.id, s.version_id, s.party_id, s.signer_user_id, s.waktu, s.metode, COALESCE(s.referensi, '')
		FROM signatures s
		JOIN contract_versions cv ON s.version_id = cv.id
		WHERE cv.contract_id = $1
		ORDER BY s.waktu ASC
	`
	rowsS, err := s.db.Query(ctx, querySignatures, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}
	defer rowsS.Close()

	var signatures []domain.Signature
	for rowsS.Next() {
		var sig domain.Signature
		var metodeStr string
		if err := rowsS.Scan(&sig.ID, &sig.VersionID, &sig.PartyID, &sig.SignerUserID, &sig.Waktu, &metodeStr, &sig.Referensi); err != nil {
			return domain.ContractLifecycleDetail{}, err
		}
		sig.Metode = metodeStr
		signatures = append(signatures, sig)
	}
	if signatures == nil {
		signatures = []domain.Signature{}
	}

	// 6. Ambil segel dokumen versi terakhir jika ada
	var seal *domain.DocumentSeal
	if currentVersion.ID > 0 {
		querySeal := `
			SELECT id, version_id, file_id, sha256, waktu_segel, segel_sebelumnya_id, COALESCE(chain, ''), COALESCE(tx_hash, '')
			FROM document_seals
			WHERE version_id = $1
			LIMIT 1
		`
		var sRecord domain.DocumentSeal
		err = s.db.QueryRow(ctx, querySeal, currentVersion.ID).Scan(
			&sRecord.ID, &sRecord.VersionID, &sRecord.FileID, &sRecord.SHA256,
			&sRecord.WaktuSegel, &sRecord.SegelSebelumnyaID, &sRecord.Chain, &sRecord.TxHash,
		)
		if err == nil {
			seal = &sRecord
		}
	}

	rowsH, err := s.db.Query(ctx, `
		SELECT h.id, h.status_dari::text, h.status_ke::text, h.aktor_user_id, COALESCE(u.nama, ''), h.waktu
		FROM contract_status_history h LEFT JOIN users u ON u.id = h.aktor_user_id
		WHERE h.contract_id = $1 ORDER BY h.waktu ASC, h.id ASC`, contractID)
	if err != nil {
		return domain.ContractLifecycleDetail{}, err
	}
	defer rowsH.Close()
	history := []domain.StatusChange{}
	for rowsH.Next() {
		var h domain.StatusChange
		if err := rowsH.Scan(&h.ID, &h.StatusDari, &h.StatusKe, &h.AktorUserID, &h.AktorNama, &h.Waktu); err != nil {
			return domain.ContractLifecycleDetail{}, err
		}
		history = append(history, h)
	}
	if err := rowsH.Err(); err != nil {
		return domain.ContractLifecycleDetail{}, err
	}

	return domain.ContractLifecycleDetail{
		Contract:      contractDetail,
		Version:       currentVersion,
		Versions:      versions,
		Reviews:       reviews,
		Signatures:    signatures,
		Seal:          seal,
		StatusHistory: history,
	}, nil
}

func prevSealIDOf(d *domain.DocumentSeal) any {
	if d.SegelSebelumnyaID == nil {
		return nil
	}
	return *d.SegelSebelumnyaID
}

func uniqueIDs(ids ...int64) []int64 {
	out := []int64{}
	for _, id := range ids {
		dup := false
		for _, o := range out {
			dup = dup || o == id
		}
		if id > 0 && !dup {
			out = append(out, id)
		}
	}
	return out
}
