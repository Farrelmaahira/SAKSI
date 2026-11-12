package postgres_test

import (
	"context"
	"errors"
	"os"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func TestStore_Termin_Workflow(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()

	c, err := store.CreateContractWithDetails(ctx, usecase.CreateContractParams{
		VillageID: 1, CounterpartyID: 1, Jenis: domain.JenisPengadaan, Judul: "Uji termin drainase",
		Nilai: 90000000, Tenggat: time.Now().Add(90 * 24 * time.Hour), SkemaPembayaran: "termin",
		IsiTeks: "Pasal 1: Lingkup\nDrainase.", CreatedBy: 1, IntegrityScore: 80, SHA256Hash: "uji",
	})
	if err != nil {
		t.Fatalf("CreateContractWithDetails failed: %v", err)
	}
	v1, v2 := int64(1), int64(2)
	kades := usecase.Scope{UserID: 1, Role: domain.RoleKades, VillageID: &v1}
	other := usecase.Scope{UserID: 1, Role: domain.RoleKades, VillageID: &v2}

	if _, err := store.GetContractTermin(ctx, c.ID, other); !errors.Is(err, domain.ErrForbidden) {
		t.Fatalf("desa lain harus ErrForbidden, dapat %v", err)
	}

	day := func(d int) time.Time { return time.Now().AddDate(0, 0, d).Truncate(24 * time.Hour) }
	res, err := store.SetPaymentTerms(ctx, usecase.SetTermsParams{ContractID: c.ID, Scope: kades,
		Terms: []usecase.TermInput{{Persen: 50, JatuhTempo: day(30)}, {Persen: 50, JatuhTempo: day(60)}}})
	if err != nil || len(res.Terms) != 2 || res.Terms[0].Nominal != 45000000 {
		t.Fatalf("SetPaymentTerms failed: %v %+v", err, res.Terms)
	}

	if _, _, err := store.ReportProgress(ctx, usecase.ReportProgressParams{ContractID: c.ID, Scope: kades, PersenSelesai: 10}); !errors.Is(err, domain.ErrInvalidState) {
		t.Fatalf("progres sebelum berjalan harus ErrInvalidState, dapat %v", err)
	}
	if err := store.SetContractStatus(ctx, c.ID, "berjalan"); err != nil {
		t.Fatal(err)
	}
	term := res.Terms[0].ID
	wp, _, err := store.ReportProgress(ctx, usecase.ReportProgressParams{ContractID: c.ID, Scope: kades, TermID: &term,
		PersenSelesai: 50, Catatan: "separuh", BuktiURL: []string{"https://cdn.desa.id/foto.jpg"}})
	if err != nil || len(wp.Bukti) != 1 {
		t.Fatalf("ReportProgress failed: %v %+v", err, wp)
	}

	paid, _, err := store.PayTerm(ctx, usecase.PayTermParams{ContractID: c.ID, TermID: term, Scope: kades})
	if err != nil || paid.Status != domain.TermDibayar {
		t.Fatalf("PayTerm failed: %v %+v", err, paid)
	}
	if _, _, err := store.PayTerm(ctx, usecase.PayTermParams{ContractID: c.ID, TermID: term, Scope: kades}); !errors.Is(err, domain.ErrAlreadyPaid) {
		t.Fatalf("bayar dua kali harus ErrAlreadyPaid, dapat %v", err)
	}
	if _, err := store.SetPaymentTerms(ctx, usecase.SetTermsParams{ContractID: c.ID, Scope: kades,
		Terms: []usecase.TermInput{{Persen: 100, JatuhTempo: day(30)}}}); !errors.Is(err, domain.ErrInvalidState) {
		t.Fatalf("ganti jadwal setelah bayar harus ErrInvalidState, dapat %v", err)
	}

	got, err := store.GetContractTermin(ctx, c.ID, kades)
	if err != nil || got.TotalDibayar != 45000000 || got.ProgresTerakhir != 50 || got.Terms[0].Status != domain.TermDibayar {
		t.Fatalf("GetContractTermin salah: %v %+v", err, got)
	}

	logs, err := store.ListAuditLogs(ctx, usecase.AuditLogFilter{Scope: kades, ContractID: &c.ID, Limit: 50})
	if err != nil || len(logs) < 3 {
		t.Fatalf("audit log termin/progres/bayar harus tercatat: %v (%d)", err, len(logs))
	}
	if other, err := store.ListAuditLogs(ctx, usecase.AuditLogFilter{Scope: usecase.Scope{UserID: 999999, Role: domain.RoleKades, VillageID: &v2}, ContractID: &c.ID, Limit: 50}); err != nil || len(other) != 0 {
		t.Fatalf("desa lain tidak boleh melihat log: %v (%d)", err, len(other))
	}

	if _, _, err := store.ListNotifications(ctx, 1, false, 10, 0); err != nil {
		t.Fatalf("ListNotifications failed: %v", err)
	}
	if res, err := store.VerifySeal(ctx, strings.Repeat("0", 64), nil); err != nil || res.Cocok {
		t.Fatalf("hash acak harus tidak cocok: %v %+v", err, res)
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable"
	}
	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		t.Fatalf("koneksi uji gagal: %v", err)
	}
	defer conn.Close(ctx)
	// Verifikasi tidak cocok (hash penuh dan awalan) harus tercatat; butuh scripts/migrate_seal_verifications.sql.
	for _, q := range []string{strings.Repeat("0", 64), strings.Repeat("0", 12)} {
		if res, err := store.VerifySeal(ctx, q, nil); err != nil || res.Cocok {
			t.Fatalf("awalan/hash tak dikenal harus tidak cocok: %v %+v", err, res)
		}
		var n int
		if err := conn.QueryRow(ctx, `SELECT COUNT(*) FROM seal_verifications WHERE seal_id IS NULL AND hasil = 'tidak_cocok' AND hash_dicari = $1`, q).Scan(&n); err != nil || n == 0 {
			t.Fatalf("verifikasi tidak cocok %q tidak tercatat: n=%d err=%v", q, n, err)
		}
	}
	if _, err := store.ListSeals(ctx, kades); err != nil {
		t.Fatalf("ListSeals failed: %v", err)
	}
	if _, err := store.ListTerminSummaries(ctx, kades); err != nil {
		t.Fatalf("ListTerminSummaries failed: %v", err)
	}
}

func newDraftContract(t *testing.T, store interface {
	CreateContractWithDetails(context.Context, usecase.CreateContractParams) (domain.ContractDetail, error)
}, judul string) domain.ContractDetail {
	t.Helper()
	c, err := store.CreateContractWithDetails(context.Background(), usecase.CreateContractParams{
		VillageID: 1, CounterpartyID: 1, Jenis: domain.JenisPengadaan, Judul: judul, Nilai: 12345000,
		Tenggat: time.Now().Add(30 * 24 * time.Hour), SkemaPembayaran: "termin",
		IsiTeks: "Pasal 1: Lingkup\nPekerjaan.", CreatedBy: 1, IntegrityScore: 80, SHA256Hash: "uji-batal",
	})
	if err != nil {
		t.Fatalf("CreateContractWithDetails failed: %v", err)
	}
	return c
}

// TestStore_CancelContract: soft-cancel kontrak draf, jejak (history, audit log, notifikasi) utuh, dan kunci setelahnya.
func TestStore_CancelContract(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		conn, err = pgx.Connect(ctx, "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable")
	}
	if err != nil {
		t.Fatalf("koneksi uji gagal: %v", err)
	}
	defer conn.Close(ctx)

	count := func(sql string, args ...any) int {
		var n int
		if err := conn.QueryRow(ctx, sql, args...).Scan(&n); err != nil {
			t.Fatalf("query hitung gagal: %v", err)
		}
		return n
	}
	statusOf := func(id int64) string {
		var st string
		if err := conn.QueryRow(ctx, `SELECT status::text FROM contracts WHERE id = $1`, id).Scan(&st); err != nil {
			t.Fatal(err)
		}
		return st
	}
	v1, v2 := int64(1), int64(2)
	kades := usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v1}
	otherVillage := usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v2}

	metricsBefore, err := store.GetDashboardMetrics(ctx, "1", domain.RoleKades)
	if err != nil {
		t.Fatal(err)
	}
	c := newDraftContract(t, store, "Uji pembatalan kontrak draf")
	if m, _ := store.GetDashboardMetrics(ctx, "1", domain.RoleKades); m.ActiveContractsCount != metricsBefore.ActiveContractsCount+1 {
		t.Fatalf("kontrak draf harus dihitung di metrik: %d -> %d", metricsBefore.ActiveContractsCount, m.ActiveContractsCount)
	}

	// Desa lain: ErrNotFound dan status tidak berubah.
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: c.ID, Scope: otherVillage}); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("desa lain harus ErrNotFound, dapat %v", err)
	}
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: 999999999, Scope: kades}); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("kontrak tidak ada harus ErrNotFound, dapat %v", err)
	}
	if st := statusOf(c.ID); st != "draf" {
		t.Fatalf("status tidak boleh berubah oleh percobaan gagal: %s", st)
	}

	vid, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: c.ID, Scope: kades, ActorIP: "10.0.0.9"})
	if err != nil || vid != 1 {
		t.Fatalf("CancelContract gagal: vid=%d err=%v", vid, err)
	}
	if st := statusOf(c.ID); st != "dibatalkan" {
		t.Fatalf("status harus dibatalkan, dapat %s", st)
	}
	if n := count(`SELECT COUNT(*) FROM contract_status_history WHERE contract_id = $1 AND status_dari::text = 'draf' AND status_ke::text = 'dibatalkan' AND aktor_user_id = 4`, c.ID); n != 1 {
		t.Fatalf("riwayat status draf->dibatalkan harus 1 baris, dapat %d", n)
	}
	if n := count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.cancel' AND jenis_objek = 'contract' AND id_objek = $1 AND aktor_user_id = 4 AND ip = '10.0.0.9'`, c.ID); n != 1 {
		t.Fatalf("audit log contract.cancel harus 1 baris dengan IP, dapat %d", n)
	}
	if n := count(`SELECT COUNT(*) FROM notifications WHERE user_id = 1 AND jenis = 'kontrak_dibatalkan' AND tautan = $1`, contractLinkFor(c.ID)); n != 1 {
		t.Fatalf("notifikasi ke pihak kedua/pembuat harus 1, dapat %d", n)
	}
	if m, _ := store.GetDashboardMetrics(ctx, "1", domain.RoleKades); m.ActiveContractsCount != metricsBefore.ActiveContractsCount || m.TotalRealizationBudget != metricsBefore.TotalRealizationBudget {
		t.Fatalf("kontrak dibatalkan tidak boleh dihitung di metrik: sebelum %+v sesudah %+v", metricsBefore, m)
	}
	if list, err := store.ListContracts(ctx, kades, ""); err != nil {
		t.Fatal(err)
	} else {
		found := false
		for _, x := range list {
			found = found || (x.ID == itoa(c.ID) && x.Status == domain.StatusCancelled)
		}
		if !found {
			t.Fatal("GET /contracts harus tetap menampilkan kontrak dengan status dibatalkan")
		}
	}

	// Idempoten: tanpa riwayat, audit log, atau notifikasi baru (jumlah notifikasi bergantung pada ada/tidaknya akun penyedia).
	notifBefore := count(`SELECT COUNT(*) FROM notifications WHERE jenis = 'kontrak_dibatalkan' AND tautan = $1`, contractLinkFor(c.ID))
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: c.ID, Scope: kades}); err != nil {
		t.Fatalf("pembatalan ulang harus idempoten, dapat %v", err)
	}
	if count(`SELECT COUNT(*) FROM contract_status_history WHERE contract_id = $1 AND status_ke::text = 'dibatalkan'`, c.ID) != 1 ||
		count(`SELECT COUNT(*) FROM audit_logs WHERE aksi = 'contract.cancel' AND id_objek = $1`, c.ID) != 1 ||
		count(`SELECT COUNT(*) FROM notifications WHERE jenis = 'kontrak_dibatalkan' AND tautan = $1`, contractLinkFor(c.ID)) != notifBefore {
		t.Fatal("pembatalan ulang tidak boleh menambah riwayat/audit log/notifikasi")
	}

	// Terkunci: revisi, audit, dan tanda tangan ditolak.
	if _, err := store.ReviseContract(ctx, usecase.ReviseContractParams{ContractID: c.ID, KadesUserID: 4, VillageID: 1,
		JawabanForm: map[string]any{"lingkup_pekerjaan": "x"}}); !errors.Is(err, domain.ErrContractNotEditable) {
		t.Errorf("revisi kontrak dibatalkan harus ErrContractNotEditable, dapat %v", err)
	}
	st, err := store.ContractDraftState(ctx, c.ID)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.SaveContractAudit(ctx, usecase.SaveAuditParams{ContractID: c.ID, VersionID: st.VersionID, ActorID: 4, Result: domain.AuditResult{Model: "uji"}}); !errors.Is(err, domain.ErrContractNotEditable) {
		t.Errorf("audit kontrak dibatalkan harus ErrContractNotEditable, dapat %v", err)
	}
	if _, _, err := store.SignContract(ctx, usecase.SignContractParams{ContractID: c.ID, UserID: 4, CallerRole: domain.RoleKades, VillageID: &v1}); !errors.Is(err, domain.ErrContractNotEditable) {
		t.Errorf("tanda tangan kontrak dibatalkan harus ErrContractNotEditable, dapat %v", err)
	}

	// Status tahap tanda tangan ke atas tidak bisa dibatalkan.
	for _, locked := range []string{"ditandatangani", "dipublikasikan", "berjalan", "selesai"} {
		x := newDraftContract(t, store, "Uji terkunci "+locked)
		if err := store.SetContractStatus(ctx, x.ID, locked); err != nil {
			t.Fatal(err)
		}
		if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: x.ID, Scope: kades}); !errors.Is(err, domain.ErrContractNotEditable) {
			t.Errorf("%s harus ErrContractNotEditable, dapat %v", locked, err)
		}
		if got := statusOf(x.ID); got != locked {
			t.Errorf("status %s tidak boleh berubah, dapat %s", locked, got)
		}
	}

	// Status ditinjau yang sudah ditandatangani satu pihak juga terkunci.
	y := newDraftContract(t, store, "Uji sudah ada tanda tangan")
	if err := store.SetContractStatus(ctx, y.ID, "ditinjau"); err != nil {
		t.Fatal(err)
	}
	if _, err := conn.Exec(ctx, `
		INSERT INTO signatures (version_id, party_id, signer_user_id)
		SELECT cv.id, cp.id, 4 FROM contract_versions cv JOIN contract_parties cp ON cp.contract_id = cv.contract_id AND cp.peran_pihak = 'pertama'
		WHERE cv.contract_id = $1 LIMIT 1`, y.ID); err != nil {
		t.Fatalf("siapkan tanda tangan gagal: %v", err)
	}
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: y.ID, Scope: kades}); !errors.Is(err, domain.ErrContractNotEditable) {
		t.Errorf("kontrak yang sudah ada tanda tangan harus ErrContractNotEditable, dapat %v", err)
	}
	if got := statusOf(y.ID); got != "ditinjau" {
		t.Errorf("status ditinjau tidak boleh berubah, dapat %s", got)
	}

	// diaudit dan ditinjau tanpa tanda tangan bisa dibatalkan.
	for _, ok := range []string{"diaudit", "ditinjau"} {
		z := newDraftContract(t, store, "Uji batal dari "+ok)
		if err := store.SetContractStatus(ctx, z.ID, ok); err != nil {
			t.Fatal(err)
		}
		if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: z.ID, Scope: kades}); err != nil {
			t.Errorf("%s harus bisa dibatalkan, dapat %v", ok, err)
		}
		if n := count(`SELECT COUNT(*) FROM contract_status_history WHERE contract_id = $1 AND status_dari::text = $2 AND status_ke::text = 'dibatalkan'`, z.ID, ok); n != 1 {
			t.Errorf("history %s->dibatalkan harus 1, dapat %d", ok, n)
		}
	}
}

func contractLinkFor(id int64) string { return "/dashboard/kontrak/" + itoa(id) }

func itoa(n int64) string { return strconv.FormatInt(n, 10) }

// Audit ulang menambah baris ai_audits; daftar kontrak harus tetap satu baris per kontrak dengan skor audit terbaru.
func TestStore_ListContracts_NoDuplicateAfterReaudit(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()

	c := newDraftContract(t, store, "Uji audit ulang tanpa duplikat")
	st, err := store.ContractDraftState(ctx, c.ID)
	if err != nil {
		t.Fatal(err)
	}
	for _, skor := range []float64{40, 85} {
		if _, err := store.SaveContractAudit(ctx, usecase.SaveAuditParams{ContractID: c.ID, VersionID: st.VersionID, ActorID: 4,
			Result: domain.AuditResult{Model: "uji", Score: skor}}); err != nil {
			t.Fatal(err)
		}
	}
	v1 := int64(1)
	list, err := store.ListContracts(ctx, usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v1}, "")
	if err != nil {
		t.Fatal(err)
	}
	n := 0
	for _, x := range list {
		if x.ID == itoa(c.ID) {
			n++
			if x.IntegrityScore != 85 {
				t.Errorf("daftar harus memakai audit terbaru (85), dapat %v", x.IntegrityScore)
			}
		}
	}
	if n != 1 {
		t.Fatalf("kontrak harus muncul sekali setelah 2 audit, muncul %d kali", n)
	}
	// Detail kontrak harus konsisten dengan daftar: audit terbaru, bukan baris join sembarang.
	one, err := store.ContractByID(ctx, itoa(c.ID), usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v1})
	if err != nil || one.IntegrityScore != 85 {
		t.Fatalf("ContractByID harus memakai audit terbaru (85): skor=%v err=%v", one.IntegrityScore, err)
	}
}

// Skor audit tidak boleh berubah (apalagi jadi 0) karena kontrak dibatalkan: semua jalur baca memakai audit terakhir.
func TestStore_CancelKeepsAuditScore(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()

	c, err := store.CreateContractWithDetails(ctx, usecase.CreateContractParams{
		VillageID: 1, CounterpartyID: 1, Jenis: domain.JenisPengadaan, Judul: "Uji skor setelah batal", Nilai: 12345000,
		Tenggat: time.Now().Add(30 * 24 * time.Hour), SkemaPembayaran: "termin",
		IsiTeks: "Pasal 1: Lingkup\nPekerjaan.", CreatedBy: 1, IntegrityScore: 85, AuditModel: "uji", SHA256Hash: "uji-skor",
	})
	if err != nil {
		t.Fatal(err)
	}
	v1 := int64(1)
	sc := usecase.Scope{UserID: 4, Role: domain.RoleKades, VillageID: &v1}
	scoreEverywhere := func(tahap string) {
		t.Helper()
		got := map[string]float64{}
		one, err := store.ContractByID(ctx, itoa(c.ID), sc)
		if err != nil {
			t.Fatal(err)
		}
		got["ContractByID"] = one.IntegrityScore
		det, err := store.GetContractDetail(ctx, c.ID)
		if err != nil {
			t.Fatal(err)
		}
		got["GetContractDetail"] = det.IntegrityScore
		list, err := store.ListContracts(ctx, sc, "")
		if err != nil {
			t.Fatal(err)
		}
		for _, x := range list {
			if x.ID == itoa(c.ID) {
				got["ListContracts"] = x.IntegrityScore
			}
		}
		_, la, err := store.LatestContractAudit(ctx, c.ID)
		if err != nil || la == nil {
			t.Fatalf("%s: LatestContractAudit: %v %v", tahap, la, err)
		}
		got["LatestContractAudit"] = la.Skor
		for jalur, skor := range got {
			if skor != 85 {
				t.Errorf("%s: %s skor %v, harus 85", tahap, jalur, skor)
			}
		}
	}
	scoreEverywhere("sebelum batal")
	if _, err := store.CancelContract(ctx, usecase.CancelContractParams{ContractID: c.ID, Scope: sc}); err != nil {
		t.Fatal(err)
	}
	scoreEverywhere("sesudah batal")
}
