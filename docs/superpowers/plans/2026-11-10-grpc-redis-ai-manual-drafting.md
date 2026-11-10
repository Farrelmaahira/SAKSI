# gRPC, Redis Cache, dan Drafting AI + Manual — Rencana Lintas Tim

> Dokumen ini satu-satunya sumber kebenaran untuk session BE, FE, dan ML. Kontrak di bagian 2 dan 3 tidak boleh diubah sepihak; usulkan perubahan lewat PM (session `saksi-6a`).

**Tujuan:** Kepala desa bisa membuat kontrak dari wizard AI (Groq lalu Gemini) **atau** menulis/menyunting pasal secara manual, dengan audit AI yang tetap jalan di kedua jalur. Komunikasi backend ↔ ai-engine pindah ke gRPC, dan backend memakai Redis untuk cache dan rate limit.

**Di luar cakupan:** gRPC dari browser (frontend tetap REST/JSON ke backend), integrasi PSrE/e-meterai resmi, lapor.go.id, perubahan skema tabel (DBML yang ada sudah mencukupi).

---

## 1. Keputusan arsitektur

| Jalur | Protokol | Alasan |
|---|---|---|
| Browser (Next.js) → Backend Go | REST/JSON `/api/v1` (tetap) | Browser tidak bisa gRPC murni tanpa gRPC-web/proxy; frontend sudah jadi di atas REST. |
| Backend Go → ai-engine Python | **gRPC** (`saksi.ai.v1.AiEngine`) | Kontrak bertipe, deadline, dan kode error standar antar layanan internal. |
| Backend → Redis | `REDIS_URL` | Cache-aside dan rate limit. Kosong = cache mati (no-op), aplikasi tetap jalan. |

Aturan bersama:
- **AI hanya penasihat.** Hasil AI selalu bisa disunting manusia sebelum ditandatangani. Setelah status `ditandatangani`, versi terkunci (segel SHA-256).
- **Rantai fallback AI, lalu pesan (keputusan user 2026-11-10):** ai-engine mencoba model satu per satu sesuai `AI_PROVIDERS`. Kalau satu kena limit (429), overload (503), timeout, atau outputnya tidak valid, langsung pindah ke model berikutnya. Kalau semua gagal, ai-engine mengembalikan `UNAVAILABLE`, backend membalas HTTP 503 `AI_UNAVAILABLE`, dan frontend menampilkan pesan. Tidak ada hasil pengganti diam-diam dari rule engine. Jalur manual tetap bisa dipakai karena tidak butuh AI.
- **Tidak boleh mengarang pasal hukum:** AI hanya boleh merujuk `legal_references` yang dikirim backend di request.
- `contract_versions.sumber` = `ai` untuk versi dari `DraftContract`, `manual` untuk versi yang disunting/ditulis manusia.
- `ai_audits.model` diisi nama model sebenarnya, mis. `groq:qwen/qwen3.8-27b` (default sejak 2026-11-10; `llama-3.3-70b-versatile` sudah dihapus Groq) (catatan DBML "gemini / grok" itu salah ketik: providernya **Groq**).

---

## 2. Kontrak gRPC — `proto/saksi/ai/v1/ai.proto`

Pemilik file: **ML**. BE membangkitkan kodenya sendiri dari file yang sama.

```proto
syntax = "proto3";

package saksi.ai.v1;

option go_package = "saksi-backend/gen/saksi/ai/v1;aiv1";

// Health memakai grpc.health.v1.Health standar (service name "saksi.ai.v1.AiEngine").
service AiEngine {
  // Menyusun pasal dari jawaban wizard. Hasilnya draf, bukan versi final.
  rpc DraftContract(DraftContractRequest) returns (DraftContractResponse);
  // Mengaudit kelengkapan pasal (berlaku untuk versi AI maupun manual).
  rpc AuditContract(AuditContractRequest) returns (AuditContractResponse);
  // Menyaring data pribadi sebelum publikasi.
  rpc RedactText(RedactTextRequest) returns (RedactTextResponse);
}

enum ContractType {
  CONTRACT_TYPE_UNSPECIFIED = 0;
  PENGADAAN = 1;
  HIBAH = 2;
  KERJA_SAMA_BUMDES = 3;
  SEWA_ASET = 4;
  UMKM = 5;
}

enum Severity {
  SEVERITY_UNSPECIFIED = 0;
  KRITIS = 1;
  SARAN = 2;
}

message LegalReference {
  int64 id = 1;            // legal_references.id
  string peraturan = 2;
  string nomor_pasal = 3;
  string isi = 4;
}

message Clause {
  string kode_pasal = 1;
  string judul = 2;
  string isi = 3;
  int32 urutan = 4;
  int64 legal_reference_id = 5;  // 0 = tanpa dasar hukum
}

message DraftContractRequest {
  ContractType jenis = 1;
  map<string, string> jawaban = 2;          // jawaban_form wizard
  repeated Clause clause_library = 3;       // template + pasal wajib dari clause_library
  repeated LegalReference legal_references = 4;
}

message DraftContractResponse {
  repeated Clause clauses = 1;
  string model = 2;                          // "groq:<model>" / "gemini:<model>"
}

message AuditContractRequest {
  ContractType jenis = 1;
  repeated Clause clauses = 2;
  repeated string mandatory_kode_pasal = 3;  // clause_library.wajib = true
  repeated LegalReference legal_references = 4;
}

message Finding {
  string kode_pasal = 1;   // kosong = temuan umum
  Severity tingkat = 2;
  string pesan = 3;
}

message AuditContractResponse {
  repeated Finding findings = 1;
  double skor = 2;         // 0..100
  string model = 3;
}

message RedactTextRequest {
  string text = 1;
}

message RedactTextResponse {
  string text = 1;
  repeated string redacted_kinds = 2;  // mis. "nik", "no_hp", "email", "alamat"
}
```

Konvensi panggilan:
- Autentikasi: metadata `x-api-key` = `AI_API_KEY` (sama dengan sekarang). Salah/kosong → `UNAUTHENTICATED`.
- Deadline dari backend: 13 detik untuk Draft/Audit, 5 detik untuk Redact.
- Kode error: input tidak valid → `INVALID_ARGUMENT`; semua model di rantai gagal → `UNAVAILABLE` dengan pesan `Layanan AI sedang penuh. Coba lagi beberapa menit lagi, atau lanjutkan menyunting pasal secara manual.`; jangan pernah mengembalikan `OK` dengan hasil karangan.
- Batas ukuran: total `isi` pasal ≤ 200 KB per request; lebih dari itu `INVALID_ARGUMENT`.
- Port: gRPC `:50051` (env `GRPC_PORT`). Endpoint REST `/v1/audit` lama **tetap hidup** sampai DevOps memastikan gRPC jalan di Azure App Service (lihat bagian 6).

---

## 3. Desain Redis (milik BE)

Pola: cache-aside, TTL selalu ada, invalidasi saat tulis. Redis mati = langsung baca DB (log warning), kecuali rate limit yang fail-open.

| Kunci | Isi | TTL | Diinvalidasi saat |
|---|---|---|---|
| `saksi:ai:audit:{sha256(jenis+pasal kanonik)}` | `AuditContractResponse` | 24 jam | tidak perlu (kunci berbasis isi) |
| `saksi:ai:draft:{sha256(jenis+jawaban kanonik+versi template)}` | `DraftContractResponse` | 24 jam | tidak perlu (kunci berbasis isi) |
| `saksi:public:contracts:{village_id}:{page}` | daftar kontrak publik | 5 menit | publikasi/progres baru di desa itu |
| `saksi:public:contract:{id}` | detail kontrak publik (sudah diredaksi) | 10 menit | publikasi, progres, termin kontrak itu |
| `saksi:options:{region_id}` | opsi wizard, template, clause_library | 1 jam | template/region_rules berubah |
| `saksi:metrics:{user_id}` | metrik dashboard | 60 detik | — (TTL pendek saja) |
| `saksi:rl:login:{ip}` | counter | 15 menit | — |
| `saksi:rl:report:{user_id}` | counter laporan warga (anti-spam, ancaman SWOT #2) | 1 jam | — |

Aturan:
- Jangan pernah meng-cache data milik satu user ke kunci yang bisa dibaca user lain (anti-IDOR). Data privat wajib memuat `user_id` atau `village_id` yang sudah diotorisasi di kuncinya.
- Jangan cache apa pun yang memuat data pribadi sebelum diredaksi.
- Respons gagal (`UNAVAILABLE`) **tidak** di-cache, supaya permintaan berikutnya mencoba AI lagi.

---

## 4. Tugas per tim

### ML (`ai-engine/`)
1. Tulis `proto/saksi/ai/v1/ai.proto` persis seperti bagian 2.
2. Server gRPC (`grpcio`, `grpcio-health-checking`) di port `GRPC_PORT`, berjalan berdampingan dengan FastAPI yang sudah ada. Kode hasil generate di `ai-engine/app/gen/` (via `grpcio-tools`), plus skrip generate.
3. `AuditContract`: pakai ulang logika `audit.py`, keluarkan `Finding` dengan `tingkat` dan `skor`.
   - Rantai fallback: entri `AI_PROVIDERS` boleh berbentuk `provider:model` (pisah di titik dua pertama). Entri tanpa model memakai `GROQ_MODEL`/`GEMINI_MODEL`. Default `gemini:gemini-3-flash-preview,groq:qwen/qwen3.8-27b,groq:openai/gpt-oss-120b,gemini:gemini-3.5-flash` (urutan dari benchmark PM 2026-11-10: kualitas temuan, lalu kecepatan).
   - Setiap percobaan dibatasi sisa deadline. 429/503/timeout/output tidak valid → langsung model berikutnya. Log setiap kegagalan dengan nama model dan kode HTTP, tanpa isi kontrak.
4. `DraftContract` (baru): susun pasal dari `jawaban` + `clause_library`; pasal wajib tidak boleh hilang; `legal_reference_id` hanya dari id yang dikirim.
5. `RedactText` (baru): regex dulu (NIK 16 digit, no HP, email, NPWP), LLM opsional di atasnya; jika LLM gagal, hasil regex tetap dikembalikan.
6. Validasi output LLM (JSON schema); output tak valid dihitung sebagai provider gagal.
7. Tes: golden set kecil per jenis kontrak (pasal wajib terdeteksi hilang), tes `UNAVAILABLE` saat semua provider mati, tes auth metadata.

### BE (`backend/`)
1. Generate klien Go dari `proto/` ke `backend/gen/saksi/ai/v1` (protoc-gen-go + protoc-gen-go-grpc), tambahkan skrip generate.
2. Ganti `internal/adapter/aiengine/client.go` dengan klien gRPC yang memenuhi interface yang sama dan dipakai usecase. Konfigurasi `AI_ENGINE_GRPC_ADDR`; TLS bila alamat `https`/port 443. Saat `UNAVAILABLE`/`DEADLINE_EXCEEDED`, balas HTTP 503 `{"error":{"code":"AI_UNAVAILABLE","message":<pesan dari ai-engine>}}` (memakai `WriteError` yang ada). Jangan ganti dengan hasil rule engine.
3. Redis (`github.com/redis/go-redis/v9`) sesuai bagian 3, lewat port/interface di usecase, dengan implementasi no-op saat `REDIS_URL` kosong.
4. Endpoint drafting:
   - `POST /api/v1/contracts/wizard/preview` → memanggil `DraftContract` (503 `AI_UNAVAILABLE` bila semua model gagal).
   - `POST /api/v1/contracts` menerima `sumber: "ai" | "manual"` dan `clauses[]`; jalur manual boleh mulai dari template kosong.
   - `PUT /api/v1/contracts/{id}` membuat versi baru `sumber='manual'` dengan pasal yang bisa ditambah, dihapus, diurutkan ulang; ditolak (409) bila status ≥ `ditandatangani`.
   - `POST /api/v1/contracts/{id}/audit` mengaudit versi terakhir (AI atau manual), menyimpan `ai_audits` + `ai_audit_findings`.
   - Publikasi memanggil `RedactText` sebelum mengisi `publications.isi_tersaring`; gagal redaksi = publikasi ditolak (jangan publikasi teks mentah).
5. Catat perubahan di `audit_logs` dan `contract_status_history`.
6. Perbarui `docs/saksi-api.postman_collection.json` (aturan AGENTS.md).
7. Tes: klien gRPC dengan server palsu (bufconn), cache hit/miss/invalidasi, penolakan edit setelah ditandatangani, rate limit laporan.

### FE (`frontend/`)
Frontend sudah ada; tugasnya integrasi dan jalur manual, **tanpa mengubah desain yang disetujui**.
1. Di halaman buat kontrak, pilihan mode: **Bantu dengan AI** (wizard sekarang) atau **Tulis manual** (mulai dari template pasal wajib jenis kontrak).
2. Editor pasal (`DrafVersiTab` dan kawan-kawan): tambah pasal, hapus, ubah urutan, sunting judul/isi, pilih dasar hukum dari daftar backend. Editor terkunci saat status ≥ `ditandatangani`.
3. Lencana sumber per versi (`AI` / `Manual`) dan tombol **Audit ulang** setelah suntingan manual; tampilkan temuan `kritis`/`saran`, skor, dan model. Saat backend membalas 503 `AI_UNAVAILABLE`, tampilkan pesannya di `FormAlert` beserta tombol "Coba lagi", dan biarkan editor manual tetap bisa dipakai.
4. Semua panggilan lewat `frontend/src/lib/api/*`; hapus fallback palsu yang mengembalikan skor statis di `audit-clause.ts` (ganti dengan state error yang jujur).
5. Atomic design: pakai ulang atom/molekul yang ada (`Btn`, `Badge`, `StatusBadge`, `Panel`, `ConfirmDialog`, `FormAlert`, …); komponen baru masuk ke level yang tepat, tanpa barrel file; Tailwind saja (belum shadcn); gambar lewat `next/image`.
6. Aksesibilitas: editor bisa dipakai dengan keyboard (urut ulang via tombol naik/turun, bukan hanya drag), label untuk setiap field.
7. Lolos `npx tsc --noEmit` dan lint.

---

## 5. Urutan kerja dan titik sinkron

1. **ML** commit `ai.proto` dulu (bisa paling cepat). BE boleh mulai dari teks proto di dokumen ini tanpa menunggu.
2. BE dan ML bekerja paralel; titik temu = tes integrasi lokal backend → ai-engine lewat gRPC.
3. FE bisa mulai jalur manual dan editor sekarang memakai bentuk JSON di bawah, lalu menyambung ke endpoint nyata saat BE siap.

Bentuk JSON pasal yang dipakai FE ↔ BE:
```json
{ "kodePasal": "P-07", "judul": "Sanksi Keterlambatan", "isi": "…", "urutan": 7, "legalReferenceId": 12 }
```

Bentuk respons yang sudah dipakai FE (BE wajib mengikuti, 2026-11-10):
- `POST /contracts/wizard/preview` → `{ "clauses": [<pasal>], "model": "gemini:…" }`, bukan lagi `teksDraf`.
- `GET /contracts/options?jenis=<jenis>` menambahkan `legalReferences: [{ "id", "peraturan", "nomorPasal", "isi" }]` dan `clauses: [<pasal> + wajib]` (dari `clause_library`, untuk mode "Tulis manual"; FE juga menerima nama lama `clauseTemplate`).
- `POST /contracts/{id}/audit` → `{ "skor", "model", "findings": [{ "kodePasal", "tingkat": "kritis"|"saran", "pesan" }] }`.
- `GET /contracts/{id}/audit/latest` → bentuk yang sama, atau 404 bila belum ada audit. Dipakai FE supaya hasil audit tidak hilang setelah reload.
- `POST /contracts` dan `PUT /contracts/{id}` → `{ "id", "nomorVersi", "sumber" }` dari versi yang baru dibuat; FE memakai `nomorVersi` ini.
- Error (revisi PM 2026-11-10, supaya `login.ts` lama tidak rusak): `{ "error": "<pesan>", "code": "<KODE>" }`, dengan `error` tetap string dan `code` di level atas. AI habis = 503 `AI_UNAVAILABLE`; sudah ditandatangani = 409 `CONTRACT_LOCKED`; rate limit = 429 `RATE_LIMITED`.

Keputusan PM tambahan (2026-11-10):
- Draft AI **tidak di-cache**, karena jawaban wizard bisa berisi data pribadi dan cache hit-nya rendah. Yang di-cache hanya audit (kuncinya hash isi pasal, dan isi sudah disamarkan ai-engine sebelum dikirim ke LLM).
- Revisi manual tidak membuat baris audit rule. Status kembali ke `draf` sampai `POST /contracts/{id}/audit` dijalankan.

## 6. Risiko terbuka (untuk DevOps)

- **gRPC di Azure App Service F1 belum terbukti.** App Service Linux butuh HTTP/2 end-to-end dan pengaturan port khusus untuk gRPC; dukungan di paket F1 harus dicek. Itu sebabnya REST `/v1/audit` dipertahankan sementara.
- **Redis di Azure berbayar.** Lokal cukup service `redis` di `docker-compose.yml`; di Azure biarkan `REDIS_URL` kosong (cache mati) sampai ada keputusan biaya.
- ai-engine di Azure saat ini publik dan hanya dijaga `X-API-Key`; metadata `x-api-key` di gRPC wajib tetap ada.

### Temuan DevOps (2026-11-10)

- `docker-compose.yml` sudah punya service `redis`, `REDIS_URL`, `AI_ENGINE_GRPC_ADDR=ai-engine:50051`, dan `GRPC_PORT=50051` (belum diuji karena laptop tanpa Docker).
- Syarat gRPC di App Service Linux: `http20Enabled=true`, HTTP 2.0 Proxy "gRPC only", app setting `HTTP20_ONLY_PORT=8585`, dan klien hanya lewat TLS ke `:443`. Dukungan di paket F1 tidak disebut dokumen dan harus dites dulu.
- Konsekuensi untuk kode:
  - ML: di Azure, `GRPC_PORT=8585`. Port harus selalu dari env, jangan di-hardcode.
  - BE: klien gRPC butuh saklar TLS lewat `AI_ENGINE_GRPC_TLS=true`, atau otomatis bila port 443. Lokal memakai plaintext `ai-engine:50051`, Azure memakai TLS `saksi-ai-engine.azurewebsites.net:443`. Klien harus reconnect setelah app tidur (F1 tanpa Always On) dan tetap fallback ke REST.
  - BE: Redis di produksi dibiarkan kosong dulu (Azure Managed Redis B0 ≈ US$13/bulan). Karena rate limit tanpa Redis berarti fail-open di API publik, sediakan rate limiter in-memory per proses sebagai fallback saat `REDIS_URL` kosong. Klien Redis harus mendukung `rediss://` (AMR hanya TLS, port 10000, db 0).

## 7. Endpoint lanjutan (termin, segel, notifikasi, audit log, LHP, admin daerah, profil, reset sandi)

> Ditulis BE 2026-11-10 sebelum implementasi. FE menyambung persis ke bentuk ini. Semua path di bawah `/api/v1`. Semua error: `{ "error": "<pesan Indonesia>", "code": "<KODE>" }`.

### 7.0 Aturan bersama

**Kode error yang dipakai di bagian ini**

| HTTP | `code` | Arti |
|---|---|---|
| 400 | `INVALID_INPUT` | body/query tidak valid; `error` berisi pesan yang bisa ditampilkan |
| 400 | `INVALID_HASH` | hash bukan 64 karakter heksadesimal |
| 400 | `TOKEN_INVALID` | token reset salah, kedaluwarsa, atau sudah dipakai |
| 400 | `WRONG_PASSWORD` | kata sandi lama salah |
| 401 | — | token tidak ada/kedaluwarsa (middleware lama, tanpa `code`) |
| 403 | `FORBIDDEN` | role tidak boleh, atau objek di luar cakupan desa/wilayah |
| 404 | `NOT_FOUND` | objek tidak ada |
| 409 | `INVALID_STATE` | status kontrak/termin tidak mengizinkan aksi ini |
| 409 | `ALREADY_PAID` | termin sudah dibayar |
| 409 | `CONFLICT` | data ganda (mis. penugasan pengawas sudah ada) |
| 429 | `RATE_LIMITED` | terlalu banyak percobaan (header `Retry-After`) |
| 500 | `INTERNAL` | kesalahan server |

**Cakupan data (scope).** Dipakai semua endpoint baru yang menyentuh kontrak:
- `kades` / `perangkat_desa` / `bpd`: kontrak dengan `village_id` = desa di token.
- `inspektorat`: kontrak di desa yang wilayahnya ada di `user_roles.region_id` milik akun itu (role `inspektorat`), **atau** kontrak yang ditugaskan lewat `oversight_assignments`. Akun inspektorat tanpa wilayah dan tanpa penugasan melihat daftar kosong.
- `penyedia`: kontrak tempat ia pihak kedua (`contract_parties.user_id` atau `counterparties.user_id`).
- `admin_daerah`: kontrak di wilayah `user_roles.region_id` (role `admin_daerah`).
- `warga`: tidak punya akses ke endpoint ini kecuali notifikasi, profil, dan verifikasi segel publik.

Kontrak di luar cakupan → 403 `FORBIDDEN` (bukan 404), kontrak tidak ada → 404 `NOT_FOUND`.

**Tanggal.** Input tanggal `YYYY-MM-DD`. Output waktu/tanggal = RFC3339 (`2026-11-10T00:00:00Z`), sama seperti `tenggat` yang sudah ada.

**Paginasi (notifikasi, audit log).** `limit` (default 50, maks 200) dan `before=<id>` (ambil id lebih kecil). Respons membawa `nextBefore` (id terakhir) atau `null` bila habis.

### 7.1 Termin dan progres pekerjaan

Bentuk objek:
```json
// PaymentTerm
{ "id": 3, "contractId": 12, "urutan": 1, "persen": 50, "nominal": 37500000, "jatuhTempo": "2026-12-01T00:00:00Z",
  "status": "rencana|jatuh_tempo|dibayar|terlambat", "realisasiNominal": 37500000, "tanggalRealisasi": "2026-12-02T00:00:00Z" }
// WorkProgress
{ "id": 7, "contractId": 12, "termId": 3, "persenSelesai": 40, "catatan": "Pondasi selesai", "dilaporkanOleh": 21,
  "pelaporNama": "PT Jaya", "waktu": "2026-11-10T08:00:00Z",
  "bukti": [{ "fileId": 9, "kunciPenyimpanan": "https://…/foto.jpg", "mime": "text/uri-list", "ukuran": 0 }] }
// SPK
{ "id": 1, "contractId": 12, "nomor": "027/SPK/2026", "tanggal": "2026-11-01T00:00:00Z", "mulai": "2026-11-02T00:00:00Z", "selesai": "2027-01-31T00:00:00Z" }
// ContractTermin
{ "contractId": 12, "villageId": 1, "status": "berjalan", "nilai": 75000000, "totalDibayar": 37500000, "progresTerakhir": 40,
  "spk": <SPK|null>, "terms": [<PaymentTerm>], "progress": [<WorkProgress>, urut waktu naik] }
```
Arti status termin: `rencana` = belum diajukan; `jatuh_tempo` = penyedia sudah melaporkan progres untuk termin ini (diajukan untuk dibayar); `dibayar` = desa sudah membayar. `terlambat` tidak diisi otomatis; FE tetap menghitung keterlambatan dari `jatuhTempo`.

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/termin` | kades, perangkat_desa, bpd, inspektorat, penyedia (scope) | — | 200 `[{ "contractId", "nomor", "judul", "villageId", "villageName", "nilai", "status", "totalDibayar", "progresTerakhir", "terms": [<PaymentTerm>] }]` hanya kontrak berstatus `ditandatangani`/`dipublikasikan`/`berjalan`/`selesai` | 403 |
| GET | `/contracts/{id}/termin` | sama (scope) | — | 200 `ContractTermin` | 400, 403, 404 |
| PUT | `/contracts/{id}/termin` | kades, perangkat_desa (desa sendiri) | `{ "terms": [{ "persen": 50, "jatuhTempo": "2026-12-01" }] }` 1–24 termin, total persen = 100, `nominal` dihitung server dari `nilai` (sisa pembulatan masuk termin terakhir), urutan = urutan array | 200 `ContractTermin` | 400 `INVALID_INPUT`, 403, 404, 409 `INVALID_STATE` (ada termin `dibayar`, kontrak `selesai`/`dibatalkan`, atau kontrak sudah ditandatangani dan jadwal sudah ada) |
| PUT | `/contracts/{id}/spk` | kades, perangkat_desa | `{ "nomor": "027/SPK/2026", "tanggal": "2026-11-01", "mulai": "2026-11-02", "selesai": "2027-01-31" }` (`mulai`/`selesai` opsional, `selesai` ≥ `mulai`) | 200 `ContractTermin`. Bila kontrak `dipublikasikan` → status jadi `berjalan` | 400, 403, 404, 409 `INVALID_STATE` (status bukan `ditandatangani`/`dipublikasikan`/`berjalan`) |
| POST | `/contracts/{id}/progress` | penyedia (pihak kontrak), kades, perangkat_desa | `{ "persenSelesai": 40, "catatan": "…", "termId": 3, "fileIds": [9], "buktiUrl": ["https://…"] }` (`termId`, `fileIds`, `buktiUrl` opsional; `fileIds` harus file yang diunggah akun sendiri; `buktiUrl` https, maks 10) | 201 `WorkProgress`. Termin `rencana`/`terlambat` → `jatuh_tempo`. `persenSelesai` ≥ 100 → kontrak `selesai`. Notifikasi `progres_dilaporkan` ke pembuat kontrak | 400, 403, 404, 409 `INVALID_STATE` (kontrak bukan `berjalan`, atau termin sudah dibayar) |
| POST | `/contracts/{id}/termin/{termId}/bayar` | kades, perangkat_desa | opsional `{ "realisasiNominal": 37500000, "tanggalRealisasi": "2026-12-02" }` (default `nominal` dan hari ini) | 200 `PaymentTerm`. Notifikasi `termin_dibayar` ke akun penyedia | 400, 403, 404, 409 `INVALID_STATE` (kontrak bukan `berjalan`/`selesai`), 409 `ALREADY_PAID` |

Verifikasi termin oleh BPD/Inspektorat: skema tidak punya kolom persetujuan di `payment_terms`/`work_progress`, jadi BPD/Inspektorat hanya membaca; temuan atas termin dicatat lewat LHP (`objek: "termin"`, bagian 7.5).

### 7.2 Segel dokumen

Segel sudah dibuat otomatis oleh `POST /contracts/{id}/sign` saat semua pihak menandatangani (SHA-256 dari teks versi terakhir). Mulai sekarang segel baru juga mengisi `segelSebelumnyaId` (segel kontrak yang sama sebelumnya, rantai hash), mencatat `audit_logs`, dan mengirim notifikasi.

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/public/seals/verify?hash=<sha256 hex>` | publik (token opsional) | `hash` 64 heksadesimal | 200 `{ "cocok": true, "segel": { "id", "versionId", "nomorVersi", "sha256", "waktuSegel", "segelSebelumnyaId", "chain", "txHash" }, "kontrak": { "id", "nomor", "judul", "villageName" } }` atau 200 `{ "cocok": false }`. Hasil cocok dicatat di `seal_verifications` (`diverifikasi_oleh` = user bila login) | 400 `INVALID_HASH`, 429 `RATE_LIMITED` (30/menit per IP) |
| GET | `/seals` | kades, perangkat_desa, bpd, inspektorat, penyedia (scope) | — | 200 `[{ "sealId", "contractId", "nomor", "judul", "villageId", "villageName", "versionId", "nomorVersi", "sha256", "waktuSegel", "segelSebelumnyaId", "chain", "txHash", "jumlahVerifikasi" }]` | 403 |

Hasil `tidak_cocok` tidak disimpan karena `seal_verifications.seal_id` wajib (tidak ada segel untuk dirujuk). Verifikasi hanya dengan hash penuh; tidak ada pencarian awalan hash atau "kode segel".

### 7.3 Notifikasi

Objek: `{ "id", "jenis", "pesan", "tautan", "dibaca": false, "dibacaPada": null, "dibuatPada" }`.
`jenis` yang dikirim BE: `kontrak_ditinjau` (penyedia mengirim tinjauan → pembuat kontrak), `kontrak_ditandatangani` (satu pihak tanda tangan → pihak lain), `kontrak_disegel` (semua pihak), `laporan_baru` (laporan warga → pembuat kontrak), `progres_dilaporkan`, `termin_dibayar`, `lhp_terbit` (→ pembuat kontrak), `pengawas_ditugaskan` (→ pengawas), `laporan_ditanggapi` / `laporan_diteruskan` / `laporan_ditutup` (tindak lanjut laporan → pelapor, tautan `/dashboard/laporan/{reportId}`). `tautan` = path FE, mis. `/dashboard/kontrak/12` (id backend, bukan kode lokal).

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/notifications?unread=true&limit=50&before=<id>` | semua role login | — | 200 `{ "items": [<Notif>], "unreadCount": 3, "nextBefore": 41 }` | 400 |
| POST | `/notifications/{id}/read` | pemilik notifikasi | — | 204 | 400, 404 (bukan milik sendiri juga 404) |
| POST | `/notifications/read-all` | semua role login | — | 200 `{ "updated": 3 }` | — |

### 7.4 Jejak audit

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/audit-logs?contractId=&actorId=&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=50&before=<id>` | kades, perangkat_desa, bpd, inspektorat, penyedia (scope kontrak, ditambah log milik sendiri) | — | 200 `{ "items": [{ "id", "aktorUserId", "aktorNama", "aktorRole", "aksi", "jenisObjek", "idObjek", "contractId", "contractJudul", "villageId", "villageName", "sebelum", "sesudah", "waktu" }], "nextBefore" }` | 400 `INVALID_INPUT`, 403 |

`aksi` yang ditulis BE: `contract.create`, `contract.revise`, `contract.audit`, `contract.publish`, `contract.review`, `contract.sign`, `contract.seal`, `contract.termin_set`, `contract.spk_set`, `contract.progress`, `contract.termin_paid`, `contract.lhp_create`, `contract.lhp_publish`, `contract.oversight_assign`, `contract.report_action`, `region_rule.create`, `user.profile_update`, `user.password_change`, `user.password_reset`. `jenisObjek` = `contract` (idObjek = id kontrak), `user`, atau `region_rule`. `to` inklusif (sampai akhir hari). IP tidak dikirim ke klien. Laporan warga tidak ditulis ke audit log supaya identitas pelapor tidak bocor ke desa.

### 7.5 LHP (audit_reports)

Objek: `{ "id", "contractId", "contractJudul", "villageId", "villageName", "jenis": "lhp|uji_petik", "penyusunUserId", "penyusunNama", "ringkasan", "status": "draf|terbit", "terbitPada", "jumlahTemuan", "findings": [{ "id", "objek": "spk|termin|pasal", "temuan", "tingkat": "kritis|saran", "rekomendasi" }] }` (`findings` hanya di detail dan respons create).

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/audit-reports` | inspektorat (kontrak dalam scope) | `{ "contractId": 12, "jenis": "lhp", "ringkasan": "…", "terbit": false, "findings": [{ "objek": "termin", "temuan": "…", "tingkat": "kritis", "rekomendasi": "…" }] }` (maks 50 temuan) | 201 AuditReport | 400, 403, 404 |
| GET | `/audit-reports?contractId=&status=draf\|terbit` | inspektorat (scope); kades, perangkat_desa, bpd (desa sendiri, hanya `terbit`) | — | 200 `[AuditReport tanpa findings]`, terbaru dulu | 400, 403 |
| GET | `/audit-reports/{id}` | sama | — | 200 AuditReport + findings | 400, 403, 404 (draf milik orang lain untuk desa = 404) |
| POST | `/audit-reports/{id}/terbit` | inspektorat penyusun | — | 200 AuditReport. Notifikasi `lhp_terbit` ke pembuat kontrak | 403, 404, 409 `INVALID_STATE` (sudah terbit) |

Tabel `audit_reports` tidak punya kolom waktu dibuat; urutan daftar memakai id.

### 7.6 Admin daerah

Wilayah admin = `user_roles.region_id` untuk role `admin_daerah`. Akun tanpa wilayah → 403.

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/admin/region-rules` | admin_daerah, inspektorat (wilayah sendiri) | — | 200 `[{ "id", "regionId", "regionNama", "ambangPembelianLangsung", "ambangPenawaran", "dasarHukum", "berlakuSejak" }]` terbaru dulu per wilayah | 403 |
| POST | `/admin/region-rules` | admin_daerah | `{ "regionId": 1, "ambangPembelianLangsung": 200000000, "ambangPenawaran": 1000000000, "dasarHukum": "Perbup …", "berlakuSejak": "2027-01-01" }` (`regionId` boleh kosong bila admin hanya punya satu wilayah). Aturan baru = baris baru (riwayat tidak ditimpa) | 201 RegionRule | 400, 403 |
| GET | `/admin/pengawas?jenis=bpd\|inspektorat` | admin_daerah | — | 200 `[{ "userId", "nama", "email", "jenis", "villageId", "villageName", "regionId" }]` akun pengawas di wilayahnya | 400, 403 |
| GET | `/admin/oversight-assignments?contractId=` | admin_daerah | — | 200 `[{ "id", "contractId", "contractJudul", "villageName", "pengawasUserId", "pengawasNama", "jenis", "ditetapkanPada" }]` | 400, 403 |
| POST | `/admin/oversight-assignments` | admin_daerah | `{ "contractId": 12, "pengawasUserId": 30, "jenis": "inspektorat" }` (pengawas harus punya role = `jenis`) | 201 assignment. Notifikasi `pengawas_ditugaskan` | 400, 403, 404, 409 `CONFLICT` |

Belum ada: undangan akun (`invitations`), pustaka pasal, rekap kabupaten, hapus penugasan.

### 7.7 Profil

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/auth/me` | semua | — | bentuk lama + field tambahan opsional `noHp` (warga) dan `usaha: { "id", "nama", "jenis", "npwp", "alamat" }` (penyedia) | 401, 404 |
| PUT | `/auth/me` | semua | `{ "nama": "…", "noHp": "08…" (warga), "usaha": { "nama", "npwp", "alamat" } (penyedia) }` semua opsional; `nama` 3–255, `noHp` 8–20 digit (boleh `+`), `npwp` 15–20 karakter angka/titik/strip, `alamat` 5–500 | 200 bentuk `/auth/me` | 400 `INVALID_INPUT` |
| POST | `/auth/password/change` | semua | `{ "passwordLama": "…", "passwordBaru": "…" }` (baru ≥ 8) | 204 | 400 `WRONG_PASSWORD` / `INVALID_INPUT`, 429 |

Kolom "penanggung jawab/kontak" di ProfilUsaha **tidak ada** di tabel `counterparties`; tidak disimpan. Nama desa/profil desa tidak bisa diubah lewat API ini.

### 7.8 Lupa / atur ulang sandi

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/auth/password/forgot` | publik | `{ "email": "…" }` | 202 `{ "message": "Jika email terdaftar, instruksi atur ulang sandi sudah dikirim." }` selalu sama (tidak membocorkan email terdaftar). Hanya bila `APP_ENV` = `development`/`local`/`test`: tambah `"devToken": "<token>"` dan token ditulis ke log | 400, 429 (5 per 15 menit per IP dan per email) |
| POST | `/auth/password/reset` | publik | `{ "token": "…", "password": "…" }` (≥ 8) | 204 | 400 `TOKEN_INVALID` / `INVALID_INPUT`, 429 |

Token acak 32 byte (base64url), yang disimpan hanya SHA-256-nya, berlaku 30 menit, sekali pakai; reset juga membatalkan token lain milik user itu. **Belum ada layanan email**: di produksi token tidak dikirim ke mana pun, jadi alur ini belum bisa dipakai pengguna nyata sampai email dipasang. Token login lama tetap berlaku sampai kedaluwarsa (belum ada revokasi).

### 7.9 Laporan per kontrak

`GET /contracts/{id}/reports` (kades, perangkat_desa, bpd, inspektorat) sudah ada dan tidak berubah: 200 `[CitizenReport]`, 403 untuk desa lain, 404 bila kontrak tidak ada.

`POST /reports` (laporan warga): `deskripsi` minimal 15 dan **maksimal 5000 karakter**, `kategori` maksimal 255. Tidak ada kolom pasal/lokasi teks; FE menggabungkan `"[pasal] teks - Lokasi: x"` ke `deskripsi`, dan itu diterima. Laporan baru mengirim notifikasi `laporan_baru` ke pembuat kontrak (tanpa identitas pelapor).

### 7.10 Portal publik (keputusan PM 2026-11-10)

- `GET /public/contracts` dan `GET /public/contracts/{id}` sekarang **token opsional** (anonim boleh). Tetap hanya kontrak `dipublikasikan`/`berjalan`/`selesai` dan hanya teks hasil redaksi. Warga yang login tetap dibatasi ke desanya.
- Detail publik kini mengisi `sha256Hash` dari segel terakhir kontrak (`""` bila belum disegel) — dipakai untuk `GET /public/seals/verify`.
- Detail publik menambah `progres` (tanpa catatan dan tanpa nama pelapor):
```json
"progres": { "persenTerakhir": 40, "terakhirDilaporkan": "2026-11-10T08:00:00Z", "spkMulai": "2026-11-02T00:00:00Z", "spkSelesai": "2027-01-31T00:00:00Z",
  "persenDibayar": 50, "termin": [{ "urutan": 1, "persen": 50, "status": "dibayar", "jatuhTempo": "2026-12-01T00:00:00Z" }] }
```
- Cache `saksi:public:contract:{id}` dan daftar desanya dihapus setelah `PUT /termin`, `PUT /spk`, `POST /progress`, dan `POST /termin/{termId}/bayar`. Entri cache lama (sebelum deploy) belum punya `progres` sampai TTL 10 menit habis.

### 7.11 Tindak lanjut laporan warga

Objek `ReportAction` sama dengan `actions[]` di `GET /reports/{id}`: `{ "id", "reportId", "aktorUserId", "aktorNama", "tindakan": "klarifikasi|eskalasi|selesai", "catatan", "diteruskanKeRole", "waktu" }`.

| Method | Path | Role | Request | Response | Error |
|---|---|---|---|---|---|
| GET | `/reports/{id}/actions` | warga (laporan sendiri), kades, perangkat_desa, bpd, inspektorat (scope 7.0) | — | 200 `[ReportAction]` urut waktu naik; untuk kades/perangkat_desa nama pelapor di aksi awal disamarkan `"Warga terverifikasi"` | 400, 403, 404 |
| POST | `/reports/{id}/actions` | kades, perangkat_desa, bpd, inspektorat (scope 7.0) | `{ "tindakan": "klarifikasi", "catatan": "…", "status": "diverifikasi", "diteruskanKeRole": "inspektorat" }` | 201 `{ "action": <ReportAction>, "status": "<status laporan baru>" }`. Notifikasi ke pelapor | 400 `INVALID_INPUT`, 403 (termasuk inspektorat mencoba `eskalasi`), 404, 409 `INVALID_STATE` |

Aturan status (`citizen_reports.status`):
- `selesai` / `ditolak` = tertutup; semua tindakan → 409.
- `tindakan: "selesai"` → `selesai` dari status terbuka mana pun.
- `tindakan: "eskalasi"` → `diteruskan` (`diteruskanKeRole` `bpd`/`inspektorat`, default `inspektorat`); ditolak bila sudah `diteruskan`. Inspektorat tidak bisa eskalasi.
- `tindakan: "klarifikasi"` tanpa `status`: `diterima` → `diverifikasi`, status lain tetap (catatan saja). Dengan `status`: `diterima` → `diverifikasi`/`ditolak`; `diverifikasi` → `ditindaklanjuti`/`ditolak`; `diteruskan` → `ditindaklanjuti`/`ditolak`.
