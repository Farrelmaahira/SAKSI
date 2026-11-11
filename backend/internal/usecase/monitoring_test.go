package usecase

import (
	"errors"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/domain"
)

func day(s string) time.Time { t, _ := time.Parse("2006-01-02", s); return t }

func TestBuildTermSchedule(t *testing.T) {
	terms, err := BuildTermSchedule(100000, []TermInput{{33.33, day("2026-12-01")}, {33.33, day("2027-01-01")}, {33.34, day("2027-02-01")}})
	if err != nil {
		t.Fatal(err)
	}
	var sum float64
	for _, x := range terms {
		sum += x.Nominal
		if x.Status != domain.TermRencana {
			t.Fatalf("status awal harus rencana, dapat %s", x.Status)
		}
	}
	if sum != 100000 || terms[0].Nominal != 33330 || terms[2].Nominal != 33340 || terms[2].Urutan != 3 {
		t.Fatalf("nominal tidak sesuai: %+v", terms)
	}

	bad := []struct {
		name string
		in   []TermInput
	}{
		{"kosong", nil},
		{"total bukan 100", []TermInput{{50, day("2026-12-01")}}},
		{"persen nol", []TermInput{{0, day("2026-12-01")}, {100, day("2026-12-02")}}},
		{"tanggal mundur", []TermInput{{50, day("2027-01-01")}, {50, day("2026-12-01")}}},
		{"tanpa tanggal", []TermInput{{100, time.Time{}}}},
	}
	for _, c := range bad {
		if _, err := BuildTermSchedule(1000, c.in); !errors.Is(err, domain.ErrInvalidInput) {
			t.Errorf("%s: harus ErrInvalidInput, dapat %v", c.name, err)
		}
	}
}

func TestTermStateTransitions(t *testing.T) {
	cases := []struct {
		name string
		err  error
		want error
	}{
		{"set termin draf", CanSetTerms(domain.StatusDraft, true, false), nil},
		{"set termin setelah tanda tangan, belum ada jadwal", CanSetTerms(domain.StatusSigned, false, false), nil},
		{"ganti jadwal setelah tanda tangan", CanSetTerms(domain.StatusRunning, true, false), domain.ErrInvalidState},
		{"ganti jadwal setelah ada bayar", CanSetTerms(domain.StatusDraft, true, true), domain.ErrInvalidState},
		{"set termin kontrak selesai", CanSetTerms(domain.StatusDone, false, false), domain.ErrInvalidState},
		{"spk sebelum tanda tangan", CanSetSPK(domain.StatusDraft), domain.ErrInvalidState},
		{"spk setelah publikasi", CanSetSPK(domain.StatusPublished), nil},
		{"bayar saat berjalan", CanPayTerm(domain.StatusRunning, domain.TermJatuhTempo), nil},
		{"bayar saat selesai", CanPayTerm(domain.StatusDone, domain.TermRencana), nil},
		{"bayar sebelum SPK", CanPayTerm(domain.StatusPublished, domain.TermRencana), domain.ErrInvalidState},
		{"bayar dua kali", CanPayTerm(domain.StatusRunning, domain.TermDibayar), domain.ErrAlreadyPaid},
		{"progres saat berjalan", CanReportProgress(domain.StatusRunning, nil), nil},
		{"progres sebelum berjalan", CanReportProgress(domain.StatusPublished, nil), domain.ErrInvalidState},
	}
	for _, c := range cases {
		if (c.want == nil && c.err != nil) || (c.want != nil && !errors.Is(c.err, c.want)) {
			t.Errorf("%s: want %v, got %v", c.name, c.want, c.err)
		}
	}
	paid := domain.TermDibayar
	if err := CanReportProgress(domain.StatusRunning, &paid); !errors.Is(err, domain.ErrInvalidState) {
		t.Errorf("progres ke termin dibayar harus ditolak, dapat %v", err)
	}

	if StatusAfterSPK(domain.StatusPublished) != domain.StatusRunning || StatusAfterSPK(domain.StatusSigned) != domain.StatusSigned {
		t.Error("StatusAfterSPK salah")
	}
	if StatusAfterProgress(domain.StatusRunning, 100) != domain.StatusDone || StatusAfterProgress(domain.StatusRunning, 99) != domain.StatusRunning {
		t.Error("StatusAfterProgress salah")
	}
	if TermStatusAfterProgress(domain.TermRencana) != domain.TermJatuhTempo || TermStatusAfterProgress(domain.TermDibayar) != domain.TermDibayar {
		t.Error("TermStatusAfterProgress salah")
	}
}

func TestNormalizeSealHash(t *testing.T) {
	h := strings.Repeat("Ab", 32)
	got, err := NormalizeSealHash("  " + h + " ")
	if err != nil || got != strings.ToLower(h) {
		t.Fatalf("hash valid ditolak: %q %v", got, err)
	}
	for _, bad := range []string{"", "abc", strings.Repeat("z", 64), strings.Repeat("a", 65)} {
		if _, err := NormalizeSealHash(bad); err == nil {
			t.Errorf("hash %q harus ditolak", bad)
		}
	}
}

func TestResetToken(t *testing.T) {
	a, ha, err := NewResetToken()
	if err != nil {
		t.Fatal(err)
	}
	b, _, _ := NewResetToken()
	if a == b || len(ha) != 64 || HashResetToken(a) != ha || strings.Contains(ha, a) {
		t.Fatal("token reset harus acak dan hanya hash yang disimpan")
	}
}

func TestNextReportStatus(t *testing.T) {
	ok := []struct {
		cur      domain.ReportStatus
		act, req string
		want     domain.ReportStatus
	}{
		{domain.ReportStatusDiterima, "klarifikasi", "", domain.ReportStatusDiverifikasi},
		{domain.ReportStatusDiverifikasi, "klarifikasi", "ditindaklanjuti", domain.ReportStatusDitindaklanjuti},
		{domain.ReportStatusDiterima, "klarifikasi", "ditolak", domain.ReportStatusDitolak},
		{domain.ReportStatusDitindaklanjuti, "klarifikasi", "", domain.ReportStatusDitindaklanjuti},
		{domain.ReportStatusDiverifikasi, "eskalasi", "", domain.ReportStatusDiteruskan},
		{domain.ReportStatusDiteruskan, "klarifikasi", "ditindaklanjuti", domain.ReportStatusDitindaklanjuti},
		{domain.ReportStatusDiteruskan, "selesai", "", domain.ReportStatusSelesai},
	}
	for _, c := range ok {
		got, err := NextReportStatus(c.cur, c.act, c.req)
		if err != nil || got != c.want {
			t.Errorf("%s+%s(%s): want %s, got %s %v", c.cur, c.act, c.req, c.want, got, err)
		}
	}
	bad := []struct {
		cur      domain.ReportStatus
		act, req string
		want     error
	}{
		{domain.ReportStatusSelesai, "klarifikasi", "", domain.ErrInvalidState},
		{domain.ReportStatusDitolak, "selesai", "", domain.ErrInvalidState},
		{domain.ReportStatusDiteruskan, "eskalasi", "", domain.ErrInvalidState},
		{domain.ReportStatusDiterima, "klarifikasi", "ditindaklanjuti", domain.ErrInvalidState},
		{domain.ReportStatusDiterima, "hapus", "", domain.ErrInvalidInput},
	}
	for _, c := range bad {
		if _, err := NextReportStatus(c.cur, c.act, c.req); !errors.Is(err, c.want) {
			t.Errorf("%s+%s(%s): want %v, got %v", c.cur, c.act, c.req, c.want, err)
		}
	}
}

func TestCanCancel(t *testing.T) {
	for _, st := range []domain.ContractStatus{domain.StatusDraft, domain.StatusAudited, domain.StatusInReview} {
		if already, err := CanCancel(st); already || err != nil {
			t.Errorf("%s harus bisa dibatalkan, dapat already=%v err=%v", st, already, err)
		}
	}
	for _, st := range []domain.ContractStatus{domain.StatusSigned, domain.StatusPublished, domain.StatusRunning, domain.StatusDone} {
		if _, err := CanCancel(st); !errors.Is(err, domain.ErrContractNotEditable) {
			t.Errorf("%s harus terkunci, dapat %v", st, err)
		}
	}
	if already, err := CanCancel(domain.StatusCancelled); !already || err != nil {
		t.Errorf("dibatalkan harus idempoten, dapat already=%v err=%v", already, err)
	}
}

func TestNormalizeSealQuery(t *testing.T) {
	for _, ok := range []string{strings.Repeat("a", 12), strings.Repeat("Ab", 32), "  " + strings.Repeat("0", 20) + " "} {
		if _, err := NormalizeSealQuery(ok); err != nil {
			t.Errorf("%q harus diterima: %v", ok, err)
		}
	}
	for _, bad := range []string{"", "abc", strings.Repeat("a", 11), strings.Repeat("a", 65), strings.Repeat("g", 12)} {
		if _, err := NormalizeSealQuery(bad); err == nil {
			t.Errorf("%q harus ditolak", bad)
		}
	}
}

func TestCanSend(t *testing.T) {
	for st, want := range map[domain.ContractStatus]error{
		domain.StatusDraft:     nil,
		domain.StatusAudited:   nil,
		domain.StatusInReview:  domain.ErrInvalidState,
		domain.StatusSigned:    domain.ErrContractNotEditable,
		domain.StatusPublished: domain.ErrContractNotEditable,
		domain.StatusRunning:   domain.ErrContractNotEditable,
		domain.StatusDone:      domain.ErrContractNotEditable,
		domain.StatusCancelled: domain.ErrContractNotEditable,
	} {
		if err := CanSend(st); !errors.Is(err, want) || (want == nil && err != nil) {
			t.Errorf("CanSend(%s) = %v, mau %v", st, err, want)
		}
	}
}
