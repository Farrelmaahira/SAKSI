package postgres_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// TestStore_Termin_Workflow: jadwal termin → progres → bayar, plus scope desa, notifikasi, jejak audit, dan segel.
// Butuh Postgres dengan skema SAKSI.sql dan seed desa 1 + user 1 + counterparty 1.
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
	if _, err := store.ListSeals(ctx, kades); err != nil {
		t.Fatalf("ListSeals failed: %v", err)
	}
	if _, err := store.ListTerminSummaries(ctx, kades); err != nil {
		t.Fatalf("ListTerminSummaries failed: %v", err)
	}
}
