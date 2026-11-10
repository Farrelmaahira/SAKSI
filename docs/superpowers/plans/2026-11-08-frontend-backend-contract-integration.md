# Frontend & Backend Contract Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengintegrasikan seluruh siklus hidup kontrak (pembuatan wizard, daftar, detail, ulasan rekanan, tanda tangan digital, dan segel dokumen) pada antarmuka Frontend Next.js dengan Backend API Go PostgreSQL.

**Architecture:** Membangun API client terpusat di `frontend/src/lib/api/contracts.ts` yang menangani bearer token auth, normalisasi tipe data PostgreSQL ke model UI, dan graceful fallback ke local in-memory store saat backend offline. Komponen organisms Next.js diperbarui untuk memanggil API client secara asinkron dengan loading state dan feedback error yang jelas.

**Tech Stack:** Next.js 16 (React 19 / Turbopack), TypeScript, TailwindCSS, Go 1.22+, PostgreSQL 16.

---

## Global Constraints

- Backend base URL mengacu pada `process.env.NEXT_PUBLIC_API_URL` dengan default `http://localhost:8080/api/v1`.
- Header Authorization wajib menyertakan `Bearer <token>` yang diambil dari `localStorage.getItem('saksi:token')`.
- Semua pemanggilan API harus memiliki error handling dan fallback graceful agar UI tidak blank saat backend tidak dapat dihubungi.
- Tidak mengubah skema data tabel PostgreSQL yang sudah berjalan.
- Kode frontend harus lolos `npx tsc --noEmit` tanpa type error.

## Review Focus

- Token kadaluwarsa atau hilang: UI menampilkan pesan autentikasi atau mengarahkan ke halaman login.
- Normalisasi ID numeric (PostgreSQL) ke string (UI slug): menghindari runtime TypeError pada data desa dan rekanan.
- Upload sketch tanda tangan: validasi ukuran file maksimal 2 MB format PNG/JPEG.
- Auto-seal bilateral: perubahan status kontrak otomatis menjadi `ditandatangani` saat kedua pihak selesai menandatangani.
- Format mata uang dan tanggal: penyeragaman format `formatRp` dan `fmtDate`.

---

## Tasks

### Task 1: Contract API Client (`frontend/src/lib/api/contracts.ts`)

**Files:**

- Create: `frontend/src/lib/api/contracts.ts`

- [ ] Definisikan interface TypeScript untuk payload dan response:
  - `ContractOptionItem`, `ContractOptionsResponse`
  - `CounterpartyResponse`
  - `WizardPreviewPayload`, `WizardPreviewResponse`
  - `CreateContractPayload`, `CreateContractResponse`
  - `ContractListItem`, `ContractDetailResponse`, `ContractLifecycleResponse`
  - `SubmitReviewPayload`, `SignContractResponse`, `DashboardMetricsResponse`
- [ ] Implementasikan helper token autentikasi `getAuthHeader()`.
- [ ] Implementasikan fungsi API:
  - `fetchContractOptions()`: `GET /contracts/options`
  - `fetchCounterparties(jenis?: string, search?: string)`: `GET /counterparties`
  - `previewContractWizard(payload)`: `POST /contracts/wizard/preview`
  - `createContractAPI(payload)`: `POST /contracts`
  - `fetchContractsAPI(query?: string)`: `GET /contracts`
  - `fetchContractDetailAPI(id: number | string)`: `GET /contracts/{id}`
  - `fetchContractLifecycleAPI(id: number | string)`: `GET /contracts/{id}/lifecycle`
  - `submitContractReviewAPI(id: number | string, payload)`: `POST /contracts/{id}/reviews`
  - `signContractAPI(id: number | string, formDataOrJSON)`: `POST /contracts/{id}/sign`
  - `fetchDashboardMetricsAPI()`: `GET /dashboard/metrics`
- [ ] Verifikasi kompilasi: `cmd.exe /c "npx tsc --noEmit"`

---

### Task 2: Integrasi Wizard Pembuatan Kontrak (`BuatKontrakTemplate.tsx`)

**Files:**

- Modify: `frontend/src/components/organisms/BuatKontrakTemplate.tsx`

- [ ] Muat opsi rekanan dari API `fetchCounterparties()` di Langkah 1 dengan fallback ke `counterpartyStore`.
- [ ] Pada Langkah 3 (Draf & Audit), panggil `previewContractWizard()` untuk mendapatkan skor kepatuhan aturan dan teks SPK riil.
- [ ] Pada Langkah 4 (Finalisasi / Terbitkan Kontrak), panggil `createContractAPI()` untuk menyimpan kontrak ke PostgreSQL.
- [ ] Simpan juga salinan snapshot ke store lokal jika diperlukan untuk persistensi instan.
- [ ] Tambahkan indikator loading saat pengiriman kontrak ke server.
- [ ] Verifikasi kompilasi: `cmd.exe /c "npx tsc --noEmit"`

---

### Task 3: Integrasi Daftar Kontrak (`KontrakListTemplate.tsx`)

**Files:**

- Modify: `frontend/src/components/organisms/KontrakListTemplate.tsx`

- [ ] Gunakan `useEffect` untuk memuat daftar kontrak desa dari `fetchContractsAPI()`.
- [ ] Gabungkan data API dengan data seed lokal sebagai fallback saat offline.
- [ ] Tampilkan status kontrak riil dari database (`draf`, `diaudit`, `ditinjau`, `ditandatangani`).
- [ ] Tambahkan indikator loading state dan pencarian query yang terhubung ke backend.
- [ ] Verifikasi kompilasi: `cmd.exe /c "npx tsc --noEmit"`

---

### Task 4: Integrasi Detail Kontrak & Lifecycle Tab (`KontrakDetailTemplate.tsx` & Tab)

**Files:**

- Modify: `frontend/src/components/organisms/KontrakDetailTemplate.tsx`
- Modify: `frontend/src/components/organisms/TandaTanganTab.tsx`
- Modify: `frontend/src/components/organisms/RingkasanTab.tsx`

- [ ] Ambil data kontrak aktif via `fetchContractDetailAPI` dan `fetchContractLifecycleAPI`.
- [ ] Pada `RingkasanTab.tsx`: Tampilkan daftar ulasan rekanan dan tombol ulasan untuk peran Penyedia (`POST /contracts/{id}/reviews`).
- [ ] Pada `TandaTanganTab.tsx`: Sambungkan pembubuhan tanda tangan Kades dan Penyedia ke `signContractAPI()` (mengirim gambar sketch kanvas atau mode simulasi).
- [ ] Tampilkan lencana segel resmi SHA-256 dan tx hash saat kontrak berstatus `ditandatangani`.
- [ ] Verifikasi kompilasi: `cmd.exe /c "npx tsc --noEmit"`

---

### Task 5: Integrasi Dashboard Beranda (`DashHomeTemplate.tsx`)

**Files:**

- Modify: `frontend/src/components/organisms/DashHomeTemplate.tsx`

- [ ] Muat metrik statistik riil menggunakan `fetchDashboardMetricsAPI()`.
- [ ] Perbarui kartu metrik: Kontrak Aktif, Realisasi Anggaran (Rp), Kontrak Menunggu Review, Kontrak Tersegel, dan Indeks Integritas.
- [ ] Tambahkan penanganan fallback jika metrik belum terisi.
- [ ] Verifikasi kompilasi: `cmd.exe /c "npx tsc --noEmit"`

---

### Task 6: Pengujian E2E & Sinkronisasi Akhir

- [ ] Uji alur lengkap di browser:
  1. Login Kades -> Dashboard menampilkan metrik riil.
  2. Buka form kontrak baru -> Isi form -> Simpan kontrak ke PostgreSQL.
  3. Buka daftar kontrak -> Kontrak baru muncul dari backend.
  4. Login Penyedia -> Beri ulasan setuju -> TTD Penyedia.
  5. Login Kades -> TTD Kades -> Segel SHA-256 terbit otomatis.
- [ ] Jalankan `cmd.exe /c "npx tsc --noEmit"` untuk memastikan 0 type errors.
- [ ] Commit perubahan ke Git branch.
