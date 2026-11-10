package handlers_test

import (
	"context"
	"strings"
	"sync"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

// fakeAI menggantikan ai-engine; down=true mensimulasikan semua model gagal (UNAVAILABLE).
type fakeAI struct {
	down        bool
	redactFail  bool
	auditCalls  int
	draftCalls  int
	redactCalls int
}

func (f *fakeAI) AuditClauses(_ context.Context, in usecase.AuditInput) (domain.AuditResult, error) {
	f.auditCalls++
	if f.down {
		return domain.AuditResult{}, &usecase.AIUnavailableError{Message: "Layanan AI sedang penuh."}
	}
	k := "P-07"
	return domain.AuditResult{Score: 80, Model: "groq:test", Findings: []domain.AuditFinding{{KodePasal: &k, Tingkat: "kritis", Pesan: "denda belum jelas"}}}, nil
}

func (f *fakeAI) DraftContract(_ context.Context, in usecase.DraftInput) (usecase.DraftOutput, error) {
	f.draftCalls++
	if f.down {
		return usecase.DraftOutput{}, &usecase.AIUnavailableError{Message: "Layanan AI sedang penuh."}
	}
	return usecase.DraftOutput{Model: "groq:test", Clauses: []domain.Clause{
		{KodePasal: "P-01", Judul: "Ruang Lingkup", Isi: in.Jawaban["lingkup_pekerjaan"], Urutan: 1},
		{KodePasal: "P-07", Judul: "Sanksi", Isi: "Denda 1/1000 per hari.", Urutan: 2, LegalReferenceID: 999}, // id karangan
	}}, nil
}

func (f *fakeAI) RedactText(_ context.Context, text string) (usecase.RedactOutput, error) {
	f.redactCalls++
	if f.down || f.redactFail {
		return usecase.RedactOutput{}, &usecase.AIUnavailableError{Message: "Layanan AI sedang penuh."}
	}
	return usecase.RedactOutput{Text: strings.ReplaceAll(text, "3302140101010001", "[NIK]"), RedactedKinds: []string{"nik"}}, nil
}

// memCache adalah usecase.Cache di memori untuk tes hit/miss/invalidasi.
type memCache struct {
	mu   sync.Mutex
	data map[string][]byte
	ttl  map[string]time.Duration
}

func newMemCache() *memCache {
	return &memCache{data: map[string][]byte{}, ttl: map[string]time.Duration{}}
}

func (c *memCache) Get(_ context.Context, k string) ([]byte, bool, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	v, ok := c.data[k]
	return v, ok, nil
}

func (c *memCache) Set(_ context.Context, k string, v []byte, ttl time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[k], c.ttl[k] = v, ttl
	return nil
}

func (c *memCache) Del(_ context.Context, keys ...string) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	for _, k := range keys {
		delete(c.data, k)
	}
	return nil
}

func (c *memCache) DelPrefix(_ context.Context, p string) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	for k := range c.data {
		if strings.HasPrefix(k, p) {
			delete(c.data, k)
		}
	}
	return nil
}

func (c *memCache) has(k string) bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	_, ok := c.data[k]
	return ok
}

// draftingOpts adalah opsi drafting tetap untuk tes: satu dasar hukum (id 12) dan template pengadaan.
func draftingOpts() domain.DraftingOptions {
	return domain.DraftingOptions{
		Templates: []domain.ContractTemplate{{ID: 1, Jenis: domain.JenisPengadaan, Versi: 1, Clauses: []domain.LibraryClause{
			{Clause: domain.Clause{KodePasal: "P-07", Judul: "Sanksi", Isi: "Denda.", Urutan: 1}, Wajib: true},
		}}},
		LegalReferences: []domain.LegalReference{{ID: 12, Peraturan: "Perlem LKPP 12/2019", NomorPasal: "Pasal 1", Isi: "..."}},
	}
}
