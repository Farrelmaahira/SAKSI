package usecase_test

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func TestNormalizeClauses(t *testing.T) {
	refs := map[int64]bool{12: true}
	ok := []domain.Clause{
		{KodePasal: " P-02 ", Judul: "Nilai", Isi: " Rp 1 ", Urutan: 9, LegalReferenceID: 12},
		{KodePasal: "P-01", Judul: "Lingkup", Isi: "Jalan", Urutan: 3},
	}
	got, err := usecase.NormalizeClauses(ok, refs)
	if err != nil || got[0].KodePasal != "P-01" || got[0].Urutan != 1 || got[1].KodePasal != "P-02" || got[1].Urutan != 2 || got[1].Isi != "Rp 1" {
		t.Fatalf("normalisasi salah: %+v err=%v", got, err)
	}

	bad := map[string]domain.Clause{
		"kode kosong":       {Judul: "a", Isi: "b"},
		"judul dua baris":   {KodePasal: "P", Judul: "a\nb", Isi: "b"},
		"isi kosong":        {KodePasal: "P", Judul: "a", Isi: "  "},
		"dasar hukum asing": {KodePasal: "P", Judul: "a", Isi: "b", LegalReferenceID: 99},
	}
	for name, c := range bad {
		if _, err := usecase.NormalizeClauses([]domain.Clause{c}, refs); !errors.Is(err, domain.ErrInvalidInput) {
			t.Errorf("%s: mau ErrInvalidInput, dapat %v", name, err)
		}
	}
	dup := []domain.Clause{{KodePasal: "P", Judul: "a", Isi: "b"}, {KodePasal: "P", Judul: "c", Isi: "d"}}
	if _, err := usecase.NormalizeClauses(dup, refs); err == nil {
		t.Error("kodePasal ganda harus ditolak")
	}
	big := []domain.Clause{{KodePasal: "P", Judul: "a", Isi: strings.Repeat("x", usecase.MaxClauseIsiBytes+1)}}
	if _, err := usecase.NormalizeClauses(big, refs); err == nil {
		t.Error("isi > 200 KB harus ditolak")
	}
}

func TestComposeAndParseRoundTrip(t *testing.T) {
	clauses := []domain.Clause{
		{KodePasal: "P-01", Judul: "Ruang Lingkup", Isi: "Baris satu\nbaris dua", Urutan: 1},
		{KodePasal: "P-02", Judul: "Sanksi", Isi: "Denda 1/1000", Urutan: 2},
	}
	text := usecase.ComposeContractText(usecase.CreateContractDraftParams{Judul: "Jalan", Tenggat: time.Now()}, clauses)
	parsed := usecase.ClausesFromText(text)
	if len(parsed) != 2 || parsed[0].Judul != "Ruang Lingkup" || parsed[0].Isi != "Baris satu\nbaris dua" || parsed[1].Isi != "Denda 1/1000" {
		t.Fatalf("kepala/penutup SPK tidak boleh masuk pasal: %+v", parsed)
	}
	if titles := usecase.TitlesByUrutan(text); titles[2] != "Sanksi" {
		t.Fatalf("judul per urutan salah: %v", titles)
	}
	if one := usecase.ClausesFromText("teks bebas tanpa pasal"); len(one) != 1 || one[0].Isi != "teks bebas tanpa pasal" {
		t.Fatalf("teks tanpa pasal harus jadi satu pasal: %+v", one)
	}
}

func TestStatusLocked(t *testing.T) {
	for st, want := range map[domain.ContractStatus]bool{
		domain.StatusDraft: false, domain.StatusAudited: false, domain.StatusInReview: false,
		domain.StatusSigned: true, domain.StatusPublished: true, domain.StatusRunning: true, domain.StatusDone: true, domain.StatusCancelled: true,
	} {
		if st.Locked() != want {
			t.Errorf("%s.Locked() = %v", st, !want)
		}
	}
}

type countingAI struct {
	calls int
	fail  error
}

func (c *countingAI) AuditClauses(context.Context, usecase.AuditInput) (domain.AuditResult, error) {
	c.calls++
	if c.fail != nil {
		return domain.AuditResult{}, c.fail
	}
	return domain.AuditResult{Score: 70, Model: "groq:x"}, nil
}
func (c *countingAI) DraftContract(context.Context, usecase.DraftInput) (usecase.DraftOutput, error) {
	return usecase.DraftOutput{}, nil
}
func (c *countingAI) RedactText(context.Context, string) (usecase.RedactOutput, error) {
	return usecase.RedactOutput{}, nil
}

type mapCache map[string][]byte

func (m mapCache) Get(_ context.Context, k string) ([]byte, bool, error) {
	v, ok := m[k]
	return v, ok, nil
}
func (m mapCache) Set(_ context.Context, k string, v []byte, _ time.Duration) error {
	m[k] = v
	return nil
}
func (m mapCache) Del(_ context.Context, ks ...string) error {
	for _, k := range ks {
		delete(m, k)
	}
	return nil
}
func (m mapCache) DelPrefix(context.Context, string) error { return nil }

func TestAuditCacheHitMissAndContentKey(t *testing.T) {
	ctx := context.Background()
	ai, cache := &countingAI{}, mapCache{}
	in := usecase.AuditInput{Jenis: domain.JenisPengadaan, Clauses: []domain.Clause{{KodePasal: "P-01", Judul: "a", Isi: "b", Urutan: 1}}, MandatoryKodePasal: []string{"P-01"}}

	r1, err := usecase.AuditClauses(ctx, ai, cache, in)
	if err != nil || r1.Total != 1 || r1.Fulfilled != 1 {
		t.Fatalf("miss: %+v err=%v", r1, err)
	}
	r2, _ := usecase.AuditClauses(ctx, ai, cache, in)
	if ai.calls != 1 || r2.Score != r1.Score {
		t.Fatalf("hit: AI dipanggil %d kali", ai.calls)
	}
	in.Clauses[0].Isi = "berubah"
	if _, _ = usecase.AuditClauses(ctx, ai, cache, in); ai.calls != 2 {
		t.Fatal("isi berubah harus jadi kunci baru (miss)")
	}

	down := &countingAI{fail: &usecase.AIUnavailableError{Message: "penuh"}}
	empty := mapCache{}
	if _, err := usecase.AuditClauses(ctx, down, empty, in); !errors.Is(err, usecase.ErrAIUnavailable) || len(empty) != 0 {
		t.Fatalf("AI mati harus error dan tidak di-cache: err=%v cache=%d", err, len(empty))
	}
	if _, err := usecase.AuditClauses(ctx, nil, cache, in); !errors.Is(err, usecase.ErrAIUnavailable) {
		t.Fatal("tanpa AI harus ErrAIUnavailable, bukan skor rule engine")
	}
}
