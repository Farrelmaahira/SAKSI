# Plan: Contract Lifecycle API

**Date:** 2026-11-08  
**Branch:** `feat/backend-saksi`  
**Author:** Antigravity (AI pair programmer)  
**Status:** Awaiting Approval

---

## Overview

Menambahkan 4 endpoint baru untuk siklus hidup pembuatan kontrak bilateral antara Kepala Desa (kades) dan Vendor/Penyedia. Semua audit menggunakan rule-based engine (`usecase.AuditContractDraft()`), **tanpa AI engine**.

Scope: dari revisi draf → review penyedia → tanda tangan → auto-seal.  
**Bukan scope ini:** SPK, termin pembayaran.

### Endpoint Baru

| Method | Path | Handler | Role |
|--------|------|---------|------|
| `PUT` | `/api/v1/contracts/{id}` | `HandleReviseContract` | kades |
| `GET` | `/api/v1/contracts/{id}/lifecycle` | `HandleGetContractLifecycle` | kades, penyedia, bpd, inspektorat |
| `POST` | `/api/v1/contracts/{id}/reviews` | `HandleSubmitContractReview` | penyedia |
| `POST` | `/api/v1/contracts/{id}/sign` | `HandleSignContract` | kades, penyedia |

### File yang Dibuat / Dimodifikasi

| Aksi | File |
|------|------|
| **Dibuat** | `backend/internal/handlers/contract_lifecycle_handler.go` |
| **Dibuat** | `backend/internal/handlers/contract_lifecycle_handler_test.go` |
| **Dibuat** | `backend/internal/adapter/postgres/store_lifecycle.go` |
| **Dibuat** | `backend/internal/adapter/postgres/store_lifecycle_test.go` |
| **Dimodifikasi** | `backend/internal/domain/models.go` |
| **Dimodifikasi** | `backend/internal/usecase/ports.go` |
| **Dimodifikasi** | `backend/cmd/api/main.go` |
| **Dimodifikasi** | `docs/saksi-api.postman_collection.json` |

---

## Background & Constraints

### API yang Sudah Ada (tidak diubah/diduplikasi)

- `GET /api/v1/contracts/options` → `HandleGetContractOptions`
- `POST /api/v1/contracts/wizard/questions` → `HandleWizardQuestions`
- `POST /api/v1/contracts/wizard/preview` → `HandleWizardPreview` (rule audit sudah ada)
- `POST /api/v1/contracts` → `HandleCreateContractWizard`
- `GET /api/v1/contracts` → `HandleListContracts`
- `GET /api/v1/contracts/{id}` → `HandleGetContract`
- `POST /api/v1/contracts/audit` → `HandleAuditContract`

### Tabel Relevan (SAKSI.sql, belum ter-expose)

- `contract_versions` — nomor_versi, jawaban_form (JSONB), isi (JSONB), sumber
- `contract_reviews` — version_id, party_id, komentar, status: `"disetujui"/"perlu_revisi"`
- `signatures` — version_id, party_id, signer_user_id, metode: `"simulasi"/"psre"`, referensi (file_id)
- `document_seals` — version_id, file_id, sha256, waktu_segel, chain
- `contract_parties` — contract_id, peran_pihak: `"pertama"/"kedua"`, village_id, counterparty_id, user_id

### Status Kontrak (SAKSI.sql enum — ground truth)

```
draf | diaudit | peninjauan | ditandatangani | dibatalkan | dipublikasikan
```

> **Mismatch:** `models.go` saat ini menggunakan `draft`, `under_review`, `audit_complete`, `sealed` — perlu disesuaikan di Task 1.

---

## Tasks

### Task 1 — Domain Models

**File:** `backend/internal/domain/models.go`

**Tujuan:** Tambah struct baru & perbaiki status enum agar aligned dengan SAKSI.sql.

**Perubahan:**

1. Update konstanta status kontrak:

```go
const (
    StatusDraft       = "draf"
    StatusAudited     = "diaudit"
    StatusInReview    = "peninjauan"
    StatusSigned      = "ditandatangani"
    StatusCancelled   = "dibatalkan"
    StatusPublished   = "dipublikasikan"
)
```

2. Tambah struct:

```go
type ContractVersion struct {
    ID          uuid.UUID       `json:"id"`
    ContractID  uuid.UUID       `json:"contract_id"`
    NomorVersi  int             `json:"nomor_versi"`
    JawabanForm json.RawMessage `json:"jawaban_form"`
    Isi         json.RawMessage `json:"isi"`
    Sumber      string          `json:"sumber"` // "wizard" | "revisi"
    CreatedAt   time.Time       `json:"created_at"`
}

type ContractReview struct {
    ID        uuid.UUID `json:"id"`
    VersionID uuid.UUID `json:"version_id"`
    PartyID   uuid.UUID `json:"party_id"`
    Komentar  string    `json:"komentar"`
    Status    string    `json:"status"` // "disetujui" | "perlu_revisi"
    CreatedAt time.Time `json:"created_at"`
}

type Signature struct {
    ID          uuid.UUID `json:"id"`
    VersionID   uuid.UUID `json:"version_id"`
    PartyID     uuid.UUID `json:"party_id"`
    SignerUserID uuid.UUID `json:"signer_user_id"`
    Metode      string    `json:"metode"` // "simulasi" | "psre"
    Referensi   string    `json:"referensi"` // file_id dari storage
    CreatedAt   time.Time `json:"created_at"`
}

type DocumentSeal struct {
    ID        uuid.UUID `json:"id"`
    VersionID uuid.UUID `json:"version_id"`
    FileID    string    `json:"file_id"`
    SHA256    string    `json:"sha256"`
    WaktuSegel time.Time `json:"waktu_segel"`
    Chain     string    `json:"chain"`
}
```

**Verifikasi:** `go build ./...` harus bersih.

---

### Task 2 — Store Interface & Params

**File:** `backend/internal/usecase/ports.go`

**Tujuan:** Daftarkan method baru di interface `Store`.

**Tambah params:**

```go
type ReviseContractParams struct {
    ContractID  uuid.UUID
    KadesUserID uuid.UUID
    JawabanForm json.RawMessage // jawaban wizard baru
}

type SubmitReviewParams struct {
    ContractID   uuid.UUID
    VendorUserID uuid.UUID
    Komentar     string
    Status       string // "disetujui" | "perlu_revisi"
}

type SignContractParams struct {
    ContractID uuid.UUID
    UserID     uuid.UUID
    ImageBytes []byte
    Metode     string // "simulasi" | "psre"
}
```

**Tambah method ke interface `Store`:**

```go
ReviseContract(ctx context.Context, p ReviseContractParams) (*domain.ContractVersion, error)
SubmitContractReview(ctx context.Context, p SubmitReviewParams) (*domain.ContractReview, error)
SignContract(ctx context.Context, p SignContractParams) (*domain.Signature, error)
GetContractLifecycleDetail(ctx context.Context, contractID, callerUserID uuid.UUID) (*domain.ContractLifecycleDetail, error)
```

**Tambah aggregate response type ke `domain/models.go`:**

```go
type ContractLifecycleDetail struct {
    Contract   Contract          `json:"contract"`
    Version    ContractVersion   `json:"current_version"`
    Versions   []ContractVersion `json:"versions"`
    Reviews    []ContractReview  `json:"reviews"`
    Signatures []Signature       `json:"signatures"`
    Seal       *DocumentSeal     `json:"seal,omitempty"`
}
```

**Verifikasi:** `go build ./...` harus bersih; interface check `var _ usecase.Store = (*Store)(nil)` di `store.go` akan gagal sampai Task 3 selesai.

---

### Task 3 — Store: ReviseContract (atomik)

**File baru:** `backend/internal/adapter/postgres/store_lifecycle.go`

**Tujuan:** Implementasi `ReviseContract` — validasi status, increment version, re-audit rule-based, update status ke `"diaudit"`.

**Pseudocode:**

```
BEGIN TRANSACTION
  1. SELECT status FROM contracts WHERE id = p.ContractID FOR UPDATE
     → error jika status bukan "draf" | "peninjauan" | "perlu_revisi"
  2. SELECT MAX(nomor_versi) FROM contract_versions WHERE contract_id = p.ContractID
  3. Jalankan usecase.AuditContractDraft(ctx, p.JawabanForm) → isi JSONB
  4. INSERT INTO contract_versions (contract_id, nomor_versi, jawaban_form, isi, sumber)
     VALUES (p.ContractID, maxVersi+1, p.JawabanForm, auditResult, 'revisi')
     RETURNING *
  5. UPDATE contracts SET status = 'diaudit', updated_at = NOW() WHERE id = p.ContractID
COMMIT
```

**Guard:** Jika status saat ini `"ditandatangani"` atau `"dipublikasikan"` → return error `ErrContractNotEditable`.

**Verifikasi:** `go test ./backend/internal/adapter/postgres/... -run TestReviseContract`

---

### Task 4 — Store: SubmitContractReview + SignContract + Auto-Seal

**File:** `backend/internal/adapter/postgres/store_lifecycle.go` (sambung Task 3)

#### 4a. SubmitContractReview

```
BEGIN TRANSACTION
  1. Resolve party_id: JOIN contract_parties → counterparties WHERE user_id = p.VendorUserID
  2. INSERT INTO contract_reviews (version_id, party_id, komentar, status)
     (ambil version_id dari versi terbaru kontrak ini)
  3. Jika p.Status = "perlu_revisi":
       UPDATE contracts SET status = 'peninjauan' WHERE id = p.ContractID
     Jika p.Status = "disetujui":
       UPDATE contracts SET status = 'peninjauan' WHERE id = p.ContractID
       -- status 'ditandatangani' baru set saat kedua pihak sign
COMMIT
```

#### 4b. SignContract

```
BEGIN TRANSACTION
  1. Resolve party_id untuk caller (kades: peran_pihak = 'pertama'; penyedia: 'kedua')
  2. Simpan gambar TTD ke LocalStorage adapter → dapat file_id
  3. INSERT INTO signatures (version_id, party_id, signer_user_id, metode, referensi)
  4. Cek apakah SEMUA contract_parties sudah punya signature di versi ini:
       SELECT COUNT(*) FROM contract_parties cp
       LEFT JOIN signatures s ON s.party_id = cp.id AND s.version_id = $versionID
       WHERE cp.contract_id = $contractID AND s.id IS NULL
     Jika COUNT = 0 (semua sudah sign):
       → auto_seal(ctx, versionID, contractID)  [lihat 4c]
COMMIT
```

#### 4c. auto_seal (helper private)

```
1. Ambil isi kontrak versi terbaru → marshal ke JSON bytes
2. sha256 := sha256.Sum256(jsonBytes)
3. Simpan PDF/JSON ke LocalStorage → dapat file_id
4. INSERT INTO document_seals (version_id, file_id, sha256, waktu_segel, chain)
5. UPDATE contracts SET status = 'ditandatangani', updated_at = NOW()
```

**Verifikasi:**
- `go test ./... -run TestSubmitContractReview`
- `go test ./... -run TestSignContract`
- `go test ./... -run TestAutoSeal`

---

### Task 5 — Store: GetContractLifecycleDetail

**File:** `backend/internal/adapter/postgres/store_lifecycle.go` (sambung)

**Query:** JOIN `contracts` + `contract_versions` (semua versi) + `contract_reviews` + `signatures` + `document_seals`.

**Logic:**
- Semua versi diurutkan `nomor_versi ASC`
- `current_version` = versi dengan `nomor_versi` tertinggi
- Caller visibility check: hanya pihak yang terkait (`contract_parties`) atau role BPD/inspektorat yang bisa akses

**Verifikasi:** `go test ./... -run TestGetContractLifecycleDetail`

---

### Task 6 — Handler: HandleReviseContract + HandleGetContractLifecycle

**File baru:** `backend/internal/handlers/contract_lifecycle_handler.go`

#### HandleReviseContract

```
PUT /api/v1/contracts/{id}
Auth: kades only

Request body (JSON):
{
  "jawaban_form": { ... }   // wizard answers lengkap
}

Flow:
1. Parse {id} → uuid
2. Verifikasi caller adalah kades (dari JWT)
3. Panggil store.ReviseContract(ctx, ReviseContractParams{...})
4. Response 200 → ContractVersion JSON

Error cases:
- 403 jika bukan kades
- 404 jika kontrak tidak ditemukan
- 409 jika status tidak memungkinkan revisi (ErrContractNotEditable)
- 422 jika jawaban_form tidak valid
```

#### HandleGetContractLifecycle

```
GET /api/v1/contracts/{id}/lifecycle
Auth: kades, penyedia, bpd, inspektorat

Flow:
1. Parse {id} → uuid
2. Panggil store.GetContractLifecycleDetail(ctx, contractID, callerUserID)
3. Response 200 → ContractLifecycleDetail JSON

Error cases:
- 403 jika tidak memiliki akses ke kontrak ini
- 404 jika kontrak tidak ditemukan
```

**Verifikasi:** `go build ./...`

---

### Task 7 — Handler: HandleSubmitContractReview

**File:** `backend/internal/handlers/contract_lifecycle_handler.go` (sambung)

```
POST /api/v1/contracts/{id}/reviews
Auth: penyedia only

Request body (JSON):
{
  "komentar": "string",
  "status": "disetujui" | "perlu_revisi"
}

Flow:
1. Parse {id} → uuid
2. Verifikasi caller adalah penyedia yang terdaftar sebagai pihak kedua kontrak ini
3. Validasi field status: hanya "disetujui" atau "perlu_revisi"
4. Panggil store.SubmitContractReview(ctx, SubmitReviewParams{...})
5. Response 201 → ContractReview JSON

Error cases:
- 403 jika bukan penyedia terdaftar di kontrak ini
- 404 kontrak tidak ditemukan
- 409 jika status kontrak bukan "diaudit" (vendor belum bisa review)
- 422 jika status enum tidak valid
```

**Verifikasi:** `go build ./...`

---

### Task 8 — Handler: HandleSignContract

**File:** `backend/internal/handlers/contract_lifecycle_handler.go` (sambung)

```
POST /api/v1/contracts/{id}/sign
Auth: kades, penyedia
Content-Type: multipart/form-data

Form fields:
- signature_image: file (PNG/JPEG, max 2MB)
- metode: "simulasi" | "psre"

Flow:
1. Parse {id} → uuid
2. Verifikasi caller adalah kades atau penyedia terdaftar di kontrak
3. Parse multipart form, baca file bytes
4. Validasi: ukuran ≤ 2MB, MIME type image/png atau image/jpeg
5. Panggil store.SignContract(ctx, SignContractParams{...})
   → store akan auto-seal jika semua pihak sudah sign
6. Response 201 → Signature JSON (+ seal info jika auto-sealed)

Error cases:
- 400 jika file bukan PNG/JPEG atau > 2MB
- 403 jika tidak punya akses
- 409 jika sudah pernah sign (duplicate signature)
- 409 jika status kontrak bukan "peninjauan" atau "diaudit"
```

**Verifikasi:** `go build ./...`

---

### Task 9 — Routing di main.go

**File:** `backend/cmd/api/main.go`

**Tambahkan setelah blok routing contracts yang sudah ada:**

```go
// Contract Lifecycle
lifecycleHandler := handlers.NewContractLifecycleHandler(store, storageAdapter)
mux.Handle("PUT /api/v1/contracts/{id}",
    middleware.RequireRoles(lifecycleHandler.HandleReviseContract, "kades"))
mux.Handle("GET /api/v1/contracts/{id}/lifecycle",
    middleware.RequireRoles(lifecycleHandler.HandleGetContractLifecycle, "kades", "penyedia", "bpd", "inspektorat"))
mux.Handle("POST /api/v1/contracts/{id}/reviews",
    middleware.RequireRoles(lifecycleHandler.HandleSubmitContractReview, "penyedia"))
mux.Handle("POST /api/v1/contracts/{id}/sign",
    middleware.RequireRoles(lifecycleHandler.HandleSignContract, "kades", "penyedia"))
```

**Verifikasi:** `go build ./...`

---

### Task 10 — Smoke Test E2E + Update Postman

#### Smoke Test (urutan)

```
1. Login kades           → POST /api/v1/auth/login
2. Buat kontrak          → POST /api/v1/contracts (wizard)
3. Revisi kontrak        → PUT /api/v1/contracts/{id}
4. Lihat lifecycle       → GET /api/v1/contracts/{id}/lifecycle
5. Login penyedia        → POST /api/v1/auth/login
6. Submit review setuju  → POST /api/v1/contracts/{id}/reviews {"status":"disetujui"}
7. TTD penyedia          → POST /api/v1/contracts/{id}/sign (multipart)
8. TTD kades             → POST /api/v1/contracts/{id}/sign (multipart)
   → Pastikan response mengandung seal info (auto-seal triggered)
9. Cek lifecycle final   → GET /api/v1/contracts/{id}/lifecycle
   → status harus "ditandatangani", seal harus ada
```

#### Update Postman Collection

Tambahkan ke `docs/saksi-api.postman_collection.json` v2.1.0:
- Folder: **Contract Lifecycle**
- 4 request baru dengan `{{baseUrl}}` dan `{{authToken}}`
- Test script pada sign endpoint kedua: assert `status == "ditandatangani"`

---

## Success Criteria

- [ ] `go build ./...` clean
- [ ] `go test ./backend/internal/... -count=1` pass (unit + integration)
- [ ] Smoke test E2E semua 9 step sukses dengan data kades/penyedia dari DB
- [ ] `docs/saksi-api.postman_collection.json` valid JSON & import bersih di Postman
- [ ] Status enum di DB konsisten dengan `SAKSI.sql` (`draf`, `diaudit`, dll)
- [ ] Tidak ada duplikasi endpoint yang sudah ada

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Mismatch status enum lama vs baru | Task 1 perbaiki konstanta; migration SQL jika data lama perlu di-update |
| `contract_parties` logic (kades vs penyedia) | Validasi via JOIN di store sebelum insert |
| Auto-seal race condition (dua pihak sign bersamaan) | Gunakan `SELECT ... FOR UPDATE` di transaction auto-seal |
| File TTD corrupt/invalid | Validasi MIME + size di handler sebelum ke store |

