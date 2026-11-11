package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"saksi-backend/internal/domain"
)

// DefaultAIUnavailableMessage dipakai bila ai-engine tidak mengirim pesan sendiri.
const DefaultAIUnavailableMessage = "Layanan AI sedang penuh. Coba lagi beberapa menit lagi, atau lanjutkan menyunting pasal secara manual."

// AIUnavailableError: semua model di ai-engine gagal (UNAVAILABLE/DEADLINE_EXCEEDED). Tidak ada hasil pengganti dari rule engine.
type AIUnavailableError struct{ Message string }

func (e *AIUnavailableError) Error() string        { return "ai engine tidak tersedia: " + e.Message }
func (e *AIUnavailableError) Is(target error) bool { return target == ErrAIUnavailable }

// AIUnavailableMessage mengambil pesan untuk klien (pesan ai-engine, atau pesan baku).
func AIUnavailableMessage(err error) string {
	var e *AIUnavailableError
	if errors.As(err, &e) && strings.TrimSpace(e.Message) != "" {
		return e.Message
	}
	return DefaultAIUnavailableMessage
}

const (
	MaxClauses        = 100
	MaxClauseIsiBytes = 200 * 1024 // sama dengan batas ai-engine per request

	TTLAI            = 24 * time.Hour
	TTLPublicList    = 5 * time.Minute
	TTLPublicDetail  = 10 * time.Minute
	TTLOptions       = time.Hour
	TTLMetrics       = 60 * time.Second
	WindowLoginRL    = 15 * time.Minute
	WindowReportRL   = time.Hour
	LimitLoginPerIP  = 20
	LimitReportPerHr = 5
)

// ---- Kunci Redis (bagian 3 rencana). Data privat selalu memuat id yang sudah diotorisasi. ----

func KeyAudit(in AuditInput) string {
	clauses := sortedClauses(in.Clauses)
	b, _ := json.Marshal(struct {
		J string
		C []domain.Clause
		M []string
	}{string(in.Jenis), clauses, in.MandatoryKodePasal})
	return "saksi:ai:audit:" + HashText(string(b))
}

func KeyPublicContracts(villageID int64, page int) string {
	return fmt.Sprintf("saksi:public:contracts:%d:%d", villageID, page)
}
func KeyPublicContract(id int64) string { return fmt.Sprintf("saksi:public:contract:%d", id) }
func KeyOptions(regionID int64) string  { return fmt.Sprintf("saksi:options:%d", regionID) }
func KeyMetrics(userID int64) string    { return fmt.Sprintf("saksi:metrics:%d", userID) }
func KeyRLLogin(ip string) string       { return "saksi:rl:login:" + ip }
func KeyRLReport(userID int64) string   { return fmt.Sprintf("saksi:rl:report:%d", userID) }

// InvalidatePublic menghapus cache publik kontrak dan daftar desa itu (termasuk daftar lintas desa, village 0).
func InvalidatePublic(ctx context.Context, c Cache, contractID, villageID int64) {
	c = cacheOrNop(c)
	if err := c.Del(ctx, KeyPublicContract(contractID)); err != nil {
		slog.Warn("cache del gagal", "err", err)
	}
	for _, v := range []int64{villageID, 0} {
		if err := c.DelPrefix(ctx, fmt.Sprintf("saksi:public:contracts:%d:", v)); err != nil {
			slog.Warn("cache del prefix gagal", "err", err)
		}
	}
}

// NopCache dipakai saat REDIS_URL kosong: selalu miss, tulis diabaikan.
type NopCache struct{}

func (NopCache) Get(context.Context, string) ([]byte, bool, error)        { return nil, false, nil }
func (NopCache) Set(context.Context, string, []byte, time.Duration) error { return nil }
func (NopCache) Del(context.Context, ...string) error                     { return nil }
func (NopCache) DelPrefix(context.Context, string) error                  { return nil }

func cacheOrNop(c Cache) Cache {
	if c == nil {
		return NopCache{}
	}
	return c
}

// CacheGetJSON membaca kunci; error Redis dicatat dan dianggap miss (Redis mati ≠ API mati).
func CacheGetJSON(ctx context.Context, c Cache, key string, v any) bool {
	b, ok, err := cacheOrNop(c).Get(ctx, key)
	if err != nil {
		slog.Warn("cache get gagal, baca dari sumber", "key", key, "err", err)
		return false
	}
	if !ok {
		slog.Debug("cache miss", "key", key)
		return false
	}
	if err := json.Unmarshal(b, v); err != nil {
		slog.Warn("cache rusak, diabaikan", "key", key, "err", err)
		return false
	}
	slog.Debug("cache hit", "key", key)
	return true
}

func CacheSetJSON(ctx context.Context, c Cache, key string, v any, ttl time.Duration) {
	b, err := json.Marshal(v)
	if err == nil {
		err = cacheOrNop(c).Set(ctx, key, b, ttl)
	}
	if err != nil {
		slog.Warn("cache set gagal", "key", key, "err", err)
	}
}

// Allow menjalankan rate limit. Limiter nil hanya terjadi di tes; main selalu memasang limiter (Redis atau memori).
func Allow(ctx context.Context, l RateLimiter, key string, limit int, window time.Duration) bool {
	if l == nil {
		return true
	}
	ok, err := l.Allow(ctx, key, limit, window)
	if err != nil {
		slog.Warn("rate limiter error", "key", key, "err", err)
	}
	return ok
}

// ---- Pasal ----

// ClausesToText merender pasal ke naskah: "Pasal {urutan}: {judul}\n{isi}\n\n".
func ClausesToText(clauses []domain.Clause) string {
	var sb strings.Builder
	for _, c := range clauses {
		sb.WriteString(fmt.Sprintf("Pasal %d: %s\n%s\n\n", c.Urutan, c.Judul, c.Isi))
	}
	return sb.String()
}

var pasalHeading = regexp.MustCompile(`(?i)^pasal\s+(\d+)\s*[:.\-–]\s*(.*)$`)

// ClausesFromText mem-parsing naskah lama (tanpa baris contract_clauses) menjadi pasal.
// Kepala sebelum Pasal pertama dan penutup mulai "Demikian" tidak ikut.
func ClausesFromText(text string) []domain.Clause {
	var out []domain.Clause
	var body []string
	flush := func() {
		if len(out) > 0 {
			out[len(out)-1].Isi = strings.TrimSpace(strings.Join(body, "\n"))
		}
		body = nil
	}
	for _, line := range strings.Split(text, "\n") {
		t := strings.TrimSpace(line)
		if m := pasalHeading.FindStringSubmatch(t); m != nil {
			flush()
			n, _ := strconv.Atoi(m[1])
			out = append(out, domain.Clause{KodePasal: fmt.Sprintf("P-%02d", n), Judul: strings.TrimSpace(m[2]), Urutan: len(out) + 1})
			continue
		}
		if len(out) > 0 && strings.HasPrefix(t, "Demikian") {
			break
		}
		body = append(body, line)
	}
	flush()
	if len(out) == 0 && strings.TrimSpace(text) != "" {
		out = []domain.Clause{{KodePasal: "P-01", Judul: "Isi Kontrak", Isi: strings.TrimSpace(text), Urutan: 1}}
	}
	return out
}

// TitlesByUrutan mengambil judul pasal dari naskah versi (contract_clauses tidak punya kolom judul).
// shortcut: judul dibaca ulang dari baris "Pasal N: JUDUL" di naskah; baris isi yang kebetulan berformat sama bisa
// tertukar. Ganti dengan kolom contract_clauses.judul bila user menyetujui migrasi skema.
func TitlesByUrutan(text string) map[int]string {
	m := map[int]string{}
	for _, c := range ClausesFromText(text) {
		m[c.Urutan] = c.Judul
	}
	return m
}

func sortedClauses(in []domain.Clause) []domain.Clause {
	out := append([]domain.Clause(nil), in...)
	sort.SliceStable(out, func(i, j int) bool { return out[i].Urutan < out[j].Urutan })
	return out
}

// NormalizeClauses memvalidasi input pasal (trust boundary), mengurutkan menurut urutan, lalu menomori ulang 1..n.
// legalRefIDs: id legal_references yang sah; legalReferenceId lain ditolak (AI/FE tidak boleh mengarang dasar hukum).
func NormalizeClauses(in []domain.Clause, legalRefIDs map[int64]bool) ([]domain.Clause, error) {
	if len(in) > MaxClauses {
		return nil, fmt.Errorf("%w: maksimal %d pasal", domain.ErrInvalidInput, MaxClauses)
	}
	out := sortedClauses(in)
	seen := map[string]bool{}
	total := 0
	for i := range out {
		c := &out[i]
		c.KodePasal = strings.TrimSpace(c.KodePasal)
		c.Judul = strings.TrimSpace(c.Judul)
		c.Isi = strings.TrimSpace(c.Isi)
		c.Urutan = i + 1
		switch {
		case c.KodePasal == "" || utf8.RuneCountInString(c.KodePasal) > 50:
			return nil, fmt.Errorf("%w: kodePasal pasal ke-%d wajib diisi (maks. 50 karakter)", domain.ErrInvalidInput, i+1)
		case seen[c.KodePasal]:
			return nil, fmt.Errorf("%w: kodePasal %q ganda", domain.ErrInvalidInput, c.KodePasal)
		case c.Judul == "" || utf8.RuneCountInString(c.Judul) > 255 || strings.ContainsAny(c.Judul, "\r\n"):
			return nil, fmt.Errorf("%w: judul pasal %s wajib diisi, satu baris, maks. 255 karakter", domain.ErrInvalidInput, c.KodePasal)
		case c.Isi == "":
			return nil, fmt.Errorf("%w: isi pasal %s wajib diisi", domain.ErrInvalidInput, c.KodePasal)
		case c.LegalReferenceID < 0 || (c.LegalReferenceID > 0 && !legalRefIDs[c.LegalReferenceID]):
			return nil, fmt.Errorf("%w: legalReferenceId pasal %s tidak dikenal", domain.ErrInvalidInput, c.KodePasal)
		}
		seen[c.KodePasal] = true
		total += len(c.Isi)
	}
	if total > MaxClauseIsiBytes {
		return nil, fmt.Errorf("%w: total isi pasal melebihi 200 KB", domain.ErrInvalidInput)
	}
	return out, nil
}

func LegalRefIDs(refs []domain.LegalReference) map[int64]bool {
	m := make(map[int64]bool, len(refs))
	for _, r := range refs {
		m[r.ID] = true
	}
	return m
}

// TemplateOrRule: bila clause_library jenis ini belum di-seed, pasal baku rule engine menjadi template (semua wajib),
// sehingga draf AI, audit, dan editor manual memakai kode pasal yang sama.
func TemplateOrRule(t domain.ContractTemplate, p CreateContractDraftParams) domain.ContractTemplate {
	if len(t.Clauses) > 0 {
		return t
	}
	for _, c := range RuleDraftClauses(p) {
		t.Clauses = append(t.Clauses, domain.LibraryClause{Clause: c, Wajib: true})
	}
	return t
}

// MandatoryKodePasal: kode pasal wajib dari clause_library; bila template kosong, pakai daftar klausul wajib rule engine.
func MandatoryKodePasal(t domain.ContractTemplate) []string {
	var out []string
	for _, c := range t.Clauses {
		if c.Wajib {
			out = append(out, c.KodePasal)
		}
	}
	if len(out) == 0 {
		return MandatoryClauseNames()
	}
	return out
}

// JawabanStrings mengubah jawaban_form wizard ke map<string,string> untuk proto.
func JawabanStrings(m map[string]any) map[string]string {
	out := make(map[string]string, len(m))
	for k, v := range m {
		switch t := v.(type) {
		case nil:
		case string:
			out[k] = t
		default:
			b, _ := json.Marshal(t)
			out[k] = string(b)
		}
	}
	return out
}

// ---- Opsi drafting ----

func LoadDraftingOptions(ctx context.Context, s Store, c Cache, regionID int64) (domain.DraftingOptions, error) {
	key := KeyOptions(regionID)
	var o domain.DraftingOptions
	if CacheGetJSON(ctx, c, key, &o) {
		return o, nil
	}
	o, err := s.DraftingOptions(ctx, regionID)
	if err != nil {
		return o, err
	}
	CacheSetJSON(ctx, c, key, o, TTLOptions)
	return o, nil
}

// ---- AI dengan cache. Tidak ada fallback rule engine: gagal = error, dan error tidak di-cache. ----

func errNoAI() error { return &AIUnavailableError{Message: DefaultAIUnavailableMessage} }

// DraftClauses memanggil DraftContract. Tidak di-cache (keputusan PM 2026-11-10): jawaban wizard bisa memuat
// data pribadi (mis. rekening) yang belum diredaksi.
func DraftClauses(ctx context.Context, ai AIEngine, in DraftInput, tpl domain.ContractTemplate) (DraftOutput, error) {
	if ai == nil {
		return DraftOutput{}, errNoAI()
	}
	out, err := ai.DraftContract(ctx, in)
	if err != nil {
		return DraftOutput{}, err
	}
	if out.Clauses, err = sanitizeAIDraft(out, in, tpl); err != nil {
		return DraftOutput{}, err
	}
	return out, nil
}

// sanitizeAIDraft: dasar hukum di luar daftar yang dikirim dibuang, pasal wajib yang hilang dikembalikan, lalu divalidasi.
func sanitizeAIDraft(out DraftOutput, in DraftInput, tpl domain.ContractTemplate) ([]domain.Clause, error) {
	if out.Model == "" || len(out.Clauses) == 0 {
		return nil, errors.New("ai engine: draf kosong")
	}
	ids := LegalRefIDs(in.LegalReferences)
	clauses := sortedClauses(out.Clauses)
	have := map[string]bool{}
	for i := range clauses {
		if !ids[clauses[i].LegalReferenceID] {
			clauses[i].LegalReferenceID = 0
		}
		have[strings.TrimSpace(clauses[i].KodePasal)] = true
	}
	for _, lc := range tpl.Clauses {
		if lc.Wajib && !have[lc.KodePasal] {
			c := lc.Clause
			c.Urutan = len(clauses) + 1
			if !ids[c.LegalReferenceID] {
				c.LegalReferenceID = 0
			}
			clauses = append(clauses, c)
		}
	}
	return NormalizeClauses(clauses, ids)
}

// AuditClauses memanggil AuditContract (cache 24 jam berbasis isi).
func AuditClauses(ctx context.Context, ai AIEngine, c Cache, in AuditInput) (domain.AuditResult, error) {
	if ai == nil {
		return domain.AuditResult{}, errNoAI()
	}
	key := KeyAudit(in)
	var res domain.AuditResult
	if CacheGetJSON(ctx, c, key, &res) {
		return res, nil
	}
	res, err := ai.AuditClauses(ctx, in)
	if err != nil {
		return domain.AuditResult{}, err
	}
	if res.Model == "" || res.Score < 0 || res.Score > 100 {
		return domain.AuditResult{}, errors.New("ai engine: respons audit tidak valid")
	}
	res = completeAIAudit(res, in)
	CacheSetJSON(ctx, c, key, res, TTLAI)
	return res, nil
}

func completeAIAudit(r domain.AuditResult, in AuditInput) domain.AuditResult {
	if r.Findings == nil {
		r.Findings = []domain.AuditFinding{}
	}
	mandatory := map[string]bool{}
	for _, k := range in.MandatoryKodePasal {
		mandatory[k] = true
	}
	missing := map[string]bool{}
	kritis, saran := 0, 0
	for _, f := range r.Findings {
		if f.Tingkat == "kritis" {
			kritis++
			if f.KodePasal != nil && mandatory[*f.KodePasal] {
				missing[*f.KodePasal] = true
			}
		} else {
			saran++
		}
	}
	if r.Total == 0 { // gRPC tidak mengirim total; REST lama mengirimnya sendiri
		r.Total = len(in.MandatoryKodePasal)
		r.Fulfilled = r.Total - len(missing)
	}
	if r.Summary == "" {
		r.Summary = fmt.Sprintf("Audit AI (%s): skor %.1f, %d temuan kritis, %d saran.", r.Model, r.Score, kritis, saran)
	}
	return r
}

// AuditText mengaudit naskah bebas (mis. POST /contracts/audit) dengan memecahnya menjadi pasal.
func AuditText(ctx context.Context, ai AIEngine, c Cache, jenis domain.ContractJenis, text string) (domain.AuditResult, error) {
	return AuditClauses(ctx, ai, c, AuditInput{Jenis: jenis, Clauses: ClausesFromText(text), MandatoryKodePasal: MandatoryClauseNames()})
}

// RedactForPublication wajib berhasil; tidak ada fallback supaya teks mentah tidak pernah dipublikasikan.
func RedactForPublication(ctx context.Context, ai AIEngine, text string) (RedactOutput, error) {
	if ai == nil {
		return RedactOutput{}, errNoAI()
	}
	out, err := ai.RedactText(ctx, text)
	if err != nil {
		return RedactOutput{}, err
	}
	if strings.TrimSpace(out.Text) == "" && strings.TrimSpace(text) != "" {
		return RedactOutput{}, errors.New("ai engine: hasil redaksi kosong")
	}
	return out, nil
}
