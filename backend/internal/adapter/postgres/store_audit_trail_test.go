package postgres_test

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func testDBURL() string {
	if u := os.Getenv("DATABASE_URL"); u != "" {
		return u
	}
	return "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable"
}

// throwawayDB: true bila DATABASE_URL menunjuk database *_tmp / *_test (aman untuk menyisipkan baris uji dan membuat akun).
func throwawayDB() bool {
	url := testDBURL()
	name := url[strings.LastIndex(url, "/")+1:]
	if i := strings.Index(name, "?"); i >= 0 {
		name = name[:i]
	}
	return strings.HasSuffix(name, "_tmp") || strings.HasSuffix(name, "_test")
}

// TestStore_AuditTrail_EveryWriteAction: tiap aksi tulis meninggalkan baris audit_logs, dan aksi yang
// menyangkut pihak kedua mengirim notifikasi ke akun penyedia. Tidak membuat akun; memakai user 1-4 dan
// counterparty 1 yang sudah ada (counterparty 1 harus terikat akun penyedia, bila tidak tes dilewati).
func TestStore_AuditTrail_EveryWriteAction(t *testing.T) {
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

	count := func(sql string, args ...any) int {
		t.Helper()
		var n int
		if err := conn.QueryRow(ctx, sql, args...).Scan(&n); err != nil {
			t.Fatalf("query hitung gagal: %v", err)
		}
		return n
	}
	var vendor *int64
	if err := conn.QueryRow(ctx, `SELECT user_id FROM counterparties WHERE id = 1`).Scan(&vendor); err != nil || vendor == nil || *vendor == 1 {
		t.Skip("counterparty 1 belum terikat akun penyedia (selain user 1); tes notifikasi penyedia dilewati")
	}
	audited := func(aksi string, id int64) {
		t.Helper()
		if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = $1 AND jenis_objek = 'contract' AND id_objek = $2`, aksi, id); n != 1 {
			t.Errorf("audit_logs %q untuk kontrak %d: %d baris, harus 1", aksi, id, n)
		}
	}
	notified := func(jenis string, id int64) {
		t.Helper()
		if n := count(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND jenis = $2 AND tautan = $3`, *vendor, jenis, contractLinkFor(id)); n != 1 {
			t.Errorf("notifikasi %q ke penyedia untuk kontrak %d: %d baris, harus 1", jenis, id, n)
		}
	}
	// Draf/diaudit/dibatalkan tidak terlihat penyedia: tidak boleh ada notifikasi apa pun (judul bisa bocor).
	vendorSilent := func(id int64, tahap string) {
		t.Helper()
		if n := count(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND tautan = $2`, *vendor, contractLinkFor(id)); n != 0 {
			t.Errorf("%s: penyedia menerima %d notifikasi untuk kontrak yang belum terlihat olehnya", tahap, n)
		}
	}

	v1 := int64(1)
	kades := usecase.Scope{UserID: 1, Role: domain.RoleKades, VillageID: &v1}

	c := newDraftContract(t, store, "Uji jejak audit semua aksi")
	audited("contract.create", c.ID)
	vendorSilent(c.ID, "buat kontrak")

	if _, err := store.ReviseContract(ctx, usecase.ReviseContractParams{ContractID: c.ID, KadesUserID: 1, VillageID: 1,
		Clauses: []domain.Clause{{KodePasal: "P-01", Judul: "Lingkup", Isi: "Pekerjaan drainase.", Urutan: 1}}}); err != nil {
		t.Fatalf("ReviseContract: %v", err)
	}
	audited("contract.revise", c.ID)
	vendorSilent(c.ID, "revisi")

	if _, err := store.SetPaymentTerms(ctx, usecase.SetTermsParams{ContractID: c.ID, Scope: kades,
		Terms: []usecase.TermInput{{Persen: 50, JatuhTempo: time.Now().Add(30 * 24 * time.Hour)}, {Persen: 50, JatuhTempo: time.Now().Add(60 * 24 * time.Hour)}}}); err != nil {
		t.Fatalf("SetPaymentTerms: %v", err)
	}
	audited("contract.termin_set", c.ID)
	vendorSilent(c.ID, "atur termin saat draf")

	// Membentuk keadaan: kontrak yang sudah ditandatangani (alur tanda tangan diuji di tempat lain).
	if _, err := conn.Exec(ctx, `UPDATE contracts SET status = 'ditandatangani' WHERE id = $1`, c.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := store.SetSPK(ctx, usecase.SetSPKParams{ContractID: c.ID, Scope: kades,
		SPK: domain.SPK{Nomor: "SPK/UJI/001", Tanggal: time.Now()}}); err != nil {
		t.Fatalf("SetSPK: %v", err)
	}
	audited("contract.spk_set", c.ID)
	notified("spk_diterbitkan", c.ID)

	st, err := store.ContractDraftState(ctx, c.ID)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.PublishContract(ctx, usecase.PublishParams{ContractID: c.ID, VersionID: st.VersionID, ActorID: 1, IsiTersaring: "Pasal 1: Lingkup"}); err != nil {
		t.Fatalf("PublishContract: %v", err)
	}
	audited("contract.publish", c.ID)
	notified("kontrak_dipublikasikan", c.ID)
	if items, err := store.ListAuditLogs(ctx, usecase.AuditLogFilter{Scope: kades, ContractID: &c.ID, Aksi: "contract.publish", Limit: 50}); err != nil || len(items) != 1 || items[0].Aksi != "contract.publish" {
		t.Errorf("filter aksi harus mengembalikan tepat 1 log contract.publish: n=%d err=%v", len(items), err)
	}

	// Riwayat kontrak dibaca dari server lewat /lifecycle: urut waktu, dari status awal sampai publikasi, dengan nama aktor.
	lc, err := store.GetContractLifecycleDetail(ctx, c.ID, 1, domain.RoleKades, &v1)
	if err != nil {
		t.Fatalf("GetContractLifecycleDetail: %v", err)
	}
	if n := len(lc.StatusHistory); n < 2 || lc.StatusHistory[0].StatusDari != nil || lc.StatusHistory[n-1].StatusKe != "dipublikasikan" || lc.StatusHistory[n-1].AktorNama == "" {
		t.Errorf("statusHistory tidak lengkap: %+v", lc.StatusHistory)
	}

	// Notifikasi membawa judul (diturunkan dari jenis), termasuk untuk baris yang sudah ada.
	notifs, _, err := store.ListNotifications(ctx, *vendor, false, 50, 0)
	if err != nil || len(notifs) == 0 {
		t.Fatalf("ListNotifications penyedia: n=%d err=%v", len(notifs), err)
	}
	for _, n := range notifs {
		if n.Judul == "" {
			t.Errorf("notifikasi %q tanpa judul", n.Jenis)
		}
	}

	// Pembatalan: penyedia hanya diberi tahu bila kontrak sudah dikirim kepadanya (status ditinjau).
	draft := newDraftContract(t, store, "Uji batal draf tanpa notifikasi penyedia")
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: draft.ID, Scope: kades}); err != nil {
		t.Fatalf("CancelContract draf: %v", err)
	}
	vendorSilent(draft.ID, "batal saat draf")
	sent := newDraftContract(t, store, "Uji batal setelah dikirim")
	if _, err := conn.Exec(ctx, `UPDATE contracts SET status = 'ditinjau' WHERE id = $1`, sent.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: sent.ID, Scope: kades}); err != nil {
		t.Fatalf("CancelContract ditinjau: %v", err)
	}
	notified("kontrak_dibatalkan", sent.ID)

	// Laporan warga: audit ada, tetapi aktor kosong agar identitas pelapor tidak tampil di Jejak Audit desa.
	rep, err := store.CreateCitizenReport(ctx, domain.CitizenReport{ContractID: c.ID, PelaporUserID: 2, Kategori: "progres", Deskripsi: "Uji jejak audit laporan warga."}, nil)
	if err != nil {
		t.Fatalf("CreateCitizenReport: %v", err)
	}
	if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.report_create' AND id_objek = $1 AND aktor_user_id IS NULL AND sesudah::text LIKE '%' || $2 || '%'`, c.ID, rep.KodePelacakan); n != 1 {
		t.Errorf("audit laporan warga: %d baris tanpa aktor, harus 1", n)
	}
	if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.report_create' AND id_objek = $1 AND aktor_user_id = 2`, c.ID); n != 0 {
		t.Error("identitas pelapor bocor ke audit_logs")
	}
}

// TestStore_AuditTrail_Register: pendaftaran mencatat user.register. Membuat akun, jadi hanya jalan di
// database uji sementara (nama berakhiran _tmp atau _test), tidak pernah di database bersama.
func TestStore_AuditTrail_Register(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	if !throwawayDB() {
		t.Skip("tes ini membuat akun; hanya jalan di database *_tmp / *_test")
	}
	url := testDBURL()
	ctx := context.Background()
	vid := int64(1)
	u, err := store.CreateUserWithRole(ctx, usecase.RegisterUserParams{
		Nama: "Uji Daftar", Email: fmt.Sprintf("uji-daftar-%d@example.test", time.Now().UnixNano()), PasswordHash: "x",
		Role: domain.RoleWarga, VillageID: &vid, NoHP: "0800000000",
	})
	if err != nil {
		t.Fatalf("CreateUserWithRole: %v", err)
	}
	conn, err := pgx.Connect(ctx, url)
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close(ctx)
	var n int
	if err := conn.QueryRow(ctx, `SELECT COUNT(*) FROM audit_logs WHERE aksi = 'user.register' AND jenis_objek = 'user' AND id_objek = $1 AND aktor_user_id = $1`, u.ID).Scan(&n); err != nil || n != 1 {
		t.Fatalf("audit user.register: n=%d err=%v", n, err)
	}
}
