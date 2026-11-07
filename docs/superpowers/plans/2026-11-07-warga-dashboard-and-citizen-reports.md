# Warga Dashboard & Citizen Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## 1. Overview & Architectural Context

Fitur ini melengkapi kebutuhan transparansi publik dan partisipasi warga desa pada platform SAKSI. Warga desa (`warga`) yang terautentikasi dapat:
1. Mengakses daftar kontrak yang sedang berjalan atau telah dipublikasikan/selesai di desanya (`GET /api/v1/public/contracts`).
2. Melihat ringkasan detail kontrak beserta klausul-klausul pasalnya (`GET /api/v1/public/contracts/{id}`).
3. Membuat laporan pengaduan masyarakat (`citizen_reports`) atas kontrak desa yang sedang berjalan, lengkap dengan kategori, klausul yang diduga dilanggar, deskripsi, lokasi, dan lampiran foto via multipart/form-data (`POST /api/v1/reports`).
4. Memantau daftar laporan pengaduan miliknya (`GET /api/v1/reports`) dan detail status penanganannya (`GET /api/v1/reports/{id}`).
5. Mengintegrasikan dashboard frontend warga (`WargaHome`, `KontrakListTemplate`, `BuatLaporanTemplate`, `LaporanListTemplate`) dengan endpoint real backend.

---

## 2. File Structure & Responsibilities

### Backend (Go)
| File | Responsibility |
|---|---|
| `backend/internal/domain/models.go` | Domain struct: `CitizenReport`, `ReportStatus`, `ReportAttachment`, `PublicContractDetail`, `PublicClause`. |
| `backend/internal/usecase/ports.go` | Tambahan interface `Store`: `ListPublicContracts`, `GetPublicContractDetail`, `CreateCitizenReport`, `ListCitizenReportsByReporter`, `GetCitizenReportByID`. |
| `backend/internal/adapter/postgres/store_reports.go` | Query Postgres atomic untuk `citizen_reports`, `files`, `report_attachments`, dan filter `public_contracts`. |
| `backend/internal/adapter/postgres/store_reports_test.go` | Integration test Postgres untuk query citizen reports & public contracts. |
| `backend/internal/adapter/http/handlers/public_contracts_handler.go` | HTTP Handlers: `HandleListPublicContracts`, `HandleGetPublicContractDetail`. |
| `backend/internal/adapter/http/handlers/reports_handler.go` | HTTP Handlers: `HandleCreateCitizenReport` (multipart upload foto), `HandleListMyReports`, `HandleGetReportDetail`. |
| `backend/internal/adapter/http/handlers/reports_handler_test.go` | Unit test HTTP handlers untuk public contracts dan citizen reports. |
| `backend/cmd/api/main.go` | Wiring rute `/api/v1/public/contracts` dan `/api/v1/reports`. |

### Documentation & Verification
| File | Responsibility |
|---|---|
| `docs/saksi-api.postman_collection.json` | Sinkronisasi request v2.1.0 untuk seluruh endpoint baru warga & laporan. |

### Frontend (Next.js / TypeScript)
| File | Responsibility |
|---|---|
| `frontend/src/lib/dash/warga-allowed.ts` | Tambahkan rute `/dashboard/kontrak` dan `/dashboard/kontrak/[code]` ke allowlist warga. |
| `frontend/src/lib/dash/nav-for.ts` | Tambahkan menu "Kontrak Desa" pada sidebar navigasi role `warga`. |
| `frontend/src/lib/api/reports.ts` | API client helper untuk memanggil backend `/api/v1/public/contracts` dan `/api/v1/reports`. |
| `frontend/src/components/organisms/WargaHome.tsx` | Hubungkan widget beranda warga dengan data live / endpoint backend. |
| `frontend/src/components/organisms/BuatLaporanTemplate.tsx` | Kirim form laporan (beserta file foto multipart) ke backend `POST /api/v1/reports`. |

---

## 3. Tasks

### Task 1: Domain Models & Store Interfaces for Citizen Reports & Public Contracts
- [x] Update `backend/internal/domain/models.go` dengan enum dan struct:
  - `ReportStatus` (`diterima`, `diverifikasi`, `ditindaklanjuti`, `diteruskan`, `selesai`, `ditolak`)
  - `CitizenReport` (`ID`, `ContractID`, `ContractTitle`, `PelaporUserID`, `KodePelacakan`, `Kategori`, `Deskripsi`, `LokasiLat`, `LokasiLng`, `Status`, `DibuatPada`, `Attachments`, `Actions`)
  - `PublicContractSummary` (`ID`, `Nomor`, `Judul`, `Jenis`, `Nilai`, `Tenggat`, `Status`, `PihakKeduaNama`)
  - `PublicContractDetail` (`PublicContractSummary` + `IsiTeks`, `KlausulList`, `IntegrityScore`)
- [x] Update `backend/internal/usecase/ports.go` dengan method store baru:
  - `ListPublicContracts(ctx context.Context, villageID int64, search string) ([]domain.PublicContractSummary, error)`
  - `GetPublicContractDetail(ctx context.Context, villageID int64, contractID int64) (domain.PublicContractDetail, error)`
  - `CreateCitizenReport(ctx context.Context, r domain.CitizenReport, fileKeys []string) (domain.CitizenReport, error)`
  - `ListCitizenReportsByReporter(ctx context.Context, reporterID int64) ([]domain.CitizenReport, error)`
  - `GetCitizenReportByID(ctx context.Context, reportID int64, requesterID int64, requesterRole domain.UserRole) (domain.CitizenReport, error)`
- [x] Jalankan `go build ./...` di backend untuk memastikan tidak ada compile error.

---

### Task 2: Postgres Store Implementation & Tests (TDD)
- [x] Buat test file `backend/internal/adapter/postgres/store_reports_test.go`:
  - Test `ListPublicContracts` (hanya menampilkan status `dipublikasikan`, `berjalan`, `selesai`).
  - Test `GetPublicContractDetail` (ringkasan + klausul/teks terverifikasi).
  - Test `CreateCitizenReport` (atomic transaction insert ke `citizen_reports`, `files`, dan `report_attachments`).
  - Test `ListCitizenReportsByReporter` dan `GetCitizenReportByID` (memastikan IDOR check dan data konsisten).
- [x] Buat implementasi `backend/internal/adapter/postgres/store_reports.go`:
  - Implementasikan seluruh method interface `ports.go` dengan query SQL native pgx.
  - Generate kode pelacakan unik format `LAP-YYYYMMDD-XXXX`.
- [x] Jalankan test store: `go test -v ./internal/adapter/postgres -run TestReports`
- [x] Commit: `feat(postgres): implement citizen reports and public contracts store`

---

### Task 3: HTTP Handlers for Public Contracts & Citizen Reports
- [x] Buat unit test handler `backend/internal/adapter/http/handlers/reports_handler_test.go`:
  - Test `HandleListPublicContracts` (GET 200 dengan filter village ID warga).
  - Test `HandleGetPublicContractDetail` (GET 200 atau 404 jika belum dipublikasikan).
  - Test `HandleCreateCitizenReport` (POST multipart/form-data dengan validasi input dan lampiran foto).
  - Test `HandleListMyReports` (GET 200 list laporan pelapor).
  - Test `HandleGetReportDetail` (GET 200 detail laporan + masking nama pelapor jika kades/warga lain).
- [x] Buat handler `backend/internal/adapter/http/handlers/public_contracts_handler.go`:
  - `HandleListPublicContracts(d *Deps) http.HandlerFunc`
  - `HandleGetPublicContractDetail(d *Deps) http.HandlerFunc`
- [x] Buat handler `backend/internal/adapter/http/handlers/reports_handler.go`:
  - `HandleCreateCitizenReport(d *Deps) http.HandlerFunc` (handle multipart upload via `d.Storage`).
  - `HandleListMyReports(d *Deps) http.HandlerFunc`
  - `HandleGetReportDetail(d *Deps) http.HandlerFunc`
- [x] Hubungkan rute baru di `backend/cmd/api/main.go`:
  - Protected endpoints under `authMiddleware`:
    - `GET /api/v1/public/contracts`
    - `GET /api/v1/public/contracts/{id}`
    - `POST /api/v1/reports`
    - `GET /api/v1/reports`
    - `GET /api/v1/reports/{id}`
- [x] Jalankan seluruh test handler: `go test -v ./internal/adapter/http/handlers -run "TestPublicContracts|TestCitizenReports"`
- [x] Commit: `feat(api): implement public contracts and citizen reports handlers`

---

### Task 4: Postman Collection Updates
- [x] Update `docs/saksi-api.postman_collection.json`:
  - Tambahkan folder `Public Contracts` (`List Public Contracts`, `Get Public Contract Detail`).
  - Tambahkan folder `Citizen Reports` (`Create Report (Multipart)`, `List My Reports`, `Get Report Detail`).
  - Pastikan menggunakan variable `{{baseUrl}}` dan `{{authToken}}`.
  - Validasi schema JSON v2.1.0.
- [x] Commit: `docs(api): update postman collection with public contracts and reports`

---

### Task 5: Frontend Integration (Allowlist, Navigation, & API Wiring)
- [x] Perbarui `frontend/src/lib/dash/warga-allowed.ts`:
  - Tambahkan path `/dashboard/kontrak` dan matcher `/dashboard/kontrak/:code`.
- [x] Perbarui `frontend/src/lib/dash/nav-for.ts`:
  - Tambahkan nav item `{ label: 'Kontrak Desa', href: '/dashboard/kontrak', icon: 'file' }` untuk role `warga`.
- [x] Buat API client `frontend/src/lib/api/reports.ts`:
  - Fungsi `fetchPublicContracts(token: string)`
  - Fungsi `fetchPublicContractDetail(token: string, id: string)`
  - Fungsi `submitCitizenReport(token: string, formData: FormData)`
  - Fungsi `fetchMyReports(token: string)`
- [x] Integrasikan `frontend/src/components/organisms/BuatLaporanTemplate.tsx`:
  - Panggil `submitCitizenReport` saat submit laporan.
  - Tampilkan kode pelacakan hasil response API backend.
- [x] Integrasikan `frontend/src/components/organisms/WargaHome.tsx`:
  - Tampilkan total laporan riil dan daftar kontrak berjalan terkini.
- [x] Jalankan build frontend: `npm run build` di folder `frontend` untuk memverifikasi type-safety.
- [x] Commit: `feat(frontend): integrate warga contract browsing and report submission`

---

### Task 6: Verification & Knowledge Graph Sync
- [x] Uji alur end-to-end via curl/backend:
  - Login sebagai warga (`budi.santoso@warga.id`).
  - Ambil list kontrak publik desa `GET /api/v1/public/contracts`.
  - Kirim laporan pengaduan `POST /api/v1/reports` dengan multipart body.
  - Ambil list laporan pelapor `GET /api/v1/reports`.
- [x] Perbarui knowledge graph: `/graphify update`.
- [x] Verifikasi status git clean dan siap untuk review.

