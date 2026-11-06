# Pembuatan Kontrak Role Kepala Desa (Wizard & Lifecycle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun API pembuatan kontrak untuk role Kepala Desa (`kades`) dengan alur wizard multi-tahap (pilihan jenis kontrak, pemilihan vendor pihak kedua, kuesioner dinamis AI dengan fallback, pratinjau draf & audit, dan persistensi multi-tabel atomik ke database PostgreSQL).

**Architecture:** Menerapkan Clean Architecture (Hexagonal). Domain entities merepresentasikan kontrak dan counterparty sesuai skema database `SAKSI.sql`. Service use case menyediakan fallback generator pertanyaan, perenderan draf kontrak baku, dan rule-based auditor jika AI Engine offline. Persistensi multi-tabel (`contracts`, `contract_parties`, `contract_versions`, `ai_audits`, `contract_status_history`) dieksekusi atomik dalam transaksi `pgx.Tx`.

**Tech Stack:** Go 1.22+, PostgreSQL 16, pgx/v5 (pgxpool), crypto/sha256, HTTP ServeMux (Go 1.22+ method-path routing).

**Spec:** [`docs/PRD.md`](file:///d:/Farrel/PROJECTS/SAKSI/docs/PRD.md) dan [`backend/scripts/SAKSI.sql`](file:///d:/Farrel/PROJECTS/SAKSI/backend/scripts/SAKSI.sql).

## Global Constraints

- Skema database mengikuti tabel di [`backend/scripts/SAKSI.sql`](file:///d:/Farrel/PROJECTS/SAKSI/backend/scripts/SAKSI.sql) (`contracts`, `contract_parties`, `contract_versions`, `ai_audits`, `contract_status_history`, `counterparties`).
- Seluruh ID menggunakan tipe `BIGINT` (Go: `int64`).
- Hak akses pembuatan kontrak dibatasi ketat hanya untuk role `kades` (Perangkat Desa) dengan `village_id` yang terikat pada desa bersangkutan (`403 Forbidden` untuk role selain kades).
- Jenis kontrak wajib valid sesuai `contracts_jenis_enum`: `'pengadaan'`, `'hibah'`, `'kerja_sama_bumdes'`, `'sewa_aset'`, `'umkm'`.
- Status awal kontrak adalah `'diaudit'` jika audit otomatis berjalan sukses, atau `'draf'` jika belum diaudit.
- Seluruh penulisan entitas kontrak baru ke tabel `contracts`, `contract_parties`, `contract_versions`, `ai_audits`, dan `contract_status_history` wajib berada dalam 1 database transaction (`pgx.Tx`).
- Jika AI Engine tidak tersedia/gagal, sistem wajib menggunakan **fallback internal** (template pertanyaan, perender draf SPK otomatis, dan audit heuristik klausul wajib).
- Koleksi Postman di [`docs/saksi-api.postman_collection.json`](file:///d:/Farrel/PROJECTS/SAKSI/docs/saksi-api.postman_collection.json) wajib diperbarui untuk mencakup seluruh endpoint baru.

## Review Focus

1. **Role & Village Authorization Enforcement:** Upaya membuat kontrak oleh role non-kades (misal `warga`, `penyedia`, `bpd`) atau kades tanpa `village_id` wajib ditolak dengan HTTP 403 Forbidden.
2. **Atomic Rollback on Failure:** Jika penyimpanan salah satu tabel (misal `contract_parties` atau `ai_audits`) gagal, transaksi dibatalkan sepenuhnya tanpa menyisakan row di `contracts`.
3. **Counterparty & Village Validation:** Pihak kedua (`counterparty_id`) yang dipilih harus ada di tabel `counterparties`. Jika ID tidak ditemukan, kembalikan HTTP 400 Bad Request.
4. **Resilient AI Fallback:** Ketika AI Engine tidak terhubung, endpoint pertanyaan wizard, pratinjau draf, dan audit tetap berjalan normal menggunakan generator bawaan tanpa mengembalikan error 500.
5. **SHA-256 Document Integrity:** Draf teks kontrak wajib dihitung hash SHA-256 hex string dan disimpan di tabel `ai_audits` sebagai landasan segel integritas.

---

### Task 1: Domain Entities & AI Fallback Service

**Files:**
- Modify: `backend/internal/domain/models.go`
- Create: `backend/internal/usecase/contract_wizard.go`
- Create: `backend/internal/usecase/contract_wizard_test.go`

- [x] **Step 1: Tulis unit test untuk Fallback Wizard & Auditor**
Buat `backend/internal/usecase/contract_wizard_test.go` yang menguji:
  - `GenerateWizardQuestions` untuk jenis `pengadaan`, `hibah`, `kerja_sama_bumdes`, `sewa_aset` menghasilkan field pertanyaan yang valid (key, label, type, required).
  - `RenderContractDraft` menghasilkan teks SPK lengkap berpasal-pasal yang menyertakan nama kades, nama desa, nama vendor, nilai, dan termin.
  - `AuditContractDraft` menghitung compliance score, total klausul wajib, dan hash SHA-256 yang valid.

- [x] **Step 2: Jalankan test dan pastikan gagal (merah)**
Jalankan `cd backend; go test -v ./internal/usecase/...` dan pastikan compiler error karena tipe/fungsi belum ada.

- [x] **Step 3: Definisikan model domain kontrak dan counterparty di `models.go`**
  - Tambahkan tipe `ContractJenis`:
    ```go
    type ContractJenis string

    const (
        JenisPengadaan       ContractJenis = "pengadaan"
        JenisHibah           ContractJenis = "hibah"
        JenisKerjaSamaBUMDes ContractJenis = "kerja_sama_bumdes"
        JenisSewaAset        ContractJenis = "sewa_aset"
        JenisUMKM            ContractJenis = "umkm"
    )
    ```
  - Tambahkan model `Counterparty`:
    ```go
    type Counterparty struct {
        ID      int64   `json:"id"`
        UserID  *int64  `json:"userId,omitempty"`
        Nama    string  `json:"nama"`
        Jenis   string  `json:"jenis"`
        NPWP    string  `json:"npwp,omitempty"`
        Alamat  string  `json:"alamat,omitempty"`
    }
    ```
  - Tambahkan struct untuk Wizard: `WizardQuestion`, `WizardQuestionOption`, `ContractDraftPreview`, `ContractDetail`.

- [x] **Step 4: Implementasikan `contract_wizard.go`**
  - Buat fungsi:
    - `GenerateWizardQuestions(jenis domain.ContractJenis, vendorName string) []domain.WizardQuestion`
    - `RenderContractDraft(params CreateContractDraftParams) (string, error)`
    - `AuditContractDraft(contractText string) (score float64, fulfilled int, total int, summary string, hash string)`

- [x] **Step 5: Jalankan test kembali dan pastikan lulus (hijau)**
Jalankan `cd backend; go test -v ./internal/usecase -run TestWizard` dan pastikan semua test lulus.

- [x] **Step 6: Commit Task 1**
Commit dengan pesan: `feat(contracts): implement contract wizard domain models and fallback engine`.

---

### Task 2: Store Interface & PostgreSQL Atomic Persistence

**Files:**
- Modify: `backend/internal/usecase/ports.go`
- Create: `backend/internal/adapter/postgres/store_contracts.go`
- Test: `backend/internal/adapter/postgres/store_contracts_test.go`

- [x] **Step 1: Perbarui interface `Store` di `ports.go`**
Tambahkan method ke interface `Store`:
  - `ListCounterparties(ctx context.Context, jenis *string, search string) ([]domain.Counterparty, error)`
  - `CounterpartyByID(ctx context.Context, id int64) (domain.Counterparty, error)`
  - `CreateContractWithDetails(ctx context.Context, p CreateContractParams) (domain.ContractDetail, error)`
  - `GetContractDetail(ctx context.Context, id int64) (domain.ContractDetail, error)`
Definisikan struct `CreateContractParams`:
  - `VillageID int64`, `CounterpartyID int64`, `Jenis domain.ContractJenis`, `Judul string`, `Nilai float64`, `Tenggat time.Time`, `SkemaPembayaran string`, `MetodePemilihan string`, `JawabanForm map[string]any`, `IsiTeks string`, `CreatedBy int64`, `IntegrityScore float64`, `SHA256Hash string`.

- [x] **Step 2: Implementasikan `store_contracts.go`**
  - Implementasikan `ListCounterparties` dengan query:
    ```sql
    SELECT id, user_id, nama, jenis, coalesce(npwp, ''), coalesce(alamat, '')
    FROM counterparties WHERE ($1::text IS NULL OR jenis = $1) AND ($2::text = '' OR nama ILIKE $2)
    ORDER BY nama ASC;
    ```
  - Implementasikan `CounterpartyByID`.
  - Implementasikan `CreateContractWithDetails` menggunakan `pgx.Tx`:
    1. `INSERT INTO contracts (village_id, jenis, judul, nilai, tenggat, skema_pembayaran, metode_pemilihan, status, dibuat_oleh, dibuat_pada) VALUES (...) RETURNING id, dibuat_pada;`
    2. `INSERT INTO contract_parties (contract_id, peran_pihak, village_id, user_id) VALUES ($1, 'pertama', $2, $3);` (Pihak Pertama Desa)
    3. `INSERT INTO contract_parties (contract_id, peran_pihak, counterparty_id, user_id) VALUES ($1, 'kedua', $2, $3);` (Pihak Kedua Rekanan)
    4. `INSERT INTO contract_versions (contract_id, nomor_versi, jawaban_form, isi, sumber, dibuat_oleh, dibuat_pada) VALUES ($1, 1, $2, $3, 'ai', $4, now()) RETURNING id;`
    5. `INSERT INTO ai_audits (version_id, skor_integritas, status, hash) VALUES ($1, $2, 'selesai', $3);`
    6. `INSERT INTO contract_status_history (contract_id, status_ke, aktor_user_id, waktu) VALUES ($1, 'diaudit', $2, now());`
    7. `tx.Commit(ctx)`.
  - Implementasikan `GetContractDetail` membaca join `contracts`, `contract_parties`, `contract_versions`, dan `ai_audits`.

- [x] **Step 3: Buat test transaksi kontrak**
Uji pembuatan kontrak di `store_contracts_test.go` (mock atau integration against db).

- [x] **Step 4: Jalankan test dan pastikan lulus**
Jalankan `cd backend; go test -v ./internal/adapter/postgres/...`.

- [x] **Step 5: Commit Task 2**
Commit dengan pesan: `feat(postgres): implement atomic CreateContractWithDetails matching SAKSI schema`.

---

### Task 3: DTOs & HTTP Handlers Pembuatan Kontrak

**Files:**
- Modify: `backend/internal/adapter/http/handlers/contracts_handler.go`
- Create: `backend/internal/adapter/http/handlers/counterparties_handler.go`
- Modify: `backend/internal/adapter/http/handlers/contracts_handler_test.go`

- [x] **Step 1: Tulis unit test handler wizard di `contracts_handler_test.go`**
  - `GET /contracts/options` -> 200 (daftar enum jenis kontrak).
  - `POST /contracts/wizard/questions` -> 200 (daftar pertanyaan kuesioner sesuai jenis).
  - `POST /contracts/wizard/preview` -> 200 (pratinjau draf teks SPK dan skor audit).
  - `POST /contracts` oleh role non-kades (misal `warga`) -> 403 Forbidden.
  - `POST /contracts` oleh `kades` dengan payload lengkap -> 201 Created (mengembalikan detail kontrak & skor integritas).

- [x] **Step 2: Definisikan DTO baru di `contracts_handler.go`**
  - `ContractOptionsResponse`
  - `WizardQuestionsRequest` & `WizardQuestionsResponse`
  - `WizardPreviewRequest` & `WizardPreviewResponse`
  - `CreateContractPayload`:
    ```go
    type CreateContractPayload struct {
        CounterpartyID   int64                  `json:"counterpartyId"`
        Jenis            string                 `json:"jenis"`
        Judul            string                 `json:"judul"`
        Nilai            float64                `json:"nilai"`
        Tenggat          string                 `json:"tenggat"` // "YYYY-MM-DD"
        SkemaPembayaran  string                 `json:"skemaPembayaran"`
        MetodePemilihan  string                 `json:"metodePemilihan"`
        JawabanForm      map[string]any         `json:"jawabanForm"`
        DrafTeksOverride string                 `json:"drafTeksOverride,omitempty"`
    }
    ```

- [x] **Step 3: Implementasikan Handlers**
  - Di `contracts_handler.go`:
    - `HandleGetContractOptions(d *Deps) http.HandlerFunc`
    - `HandleWizardQuestions(d *Deps) http.HandlerFunc`
    - `HandleWizardPreview(d *Deps) http.HandlerFunc`
    - `HandleCreateContractWizard(d *Deps) http.HandlerFunc` (memvalidasi `role == RoleKades`, `villageId != nil`, mengambil vendor via `CounterpartyByID`, render & audit draft, memanggil `CreateContractWithDetails`).
  - Di `counterparties_handler.go`:
    - `HandleListCounterparties(d *Deps) http.HandlerFunc` (mengambil daftar rekanan dengan search & jenis filter).

- [x] **Step 4: Jalankan test handler**
Jalankan `cd backend; go test -v ./internal/adapter/http/handlers/...` dan pastikan seluruh test lulus.

- [x] **Step 5: Commit Task 3**
Commit dengan pesan: `feat(http): implement contract wizard and counterparties handlers`.

---

### Task 4: Route Wiring & Postman Collection Sync

**Files:**
- Modify: `backend/cmd/api/main.go`
- Modify: `docs/saksi-api.postman_collection.json`

- [x] **Step 1: Registrasi rute baru di `main.go`**
  Tambahkan rute terproteksi:
  ```go
  mux.Handle("GET /api/v1/contracts/options", authMiddleware(handlers.HandleGetContractOptions(deps)))
  mux.Handle("GET /api/v1/counterparties", authMiddleware(handlers.HandleListCounterparties(deps)))
  mux.Handle("POST /api/v1/contracts/wizard/questions", authMiddleware(handlers.HandleWizardQuestions(deps)))
  mux.Handle("POST /api/v1/contracts/wizard/preview", authMiddleware(handlers.HandleWizardPreview(deps)))
  mux.Handle("POST /api/v1/contracts", authMiddleware(handlers.HandleCreateContractWizard(deps)))
  ```

- [x] **Step 2: Perbarui file koleksi Postman di `docs/saksi-api.postman_collection.json`**
  - Tambahkan folder/request:
    1. `GET /contracts/options`
    2. `GET /counterparties`
    3. `POST /contracts/wizard/questions` (contoh payload jenis: `pengadaan`)
    4. `POST /contracts/wizard/preview` (contoh payload jawaban form)
    5. `POST /contracts` (alur lengkap simpan kontrak kades)
  - Validasi integritas JSON skema v2.1.0 dengan `ConvertFrom-Json`.

- [x] **Step 3: Jalankan verifikasi build lokal**
Jalankan `cd backend; go build ./cmd/api` dan pastikan kompilasi sukses tanpa error.

- [x] **Step 4: Commit Task 4**
Commit dengan pesan: `feat(api): wire wizard routes and update postman collection`.

---

### Task 5: Live Verification & End-to-End Testing

**Files:**
- Test: Manual live cURL test against Docker container
- Modify: `docs/superpowers/plans/2026-11-06-kades-contract-creation-api.md` (Update task status)

- [x] **Step 1: Rebuild container backend**
Jalankan `docker compose up -d --build backend`. Pastikan container `saksi-backend-1` berjalan sehat.

- [x] **Step 2: Jalankan live E2E test skenario pembuatan kontrak via cURL**
  - **Uji 1:** Login sebagai Kades (`kades.sukamaju@desa.id`) dan ambil `authToken`.
  - **Uji 2:** `GET /api/v1/contracts/options` $\rightarrow$ periksa opsi jenis kontrak (`pengadaan`, `hibah`, dll.).
  - **Uji 3:** `GET /api/v1/counterparties` $\rightarrow$ periksa vendor ID (misal vendor PT Maju ID 1/2).
  - **Uji 4:** `POST /api/v1/contracts/wizard/questions` $\rightarrow$ verifikasi form pertanyaan dinamis dikembalikan.
  - **Uji 5:** `POST /api/v1/contracts/wizard/preview` $\rightarrow$ kirim jawaban form, verifikasi teks draf SPK & skor audit dihasilkan.
  - **Uji 6:** `POST /api/v1/contracts` oleh role non-kades (Warga) $\rightarrow$ pastikan ditolak `403 Forbidden`.
  - **Uji 7:** `POST /api/v1/contracts` oleh Kades $\rightarrow$ pastikan `201 Created` dengan ID kontrak baru.

- [x] **Step 3: Verifikasi persistensi database PostgreSQL**
Periksa record langsung di tabel PostgreSQL:
  ```bash
  docker compose exec -T postgres psql -U postgres -d saksi -c "SELECT id, village_id, jenis, judul, nilai, status FROM contracts;"
  docker compose exec -T postgres psql -U postgres -d saksi -c "SELECT contract_id, peran_pihak, village_id, counterparty_id FROM contract_parties;"
  docker compose exec -T postgres psql -U postgres -d saksi -c "SELECT contract_id, nomor_versi, sumber FROM contract_versions;"
  docker compose exec -T postgres psql -U postgres -d saksi -c "SELECT version_id, skor_integritas, hash, status FROM ai_audits;"
  docker compose exec -T postgres psql -U postgres -d saksi -c "SELECT contract_id, status_ke, aktor_user_id FROM contract_status_history;"
  ```

- [x] **Step 4: Update plan & commit akhir**
Tandai seluruh checkbox sebagai selesai dan commit.

