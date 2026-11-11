package postgres_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// TestStore_SendContract_SecondPartyFlow: kades kirim -> penyedia pemilik melihat di daftar + detail -> penyedia meninjau.
// Memakai akun demo saja (seed_demo.sql): kades@saksi.id, penyedia@saksi.id (CV Maju Bersama), bpd@saksi.id.
func TestStore_SendContract_SecondPartyFlow(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, testDBURL())
	if err != nil {
		t.Fatalf("koneksi uji gagal: %v", err)
	}
	defer conn.Close(ctx)

	var kadesID, penyediaID, bpdID, cpID, otherVendorID int64
	var village int64
	err = conn.QueryRow(ctx, `SELECT
		(SELECT id FROM users WHERE email = 'kades@saksi.id'),
		(SELECT id FROM users WHERE email = 'penyedia@saksi.id'),
		(SELECT id FROM users WHERE email = 'bpd@saksi.id'),
		(SELECT k.id FROM counterparties k JOIN users u ON u.id = k.user_id WHERE u.email = 'penyedia@saksi.id'),
		(SELECT ur.village_id FROM user_roles ur JOIN users u ON u.id = ur.user_id WHERE u.email = 'kades@saksi.id' AND ur.role = 'kades'),
		COALESCE((SELECT k.user_id FROM counterparties k JOIN users u ON u.id = k.user_id WHERE u.email <> 'penyedia@saksi.id' LIMIT 1), 0)`).
		Scan(&kadesID, &penyediaID, &bpdID, &cpID, &village, &otherVendorID)
	if err != nil {
		t.Skipf("akun demo belum di-seed (seed_demo.sql): %v", err)
	}
	otherVillage := village + 1
	kades := usecase.Scope{UserID: kadesID, Role: domain.RoleKades, VillageID: &village}
	kadesLain := usecase.Scope{UserID: kadesID, Role: domain.RoleKades, VillageID: &otherVillage}
	penyedia := usecase.Scope{UserID: penyediaID, Role: domain.RolePenyedia}
	penyediaLain := usecase.Scope{UserID: otherVendorID, Role: domain.RolePenyedia}
	bpd := usecase.Scope{UserID: bpdID, Role: domain.RoleBPD, VillageID: &village}

	count := func(sql string, args ...any) int {
		t.Helper()
		var n int
		if err := conn.QueryRow(ctx, sql, args...).Scan(&n); err != nil {
			t.Fatalf("query hitung gagal: %v", err)
		}
		return n
	}
	listed := func(sc usecase.Scope, id int64) bool {
		t.Helper()
		list, err := store.ListContracts(ctx, sc, "")
		if err != nil {
			t.Fatal(err)
		}
		for _, c := range list {
			if c.ID == itoa(id) {
				return true
			}
		}
		return false
	}
	newContract := func(judul string) int64 {
		t.Helper()
		c, err := store.CreateContractWithDetails(ctx, usecase.CreateContractParams{
			VillageID: village, CounterpartyID: cpID, Jenis: domain.JenisPengadaan, Judul: judul, Nilai: 15000000,
			Tenggat: time.Now().Add(30 * 24 * time.Hour), SkemaPembayaran: "termin",
			IsiTeks: "Pasal 1: Lingkup\nPekerjaan.", CreatedBy: kadesID, IntegrityScore: 90, SHA256Hash: "uji-kirim",
		})
		if err != nil {
			t.Fatalf("CreateContractWithDetails: %v", err)
		}
		return c.ID
	}

	id := newContract("Uji kirim kontrak ke pihak kedua")

	// Draf: hanya desa yang melihat. Penyedia (pemilik sekalipun) dan BPD tidak.
	if !listed(kades, id) {
		t.Fatal("kades harus melihat draf desanya")
	}
	for name, sc := range map[string]usecase.Scope{"penyedia": penyedia, "bpd": bpd} {
		if listed(sc, id) {
			t.Fatalf("%s tidak boleh melihat draf di daftar", name)
		}
		if _, err := store.ContractByID(ctx, itoa(id), sc); !errors.Is(err, domain.ErrNotFound) {
			t.Fatalf("%s membuka draf harus ErrNotFound, dapat %v", name, err)
		}
		if _, err := store.GetContractLifecycleDetail(ctx, id, sc.UserID, sc.Role, sc.VillageID); !errors.Is(err, domain.ErrNotFound) {
			t.Fatalf("%s membuka lifecycle draf harus ErrNotFound, dapat %v", name, err)
		}
	}
	if _, err := store.SubmitContractReview(ctx, usecase.SubmitReviewParams{ContractID: id, VendorUserID: penyediaID, Status: "setuju"}); !errors.Is(err, domain.ErrInvalidState) {
		t.Fatalf("tinjauan pada draf harus ErrInvalidState, dapat %v", err)
	}

	// Kirim: desa lain ditolak sebagai 404, status tidak berubah.
	if _, err := store.SendContract(ctx, usecase.SendContractParams{ContractID: id, Scope: kadesLain}); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("kirim dari desa lain harus ErrNotFound, dapat %v", err)
	}
	vid, err := store.SendContract(ctx, usecase.SendContractParams{ContractID: id, Scope: kades, ActorIP: "10.0.0.7"})
	if err != nil || vid != village {
		t.Fatalf("SendContract gagal: vid=%d err=%v", vid, err)
	}
	if _, err := store.SendContract(ctx, usecase.SendContractParams{ContractID: id, Scope: kades}); !errors.Is(err, domain.ErrInvalidState) {
		t.Fatalf("kirim ulang harus ErrInvalidState, dapat %v", err)
	}
	if n := count(`SELECT COUNT(*) FROM contracts WHERE id = $1 AND status = 'ditinjau'`, id); n != 1 {
		t.Fatal("status harus ditinjau setelah dikirim")
	}
	if n := count(`SELECT COUNT(*) FROM contract_status_history WHERE contract_id = $1 AND status_ke::text = 'ditinjau' AND aktor_user_id = $2`, id, kadesID); n != 1 {
		t.Fatalf("riwayat status ->ditinjau harus 1, dapat %d", n)
	}
	if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.send' AND jenis_objek = 'contract' AND id_objek = $1 AND aktor_user_id = $2 AND ip = '10.0.0.7'`, id, kadesID); n != 1 {
		t.Fatalf("audit log contract.send harus 1, dapat %d", n)
	}
	if n := count(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND jenis = 'kontrak_dikirim' AND tautan = $2`, penyediaID, contractLinkFor(id)); n != 1 {
		t.Fatalf("notifikasi kontrak_dikirim ke penyedia harus 1, dapat %d", n)
	}

	// Setelah dikirim: penyedia pemilik dan BPD melihat; penyedia lain tidak.
	for name, sc := range map[string]usecase.Scope{"penyedia": penyedia, "bpd": bpd} {
		if !listed(sc, id) {
			t.Fatalf("%s harus melihat kontrak terkirim di daftar", name)
		}
		if c, err := store.ContractByID(ctx, itoa(id), sc); err != nil || c.Status != domain.StatusInReview {
			t.Fatalf("%s membuka kontrak terkirim: %+v, %v", name, c, err)
		}
		if d, err := store.GetContractLifecycleDetail(ctx, id, sc.UserID, sc.Role, sc.VillageID); err != nil || len(d.Versions) == 0 {
			t.Fatalf("%s lifecycle kontrak terkirim: versi=%d err=%v", name, len(d.Versions), err)
		}
	}
	if otherVendorID > 0 {
		if listed(penyediaLain, id) {
			t.Fatal("penyedia lain tidak boleh melihat kontrak ini")
		}
		if _, err := store.ContractByID(ctx, itoa(id), penyediaLain); !errors.Is(err, domain.ErrNotFound) {
			t.Fatalf("penyedia lain membuka kontrak harus ErrNotFound, dapat %v", err)
		}
		if _, err := store.SubmitContractReview(ctx, usecase.SubmitReviewParams{ContractID: id, VendorUserID: otherVendorID, Status: "setuju"}); !errors.Is(err, domain.ErrNotFound) {
			t.Fatalf("tinjauan penyedia lain harus ErrNotFound, dapat %v", err)
		}
	}

	// Penyedia pemilik meninjau: tersimpan, status tetap ditinjau, audit log + notifikasi ke pembuat.
	if _, err := store.SubmitContractReview(ctx, usecase.SubmitReviewParams{ContractID: id, VendorUserID: penyediaID, Komentar: "Mohon perjelas denda.", Status: "minta_revisi"}); err != nil {
		t.Fatalf("tinjauan penyedia pemilik gagal: %v", err)
	}
	if n := count(`SELECT COUNT(*) FROM contracts WHERE id = $1 AND status = 'ditinjau'`, id); n != 1 {
		t.Fatal("status harus tetap ditinjau setelah tinjauan")
	}
	if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.review' AND id_objek = $1 AND aktor_user_id = $2`, id, penyediaID); n != 1 {
		t.Fatalf("audit log contract.review harus 1, dapat %d", n)
	}
	if n := count(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND jenis = 'kontrak_ditinjau' AND tautan = $2`, kadesID, contractLinkFor(id)); n != 1 {
		t.Fatalf("notifikasi kontrak_ditinjau ke kades harus 1, dapat %d", n)
	}
}

// Temuan kritis yang belum diperbaiki pada audit terakhir memblokir pengiriman.
func TestStore_SendContract_BlockedByCriticalFindings(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()

	c := newDraftContract(t, store, "Uji kirim diblokir temuan kritis")
	st, err := store.ContractDraftState(ctx, c.ID)
	if err != nil {
		t.Fatal(err)
	}
	k := "P-07"
	if _, err := store.SaveContractAudit(ctx, usecase.SaveAuditParams{ContractID: c.ID, VersionID: st.VersionID, ActorID: 4,
		Result: domain.AuditResult{Model: "uji", Score: 40, Findings: []domain.AuditFinding{{KodePasal: &k, Tingkat: "kritis", Pesan: "denda belum ada"}}}}); err != nil {
		t.Fatal(err)
	}
	v1 := int64(1)
	if _, err := store.SendContract(ctx, usecase.SendContractParams{ContractID: c.ID, Scope: usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v1}}); !errors.Is(err, domain.ErrCriticalFindings) {
		t.Fatalf("harus ErrCriticalFindings, dapat %v", err)
	}
}
