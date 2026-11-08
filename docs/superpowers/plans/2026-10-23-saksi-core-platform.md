# SAKSI Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun platform kontrak digital SAKSI (Sistem Audit Kontrak Segel Integritas) untuk desa, UMKM, dan freelancer—mulai dari kuesioner cerdas, penyusunan dan audit klausul AI, penandatanganan digital ber-meterai, pencatatan segel integritas (hash SHA-256), hingga portal transparansi publik ter-redaksi dan kanal pelaporan warga.

**Architecture:** Tiga subsistem terintegrasi:
1. `frontend` (Next.js 14+ App Router, Tailwind CSS, TypeScript): Portal interaktif untuk pembuat kontrak, peninjau, dan publik/warga.
2. `backend` (Golang): Layanan inti manajemen kontrak, autentikasi multi-pihak, orkestrasi status kontrak, pencatatan segel integritas hash, serta audit log anti-tamper.
3. `ai-engine` (Python / FastAPI): Layanan pemrosesan kecerdasan buatan untuk ekstraksi kuesioner ke draf pasal hukum, audit kelengkapan pasal wajib, dan redaksi otomatis PII (Personally Identifiable Information) sebelum publikasi.

**Tech Stack:**
- Frontend: Next.js (TypeScript, Tailwind CSS, Lucide Icons)
- Backend: Golang (Echo/Gin, GORM, PostgreSQL/SQLite, Kriptografi SHA-256)
- AI Engine: Python 3.11+ (FastAPI, Pydantic, LLM Provider Client)

**Spec:** [README.md](file:///d:/Farrel/PROJECTS/SAKSI/README.md)

---

## Global Constraints
- Bahasa antarmuka dan istilah hukum kontrak disesuaikan dengan regulasi di Indonesia (UU ITE, UU Desa, standar perdata).
- Struktur monorepo multi-service: `frontend/`, `backend/`, `ai-engine/`.
- Segel integritas wajib menggunakan hash kriptografis deterministik (SHA-256 canonical hash dari dokumen final).
- Redaksi PII publik wajib menghilangkan data pribadi sensitif (NIK, nomor rekening, nomor telepon, alamat privat) sebelum status kontrak menjadi `PUBLISHED`.
- Setiap endpoint dan fungsi inti wajib disertai skenario pengujian mandiri (unit test / e2e test).

---

## Review Focus
1. **Manipulasi Draf Pasca-Tanda Tangan (Integrity Tampering):** Perubahan 1 karakter pun pada PDF/dokumen kontrak harus menyebabkan verifikasi hash gagal.
2. **Kegagalan Redaksi PII:** Data sensitif warga/aparatur desa bocor ke publik jika AI gagal menyaring; wajib ada fallback masking berbasis pola regex selain LLM filter.
3. **Ketidaklengkapan Pasal Wajib:** Kontrak proyek desa tanpa klausul spesifikasi teknis, garansi, atau termin pembayaran harus diberi peringatan keras oleh auditor AI.
4. **Pencegahan Double-Sign atau Perubahan Status Ilegal:** Perjanjian yang sudah ditandatangani salah satu pihak tidak boleh diedit klausulnya tanpa membatalkan penandatanganan awal.
5. **Pelaporan Anonim Warga:** Kanal laporan warga harus melindungi identitas pelapor (opsi anonimitas terenkripsi) untuk mencegah intimidasi di tingkat desa.

---

### Task 1: Scaffolding Fondasi Frontend & Design System
**Files:**
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/components/layout/Navbar.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/types/contract.ts`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: None
- Produces: Komponen navigasi, layout dasar, palet warna integritas/audit, dan tipe data antarmuka kontrak `Contract`, `Clause`, `AuditResult`.

- [ ] **Step 1: Definisikan antarmuka tipe kontrak di `frontend/src/types/contract.ts`**
  Model data untuk status kontrak (`DRAFT`, `AI_AUDITED`, `SIGNED`, `PUBLISHED`), klausul, dan laporan warga.
- [ ] **Step 2: Konfigurasi tema dan token visual di `frontend/src/app/globals.css`**
  Implementasikan styling modern (dark/light, aksen emerald untuk segel integritas, navy blue untuk legalitas).
- [ ] **Step 3: Buat Navbar dan Landing Page informatif di `frontend/src/app/page.tsx`**
  Tampilkan ringkasan platform SAKSI, 7 alur kerja utama, serta tombol aksi cepat (Buat Kontrak, Pantau Progres Warga, Verifikasi Segel).
- [ ] **Step 4: Uji build dan render frontend**
  Run: `npm run build` di direktori `frontend`
  Expected: Build sukses tanpa error TypeScript/Linting.
- [ ] **Step 5: Commit**
  ```bash
  git add frontend/
  git commit -m "feat(frontend): setup initial design system, landing page, and contract types"
  ```

---

### Task 2: Modul Smart Q&A & Wizard Pembuatan Kontrak
**Files:**
- Create: `frontend/src/app/kontrak/baru/page.tsx`
- Create: `frontend/src/components/contract/QuestionnaireWizard.tsx`
- Create: `frontend/src/components/contract/ClauseEditor.tsx`

**Interfaces:**
- Consumes: `Contract` type dari `frontend/src/types/contract.ts`
- Produces: Payloads formulir kuisioner untuk dikirim ke API backend & AI engine.

- [ ] **Step 1: Buat state wizard interaktif di `QuestionnaireWizard.tsx`**
  Pertanyaan terpandu: jenis pekerjaan (infrastruktur desa, pengadaan UMKM, jasa freelancer), pihak pertama & kedua, nilai kontrak, tenggat waktu, dan termin pembayaran.
- [ ] **Step 2: Buat antarmuka penampil & editor klausul di `ClauseEditor.tsx`**
  Menampilkan draft pasal per pasal dengan visualisasi badge status verifikasi AI (Lengkap / Perlu Dilengkapi).
- [ ] **Step 3: Uji interaksi wizard di browser**
  Expected: Navigasi step 1-4 berjalan mulus dengan validasi input wajib.
- [ ] **Step 4: Commit**
  ```bash
  git add frontend/src/app/kontrak/ frontend/src/components/contract/
  git commit -m "feat(frontend): add contract creation wizard and clause editor"
  ```

---

### Task 3: Inisialisasi Backend Golang & Skema Database
**Files:**
- Create: `backend/go.mod`
- Create: `backend/main.go`
- Create: `backend/internal/models/contract.go`
- Create: `backend/internal/models/report.go`
- Create: `backend/internal/database/db.go`

**Interfaces:**
- Consumes: None
- Produces: `contract` table, `audit_log` table, `report` table, REST server HTTP port :8080.

- [ ] **Step 1: Inisialisasi go module `saksi-backend`**
  Run: `go mod init saksi-backend` di direktori `backend`
- [ ] **Step 2: Definisikan skema GORM di `internal/models/contract.go`**
  Field: `ID`, `Title`, `Category`, `PartyA`, `PartyB`, `Value`, `Status`, `DocumentHash`, `SignedAt`, `RedactedContent`.
- [ ] **Step 3: Siapkan koneksi database dan auto-migration di `internal/database/db.go`**
  Dukungan PostgreSQL dengan fallback SQLite untuk kemudahan local testing.
- [ ] **Step 4: Jalankan dan verifikasi backend health check**
  Run: `go run main.go`
  Expected: Log startup server berhasil pada port 8080 dengan endpoint `GET /health` merespons 200 OK.
- [ ] **Step 5: Commit**
  ```bash
  git add backend/
  git commit -m "feat(backend): initialize Go service, database models, and health endpoint"
  ```

---

### Task 4: Layanan Segel Integritas & Verifikasi Hash (Backend)
**Files:**
- Create: `backend/internal/crypto/hasher.go`
- Create: `backend/internal/crypto/hasher_test.go`
- Create: `backend/internal/handlers/contract_handler.go`

**Interfaces:**
- Consumes: Dokumen byte / teks kontrak final
- Produces: `ComputeSHA256(data []byte) string`, endpoint `POST /api/contracts/:id/seal`, endpoint `GET /api/contracts/verify/:hash`.

- [ ] **Step 1: Tulis unit test hash di `hasher_test.go`**
  Uji konsistensi hash SHA-256 dan deteksi perbedaan saat ada tamper data sekecil apapun.
- [ ] **Step 2: Implementasikan modul kriptografi di `hasher.go`**
- [ ] **Step 3: Buat endpoint verifikasi publik `GET /api/contracts/verify/:hash`**
  Memvalidasi apakah hash yang diunggah cocok dengan rekaman hash yang tersegel di database.
- [ ] **Step 4: Jalankan unit test Go**
  Run: `go test ./internal/crypto/... -v`
  Expected: PASS semua test hash dan tamper-resistance.
- [ ] **Step 5: Commit**
  ```bash
  git add backend/internal/crypto backend/internal/handlers
  git commit -m "feat(backend): add cryptographic seal and integrity verification engine"
  ```

---

### Task 5: Layanan AI Engine (Python / FastAPI)
**Files:**
- Create: `ai-engine/requirements.txt`
- Create: `ai-engine/main.py`
- Create: `ai-engine/services/contract_generator.py`
- Create: `ai-engine/services/clause_auditor.py`
- Create: `ai-engine/services/pii_redactor.py`
- Create: `ai-engine/tests/test_audit.py`

**Interfaces:**
- Consumes: Jawaban kuisioner pengguna dari backend
- Produces: Draf klausul hukum terstruktur, skor kelengkapan pasal (checklist audit), dan teks kontrak versi ter-redaksi.

- [ ] **Step 1: Siapkan `requirements.txt` dan FastAPI entrypoint di `main.py`**
  Dependensi: `fastapi`, `uvicorn`, `pydantic`, `pytest`.
- [ ] **Step 2: Implementasikan `clause_auditor.py`**
  Memeriksa keberadaan klausul krusial: hak & kewajiban, penalti keterlambatan, force majeure, penyelesaian sengketa, dan spesifikasi rincian dana.
- [ ] **Step 3: Implementasikan `pii_redactor.py`**
  Menyaring NIK, nomor rekening bank, dan nomor ponsel pribadi dengan token pengganti `[DISAMARKAN]`.
- [ ] **Step 4: Tulis dan jalankan test audit & redaksi**
  Run: `pytest tests/ -v` di direktori `ai-engine`
  Expected: PASS untuk deteksi klausul hilang dan redaksi PII sensitif.
- [ ] **Step 5: Commit**
  ```bash
  git add ai-engine/
  git commit -m "feat(ai-engine): add FastAPI service for contract drafting, clause audit, and PII redaction"
  ```

---

### Task 6: Portal Transparansi Publik Warga & Pelaporan Pelanggaran
**Files:**
- Create: `frontend/src/app/transparansi/page.tsx`
- Create: `frontend/src/app/transparansi/[id]/page.tsx`
- Create: `frontend/src/app/lapor/page.tsx`
- Create: `frontend/src/components/public/IntegrityBadge.tsx`
- Create: `frontend/src/components/public/ReportForm.tsx`

**Interfaces:**
- Consumes: Data kontrak publik berstatus `PUBLISHED` dari backend.
- Produces: Halaman eksplorasi kontrak publik, viewer dokumen ter-redaksi, validator hash langsung di browser (drag & drop file), dan formulir pengaduan warga.

- [ ] **Step 1: Buat halaman penjelajah kontrak publik di `transparansi/page.tsx`**
  Filter berdasarkan desa/instansi, kategori anggaran, dan status progres pekerjaan.
- [ ] **Step 2: Buat komponen verifikasi segel interaktif di `IntegrityBadge.tsx`**
  Pengunjung dapat melihat rekaman hash dan mengunggah salinan dokumen untuk mencocokkan segel secara mandiri.
- [ ] **Step 3: Buat formulir pelaporan warga di `lapor/page.tsx` & `ReportForm.tsx`**
  Dukungan pengunggahan bukti foto/dokumen lapangan, deskripsi ketidaksesuaian kontrak, dan opsi anonimitas pelapor.
- [ ] **Step 4: Uji navigasi portal publik di frontend**
  Expected: Halaman publik dapat diakses tanpa autentikasi admin.
- [ ] **Step 5: Commit**
  ```bash
  git add frontend/src/app/transparansi frontend/src/app/lapor frontend/src/components/public
  git commit -m "feat(frontend): create public transparency portal and citizen reporting channel"
  ```
