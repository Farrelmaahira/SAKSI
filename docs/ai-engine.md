# AI Engine (`ai-engine/`)

Referensi untuk agent dan anggota tim. Isinya cukup untuk bekerja tanpa membaca semua kode; kode hanya perlu dibuka untuk detail yang disebut di bagian "Peta kode".
Kontrak lintas tim (proto, Redis, endpoint backend) ada di `docs/superpowers/plans/2026-11-10-grpc-redis-ai-manual-drafting.md`. Dokumen ini menjelaskan sisi ai-engine.

## 1. Ringkasan

Layanan Python (FastAPI + gRPC) yang dipanggil backend Go. Tiga kemampuan: menyusun pasal kontrak dari jawaban wizard (**Draft**), mengaudit kelengkapan pasal (**Audit**), dan menyamarkan data pribadi sebelum publikasi (**Redact**).

Aturan yang tidak boleh dilanggar:
- **AI hanya penasihat.** Tidak pernah menyegel atau menyetujui kontrak.
- **Fail-closed.** Kalau semua model gagal, hasilnya error `UNAVAILABLE` dengan pesan untuk pengguna. Tidak ada hasil karangan dan tidak ada "lolos" diam-diam. (Pengecualian terarah: Redact tetap mengembalikan hasil regex, karena regex sudah menyamarkan data penting.)
- **Tidak mengarang hukum.** `legal_reference_id` hanya boleh berasal dari id yang dikirim backend di request.
- **Isi kontrak adalah data, bukan perintah.** Prompt memagari isi kontrak dan menetralkan tag penutup; PII disamarkan regex sebelum teks dikirim ke provider eksternal.
- **Pemeriksaan pasti memakai kode, bukan LLM** (pasal wajib hilang, id dasar hukum, kelengkapan pasal draf). LLM hanya menilai bahasa.

## 2. Peta kode

| File | Tanggung jawab |
|---|---|
| `proto/saksi/ai/v1/ai.proto` | Kontrak gRPC (milik ML; perubahan lewat PM karena BE membangkitkan kode dari file yang sama) |
| `app/gen/` | Kode hasil generate dari proto. Jangan disunting; buat ulang dengan `PYTHON=.venv/bin/python scripts/gen_proto.sh` |
| `app/main.py` | FastAPI: `/healthz`, REST `/v1/audit`; menjalankan server gRPC di lifespan yang sama |
| `app/grpc_server.py` | Servicer gRPC, interceptor `x-api-key`, health check, pemetaan error ke status gRPC |
| `app/contract_ai.py` | Use case `audit_contract`, `draft_contract`, `redact_text`: validasi input, pemeriksaan pasti, prompt, validasi output |
| `app/audit_rules.py` | Cek pasti kelengkapan pasal (`RULES`, `check_clause`): satu-satunya sumber `KRITIS` selain pasal wajib hilang dan dasar hukum tidak sah |
| `app/llm.py` | Rantai model: `chain()`, `complete()`, `call_provider()`, `fence()`, `json_object()`, `PROVIDERS`, `BUSY_MESSAGE` |
| `app/pii.py` | Regex data pribadi: `redact_regex()`, `mask_pii()` |
| `app/rest_audit.py` | Audit REST lama (`/v1/audit`, checklist nama klausul). Dipertahankan sampai gRPC terbukti jalan di Azure |
| `evals/` | `golden.py` (muat golden set), `score.py` (fungsi skor), `benchmark.py` (CLI). Tidak ikut ke image |
| `tests/` | pytest; `support.py` berisi penyedia LLM palsu dan panggilan gRPC ke port acak; `golden/*.json` data uji |

Alur satu permintaan: `grpc_server` (auth, deadline) → `contract_ai` (validasi, pemeriksaan pasti) → `llm.complete` (rantai model, validasi jawaban) → hasil.

## 3. Kontrak

### gRPC `saksi.ai.v1.AiEngine` (port `GRPC_PORT`)
- Plaintext h2c (TLS diterminasi Azure). Metadata wajib: `x-api-key` = `AI_API_KEY`. Health `grpc.health.v1.Health` terbuka tanpa kunci; `SERVING` bila minimal satu model di rantai punya API key.
- Deadline dari backend: 13 dtk (Draft/Audit), 5 dtk (Redact). Rantai membatasi setiap percobaan dengan sisa deadline.

| Kondisi | Status |
|---|---|
| `x-api-key` kosong/salah | `UNAUTHENTICATED` |
| jenis kosong, pasal kosong, `kode_pasal` kosong/ganda, total isi pasal atau teks > 200 KB | `INVALID_ARGUMENT` |
| semua model di rantai gagal | `UNAVAILABLE`, details = pesan untuk pengguna (lihat `BUSY_MESSAGE`) |

Pesan `UNAVAILABLE`: "Layanan AI sedang penuh. Coba lagi beberapa menit lagi, atau lanjutkan menyunting pasal secara manual."

**AuditContract.** **Temuan `KRITIS` hanya berasal dari kode, tidak pernah dari LLM** (tingkat keparahan LLM terbukti bergeser antar audit, jadi tidak boleh menggerakkan gerbang kirim di backend). Sumbernya: (1) kode di `mandatory_kode_pasal` yang tidak ada di `clauses`, (2) `legal_reference_id` yang tidak ada di `legal_references`, (3) kolom kosong di isi pasal apa pun (`[diisi manual]`, `[nilai kontrak]`, `(isi sesuai pekerjaan)`, `____`), (4) slot wajib kosong menurut judul pasal (`app/audit_rules.py`): sanksi/denda tanpa besaran, jangka waktu tanpa tanggal atau durasi, garansi/pemeliharaan tanpa durasi, pembayaran tanpa persen/jumlah termin atau skema pasti, nilai/harga tanpa jumlah rupiah, bagi hasil tanpa persentase. LLM hanya menambah `SARAN` (ambigu, berat sebelah, bertentangan); saran untuk pasal yang sudah `KRITIS` dibuang, dan `tingkat` dari LLM diabaikan. `kode_pasal` saran LLM yang tidak ada di kontrak membuat jawaban ditolak (dihitung gagal). `skor` = persentase pasal wajib (atau semua pasal bila daftar wajib kosong) yang ada dan tanpa temuan `KRITIS`, 0 sampai 100. Karena `KRITIS` deterministik, hasil gerbang kirim tidak bergantung pada model mana di rantai yang menjawab, dan tidak perlu field `sumber` di proto/skema (semua `KRITIS` sudah pasti dari aturan).

**DraftContract.** Menulis ulang `isi` tiap pasal template sesuai `jawaban`. Jawaban LLM ditolak bila kode pasal hilang atau bertambah, atau `legal_reference_id` di luar daftar yang dikirim. `kode_pasal`, `judul`, `urutan` selalu dari template; `legal_reference_id` dari template tidak pernah dibuang. Data yang tidak ada di jawaban ditulis `[diisi manual]`, bukan dikarang. Pengaman `_faithful` (`contract_ai.py`): bila LLM hanya mengubah format atau mengosongkan isi pasal yang sudah konkret (template tanpa kolom kosong seperti `[..]`, `...`), teks template dipakai; judul pasal yang tersalin ke isi dibuang.

**RedactText.** Regex dulu (kind: `email`, `no_hp`, `npwp`, `rekening`, `nik`; pengganti `[EMAIL]`, `[NO-HP]`, `[NPWP]`, `[REKENING]`, `[NIK]`), lalu LLM menandai `nama` dan `alamat` (`[NAMA]`, `[ALAMAT]`). Potongan dari LLM yang tidak ada di teks diabaikan. Nama jabatan, instansi, badan usaha, wilayah, dan angka kontrak tidak boleh tersamar (diuji di golden set). Bila LLM gagal, hasil regex dikembalikan dengan `OK`.

### REST (lama, tetap hidup)
- `GET /healthz` → `{"status":"ok","providers":["gemini:...","groq:..."]}` (daftar model aktif di rantai; tanpa rahasia).
- `POST /v1/audit` (header `X-API-Key`): `{contractText (≤50.000 karakter), checklist (≤30 nama klausul)}` → `{score, fulfilled, total, summary, model, findings[{kodePasal, tingkat: kritis|saran, pesan}]}`. Semua model gagal → HTTP 503 dengan pesan yang sama seperti gRPC.

## 4. Rantai fallback antar model

`AI_PROVIDERS` berisi entri `provider:model` dipisah koma (pisah di titik dua **pertama**, jadi nama model boleh memuat `/`). Dicoba berurutan; yang pertama menghasilkan jawaban lolos validasi dipakai, dan nama model yang menjawab dikembalikan di field `model` (`groq:qwen/qwen3.8-27b`).

- Entri tanpa `:model` (format lama, mis. `groq,gemini`) memakai `GROQ_MODEL` / `GEMINI_MODEL`, supaya konfigurasi Azure lama tetap jalan.
- Provider tanpa API key, atau tidak dikenal, dilewati.
- Dianggap gagal dan langsung pindah ke model berikutnya: HTTP 429, 503, 400 (mis. model menolak parameter), timeout, atau jawaban yang tidak lolos validasi (bukan JSON, skema salah, kode pasal tidak dikenal, pasal draf tidak sama dengan template, id dasar hukum di luar daftar).
- Batas waktu per percobaan `AI_PROVIDER_TIMEOUT` (6 dtk) bersifat **total** (`asyncio.timeout`), bukan per fase seperti timeout httpx; dibatasi lagi oleh sisa deadline gRPC.
- Log hanya memuat nama model dan alasan (kode HTTP atau jenis galat), contoh `groq:qwen/qwen3.8-27b gagal: 429`. Isi kontrak tidak pernah dicatat.
- `reasoning_effort` melekat ke **provider** (`PROVIDERS` di `app/llm.py`; Gemini memakai `minimal`), bukan ke model. Model yang menolaknya (400) cukup dihitung gagal dan rantai lanjut. Gemini 3.7 dan 3.8 menolak `minimal` (butuh `low`), jadi belum cocok masuk rantai dengan pengaturan sekarang.

Rantai bawaan (`DEFAULT_CHAIN` di `app/llm.py`, juga `.env.example`):
`gemini:gemini-3-flash-preview,groq:qwen/qwen3.8-27b,groq:openai/gpt-oss-120b,gemini:gemini-3.5-flash`

### Batas kuota paket gratis (penting untuk kapasitas)
- **Gemini gratis: 20 permintaan per hari per model** (error 429 `generate_content_free_tier_requests, limit: 20`). Setiap model punya kuota sendiri, jadi menambah model Gemini menambah kapasitas harian. Setelah habis, model itu gagal cepat (±0,5 dtk) dan rantai lanjut ke berikutnya.
- **Groq gratis `qwen/qwen3.8-27b`: 1.000 token output per menit.** Satu audit memakai ±500 token, jadi lebih dari sekitar 2 audit per menit kena 429. Draf panjang (mis. 10 pasal baku) bisa melebihi batas itu sekaligus.
- Kuota dihitung per API key. Benchmark dan tes manual dengan key yang sama dengan Azure memakai kuota produksi.
- Bila semua habis, pengguna melihat pesan `UNAVAILABLE` dan bisa lanjut menyunting manual.

## 5. Konfigurasi (env)

| Variabel | Default | Keterangan |
|---|---|---|
| `AI_API_KEY` | wajib | Harus sama dengan backend. Service menolak start bila kosong |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | kosong | Provider tanpa key dilewati |
| `AI_PROVIDERS` | rantai bawaan | Lihat bagian 4 |
| `GROQ_MODEL`, `GEMINI_MODEL` | `qwen/qwen3.8-27b`, `gemini-3-flash-preview` | Hanya untuk entri tanpa `:model` |
| `AI_PROVIDER_TIMEOUT` | `6` | Detik, per percobaan, total |
| `GRPC_PORT` | `50051` | Azure: `8585`. `0` mematikan gRPC. Bind gagal tidak mematikan REST |

Jalankan dengan **1 worker** uvicorn (beberapa worker berebut port gRPC yang sama).

## 6. Menjalankan dan menguji

```sh
cd ai-engine
python3 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
cp .env.example .env                    # isi AI_API_KEY dan API key provider
.venv/bin/uvicorn app.main:app --port 8000 --env-file .env
.venv/bin/python -m pytest -q           # tanpa jaringan: semua provider palsu
PYTHON=.venv/bin/python scripts/gen_proto.sh   # setelah mengubah proto
```

Docker: service `ai-engine` di `docker-compose.yml` membaca `ai-engine/.env`; gRPC hanya di jaringan compose (`expose: 50051`).

## 7. Evaluasi kualitas

Tes pytest memakai provider palsu, jadi hanya membuktikan logika (validasi, rantai, golden regex). Kualitas LLM sungguhan diukur oleh benchmark.

### Golden set (`ai-engine/tests/golden/`)
| File | Isi | Dipakai oleh |
|---|---|---|
| `audit_missing_mandatory.json` | 5 jenis kontrak, pasal wajib yang hilang harus selalu `KRITIS` (deterministik) | `tests/test_grpc.py` |
| `audit_quality.json` | 9 kasus. `kritis` = pasal yang harus `KRITIS` (cek pasti di kode; diuji offline di `tests/test_golden.py` dengan LLM palsu yang menandai semua pasal KRITIS), `clean` = pasal konkret yang tidak boleh `KRITIS`, `saran` = pasal yang harus mendapat saran dari LLM (satu-satunya bagian yang membedakan model). Termasuk satu kasus injeksi perintah dan satu kasus lengkap tanpa temuan | tes offline + benchmark |
| `draft.json` | 6 kasus (5 jenis kontrak; `pengadaan-pasal-baku` memakai pasal baku P-01..P-10 persis dari backend; `sewa-harga-tidak-diisi` menguji `[diisi manual]`). `expect`: tiap pasal berisi grup, grup lolos bila salah satu alternatifnya muncul di isi | benchmark |
| `redact.json` | 13 kasus. `mask_regex` harus hilang oleh regex saja, `mask_llm` setelah LLM, `keep` harus tetap ada (jabatan, instansi, nominal, nomor dokumen, wilayah) | benchmark; `tests/test_golden.py` menguji lapisan regex |

Menambah kasus: tambahkan objek ke file JSON yang sesuai (format di atas; `clauses` = `[kode, judul, isi, legal_reference_id?]`), lalu `pytest` memeriksa konsistensinya. Selalu isi data fiktif; dasar hukum di data uji diberi label "(data uji)".

### Metrik (`evals/score.py`)
| Tugas | Metrik | Artinya |
|---|---|---|
| audit | `kritis_terdeteksi` | pasal lemah ditandai `KRITIS` (ditentukan kode; harus 100% untuk model apa pun, penjaga regresi) |
| audit | `tanpa_kritis_palsu` | pasal konkret tidak ditandai `KRITIS` (juga ditentukan kode) |
| audit | `saran_terdeteksi` | LLM memberi saran pada pasal yang ambigu (membedakan model) |
| draft | `isi_sesuai_jawaban` | nilai dari jawaban muncul di pasal yang tepat |
| draft | `tanpa_angka_karangan` | tidak ada angka di draf yang tidak ada di template, jawaban, atau rujukan (angka rujukan "Pasal 5", nomor urut diabaikan) |
| redact | `data_tersamar` | data pribadi hilang dari keluaran |
| redact | `tidak_berlebihan` | jabatan, instansi, nominal, nomor dokumen tetap utuh |

### Benchmark
```sh
.venv/bin/python -m evals.benchmark                         # tiap model di AI_PROVIDERS, satu per satu
.venv/bin/python -m evals.benchmark --models gemini:gemini-3.8-flash --effort low --tasks audit
.venv/bin/python -m evals.benchmark --models groq:qwen/qwen3.8-27b --pause 15        # hormati batas token Groq
.venv/bin/python -m evals.benchmark --limit 6               # 18 panggilan per model, di bawah kuota harian Gemini
```
Memakai jalur kode produksi dengan rantai satu entri (tanpa fallback), batas waktu sama dengan produksi, dan memanggil API sungguhan. Keluarannya tabel Markdown: jumlah menjawab, alasan gagal (kode HTTP × jumlah), skor per metrik (lulus/total, dihitung dari yang menjawab), latensi p50 dan terlama.
Kegagalan 429/503/timeout dipisah dari kualitas: skor hanya dihitung dari panggilan yang dijawab. Satu putaran penuh = 27 panggilan per model, melebihi kuota harian Gemini gratis, jadi pakai `--limit` atau pecah per tugas (`--tasks`).

### Hasil terakhir (2026-11-11)

Diukur dengan golden set di atas pada API sungguhan. Skor = lulus/total dari panggilan yang **dijawab**; kegagalan (429/503/timeout) dilaporkan terpisah. Gemini gratis dibatasi 20 permintaan/hari/model dan API-nya sedang sering 503/timeout, jadi baris Gemini sebagian besar tidak lengkap. Angka bisa berubah antar hari.

**audit** (8 kasus: 7 pasal wajib `KRITIS`, 20 pasal konkret yang tidak boleh `KRITIS`)

| Model | Menjawab | Gagal | kritis_terdeteksi | tanpa_kritis_palsu | p50 (dtk) | Terlama (dtk) |
|---|---|---|---|---|---|---|
| groq:qwen/qwen3.8-27b | 8/8 | - | 7/7 | 17/20 | 0,8 | 1,3 |
| groq:openai/gpt-oss-120b | 8/8 | - | 6/7 | 18/20 | 2,5 | 8,1 (1) |
| groq:openai/gpt-oss-20b | 8/8 | - | 5/7 | 19/20 | 2,0 | 3,1 |
| gemini:gemini-3.5-flash | 5/8 | 503×2, 429×1 | 5/5 | 12/13 | 2,1 | 2,5 |
| gemini:gemini-3.1-flash-lite (6 kasus) | 5/6 | timeout×1 | 5/5 | 11/11 | 4,8 | 6,4 |
| gemini:gemini-3.5-flash-lite (6 kasus) | 2/6 | timeout×2, 503×2 | 2/2 | 5/5 | 1,8 | 2,1 |
| gemini:gemini-3.6-flash | 1/8 | 429×6, 503×1 | 1/1 | 4/4 | 2,2 | 2,2 |
| gemini:gemini-3.7-flash, gemini:gemini-3.8-flash (`low`) | 0/4 | 429, 503, timeout | - | - | - | - |

**audit setelah severitas dipindah ke kode (2026-11-12, 9 kasus: 6 pasal `KRITIS`, 22 pasal konkret, 2 pasal yang harus mendapat saran)**

| Model | Menjawab | Gagal | kritis_terdeteksi | tanpa_kritis_palsu | saran_terdeteksi | p50 (dtk) | Terlama (dtk) |
|---|---|---|---|---|---|---|---|
| groq:openai/gpt-oss-120b | 9/9 | - | 6/6 | 22/22 | 2/2 | 2,0 | 5,5 |
| groq:qwen/qwen3.8-27b | 6/9 | timeout×3 | 3/3 | 16/16 | 2/2 | 3,1 | 4,5 |

`kritis_*` ditentukan kode, jadi 100% pada semua jawaban memang diharapkan (penjaga regresi); yang membedakan model kini hanya `saran_terdeteksi`, kecepatan, dan ketersediaan. Hari ini qwen lebih lambat dari pengukuran 2026-11-11 (p50 0,8 dtk) dan 3 dari 9 percobaan melewati batas 6 dtk; di produksi rantai lanjut ke model berikutnya. Angka tidak dibandingkan langsung dengan tabel audit di atas karena kasus, prompt, dan metrik berbeda.

**draft** (6 kasus; prompt setelah perbaikan di bagian "Pasal baku")

| Model | Menjawab | Gagal | isi_sesuai_jawaban | tanpa_angka_karangan | p50 (dtk) | Terlama (dtk) |
|---|---|---|---|---|---|---|
| groq:openai/gpt-oss-120b | 6/6 | - | 39/39 | 6/6 | 2,2 | 4,6 |
| groq:qwen/qwen3.8-27b | 4/6 | 429×2 | 24/24 | 4/4 | 1,0 | 2,1 |

Sebelum perbaikan prompt: gpt-oss-20b 6/6 (37/38), gemini-3.5-flash 3/6 (19/19, 503×3), gemini-3.5-flash-lite 3/6 (20/20), gemini-3.1-flash-lite 1/6 (jawaban tidak valid ×4). Gemini belum diukur ulang karena kuota.

**redact** (13 kasus)

| Model | Menjawab | Gagal | data_tersamar | tidak_berlebihan | p50 (dtk) | Terlama (dtk) |
|---|---|---|---|---|---|---|
| groq:qwen/qwen3.8-27b | 13/13 | - | 24/24 | 33/33 | 0,9 | 5,3 |
| groq:openai/gpt-oss-120b | 13/13 | - | 24/24 | 33/33 | 1,7 | 4,8 |
| groq:openai/gpt-oss-20b | 13/13 | - | 24/24 | 32/33 | 1,3 | 2,4 |
| gemini:gemini-3.5-flash | 2/13 | 429×11 | 5/5 | 8/8 | 1,9 | 2,0 |
| gemini:gemini-3.1-flash-lite (6 kasus) | 5/6 | timeout×1 | 12/12 | 13/13 | 6,0 | 10,4 (1) |

(1) Diukur sebelum batas waktu dibuat total (bagian 4); sekarang panggilan seperti itu dipotong di 6 dtk dan rantai pindah ke model berikutnya.

Kesimpulan dan keputusan rantai:
- **Rantai bawaan tidak diubah.** Tidak ada model yang terbukti lebih baik. `qwen` terbaik untuk audit (recall 7/7, tercepat) dan sudah berada sebelum `gpt-oss-120b`; `gpt-oss-120b` paling andal untuk draf (qwen sering 429 di draf panjang karena batas 1.000 token output/menit, dan fallback menutupinya). `gpt-oss-20b` lebih lemah di audit (5/7), jangan dipakai.
- `gemini-3-flash-preview` (model pertama rantai) **belum terukur** di putaran ini karena kuota hariannya habis; hasil PM sebelumnya 5/5 di audit. Ukur ulang setelah kuota reset: `python -m evals.benchmark --models gemini:gemini-3-flash-preview --limit 6`.
- `gemini-3.7-flash` dan `3.8-flash` menolak `reasoning_effort: minimal` (400) dan belum menjawab dengan `low` (429/503/timeout), jadi belum layak masuk rantai.
- Lapisan LLM Redact sempurna di golden set untuk tiga model Groq (kecuali gpt-oss-20b menyamarkan "Sukabumi").

### Pasal baku P-01..P-10 (mode tanpa `clause_library`)

Diperiksa dengan pasal baku persis seperti yang dikirim backend:
- **Audit:** qwen dan gpt-oss-120b sama-sama menandai **hanya P-06 `KRITIS`** (skor 90), bukan 3 dari 10. Penandaan itu **benar**: "selama masa garansi" tanpa durasi tidak bisa ditegakkan, dan itu cacat di templat baku (BE: tambahkan durasi garansi). Saran yang wajar: P-04 (tidak ada kondisi pemicu tiap termin), P-07 (tidak ada batas maksimum denda), P-09 ("kebijakan moneter mendesak" ambigu). Prompt dan checklist tidak perlu disetel. Hasil "3 dari 10" yang dilaporkan sebelumnya tidak bisa direproduksi (Gemini habis kuota); bila terjadi lagi, simpan `ai_audits.model` dan temuannya agar bisa dibandingkan.
- **Draft:** sebelum perbaikan, model (a) mengganti "dibebankan pada APBDes tahun anggaran berjalan" di P-02 menjadi "[diisi manual]" (isi benar dihapus), (b) merapikan "1. … ↵ 2. …" menjadi satu baris, dan (c) kadang menyalin judul pasal ke dalam isi. Perbaikan: prompt lebih tegas (pertahankan teks konkret, isi hanya kolom kosong, jangan salin judul, tulis bulan dalam bahasa Indonesia) ditambah pengaman `_faithful` di `contract_ai.py` (kembali ke teks template bila hanya format yang berubah atau isi konkret dikosongkan; judul yang tersalin dibuang). Setelah itu kedua model mengembalikan 10 pasal utuh, hanya "31 December" menjadi "31 Desember". Golden `pengadaan-pasal-baku` kini menjaga P-02 tetap memuat APBDes dan P-03 memuat "desember".


### Stabilitas severitas audit (2026-11-12)

**Masalah (bukti dari database lokal).** Kontrak 124 (audit 47) dan 125 (audit 48) sama-sama diaudit `gemini-3-flash-preview`. Temuan P-07 pesannya identik ("dasar pengenaan denda 1/1000 tidak disebutkan…") dan teks P-07 tidak berubah, tetapi tingkatnya berubah dari `SARAN` menjadi `KRITIS` setelah P-04 dan P-06 diperbaiki. Pada pasal baku, Gemini memberi P-07 `KRITIS` di 6 dari 7 audit dan `SARAN` di 1. Kontrak 70 yang diaudit Gemini dan qwen dalam menit yang sama juga berbeda (P-07 `KRITIS` vs `SARAN`), jadi saat kuota Gemini habis dan rantai pindah model, perilaku gerbang ikut berubah.

**Penyebab.** Bukan suhu (`temperature` sudah 0) dan bukan satu model saja: LLM menilai keparahan secara relatif, sehingga setelah pasal terburuk diperbaiki ia menaikkan pasal lain. Eksperimen pada draf baku, varian A (P-04 dan P-06 belum rinci) vs B (keduanya diperbaiki): `gpt-oss-120b` KRITIS `[P-06]` → `[P-07]`, `qwen` `[P-06]` → `[P-07, P-09]`; P-07 dan P-09 tidak berubah. Input identik menghasilkan hasil yang sama (dan backend men-cache audit 24 jam bila Redis aktif), jadi yang goyah adalah draf yang *diubah*, bukan draf yang sama.

**Perbaikan.** Severitas dipindah ke kode (lihat AuditContract di bagian 3): `KRITIS` hanya dari cek pasti, LLM hanya `SARAN`. Hasil eksperimen yang sama setelah perbaikan, di semua run yang berhasil: A `KRITIS=[P-06]`, B `KRITIS=[]` (`gpt-oss-120b` 4/4, `qwen` 3/3; satu run qwen kena 429); `SARAN` masih bervariasi antar run, tetapi hanya saran dan tidak menggerakkan gerbang. Dijaga tes offline: LLM palsu yang menandai semua pasal `KRITIS` tidak mengubah hasil (`tests/test_audit_rules.py`, `tests/test_golden.py`).

**Kebijakan bawaan dan akibatnya.** Slot wajib kosong memblokir pengiriman (`tingkat="kritis"` di `RULES`). Akibatnya draf AI dari wizard saat ini selalu terblokir di P-06 (garansi tanpa durasi), karena templat baku backend tidak punya slot durasi dan frontend belum mengirim jawaban `masa_garansi` (pertanyaannya ada di backend, tetapi tidak ditanyakan frontend dan `RuleDraftClauses` mengabaikannya). Pengguna harus mengisinya di tab "Draf & Versi". Untuk melonggarkan satu aturan menjadi peringatan, ubah `tingkat` aturan itu menjadi `"saran"`; tidak perlu mengubah prompt.

## 8. Cara mengubah

- **Menambah model**: tambahkan `provider:model` ke `AI_PROVIDERS` (lokal `.env`, Azure app setting). Tidak ada perubahan kode. Ukur dulu dengan benchmark.
- **Menambah provider** (endpoint kompatibel OpenAI): satu entri di `PROVIDERS` (`app/llm.py`) berisi url, nama env API key, env model, model bawaan, dan parameter ekstra. Tambahkan tes di `tests/test_chain.py`.
- **Mengubah prompt**: ubah konstanta `*_SYSTEM` di `app/contract_ai.py` (atau `app/rest_audit.py`), jalankan pytest, lalu benchmark sebelum dan sesudah; laporkan angkanya.
- **Mengubah proto**: lewat PM (BE memakai teks yang sama). Setelah disetujui, ubah `proto/`, jalankan `scripts/gen_proto.sh`, sesuaikan `contract_ai.py`/`grpc_server.py` dan tes.
- **Mengubah rantai bawaan**: ubah `DEFAULT_CHAIN` di `app/llm.py` dan `.env.example`, perbarui tabel hasil di bagian 7, dan kabari DevOps untuk app setting Azure (nilai di Azure menimpa bawaan).

## 9. Keterbatasan dan hal terbuka

- **Kuota gratis kecil** (bagian 4). Untuk beban nyata perlu tier berbayar atau lebih banyak model/kunci.
- **Nama pejabat yang menandatangani** (mis. nama Kepala Desa) belum diputuskan: disamarkan atau tidak di kontrak publik. Golden set sengaja tidak memuat kasus ini sampai ada keputusan; prompt saat ini hanya menjamin nama jabatan tidak tersamar.
- **Dasar hukum**: `legal_references` di database masih kosong, jadi Draft/Audit belum merujuk peraturan apa pun. Isi tidak boleh dikarang; sumbernya menunggu keputusan tim.
- **Backend (catatan untuk BE, bukan bagian ai-engine)**: pasal baku P-01..P-10 dipakai untuk semua jenis kontrak saat `clause_library` kosong, dan tanggalnya diformat Go dengan nama bulan Inggris ("31 December 2026"). Draf AI dapat menerjemahkan bulan, tetapi tidak dijamin.
- **Cek pasti memakai heuristik regex** atas judul dan isi pasal (`app/audit_rules.py`), jadi bisa false positive (mis. durasi ditulis dengan kata yang tidak dikenal) dan akan memblokir pengiriman. Perbaiki dengan menambah pola dan satu kasus di `tests/test_audit_rules.py`. Pasal dikenali dari **judul**; pasal dengan judul kosong hanya dikenai cek kolom kosong.
- **Audit tetap `UNAVAILABLE` bila semua model gagal**, padahal bagian `KRITIS` kini tidak butuh LLM. Apakah backend boleh memakai hasil deterministik saja saat LLM mati adalah keputusan PM/user (sekarang: tidak, sesuai aturan "tanpa hasil pengganti diam-diam").
- **Batas waktu 6 dtk** (`AI_PROVIDER_TIMEOUT`) tampak ketat untuk audit 10 pasal di Groq: 2 dari 8 percobaan eksperimen kena timeout. Pertimbangkan 8 dtk (deadline gRPC 13 dtk membatasi percobaan kedua).
- Landline dan nama/alamat tanpa penanda jelas hanya bergantung pada LLM; regex hanya menangkap email, HP seluler, NPWP, NIK, dan rekening berkonteks.
