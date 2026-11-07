# Kades & Role-Aware Citizen Reports API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide secure, role-aware REST API endpoints:
1. `GET /api/v1/contracts/{id}/reports` - View all citizen reports on a specific contract (village-scoped for Kades/BPD, cross-village for Inspektorat).
2. `GET /api/v1/reports` - Universal reports listing endpoint where:
   - Warga sees all reports they have submitted.
   - Kades & BPD see all citizen reports across all contracts in their village.
   - Inspektorat sees all citizen reports across villages (with optional `villageId` & `contractId` filters).
   - In both endpoints, Kades and Penyedia receive masked reporter identity (`"Warga terverifikasi"`).

**Architecture:** Implement `ListCitizenReports` (with filter params) and `ListCitizenReportsByContract` in `Store` and `store_reports.go`. Wire `HandleListReports` to handle `GET /api/v1/reports` role-sensitively, and `HandleListContractReports` to handle `GET /api/v1/contracts/{id}/reports`. Verify via Go unit/integration tests and update Postman collection v2.1.0.

**Tech Stack:** Go 1.24, `net/http`, `pgx/v5`, PostgreSQL 16 (Docker container `saksi-postgres-1`), Postman Collection v2.1.0.

**Spec:** User request:
1. "buat API untuk role kades dapat melihat laporan warga berdasarkan laporan dari suatu kontrak yang dia miliki"
2. "buat juga untuk GET /api/v1/reports untuk melihat keseluruhan laporan dari pihak warga"

## Global Constraints

- Endpoints:
  - `GET /api/v1/reports` (supports query params: `contractId`, `status`, `search`)
  - `GET /api/v1/contracts/{id}/reports`
- Access control:
  - `GET /api/v1/contracts/{id}/reports`: Only `kades`, `perangkat_desa`, `bpd`, `inspektorat`. Warga receives `403 Forbidden`. Cross-village access by Kades receives `403 Forbidden` (`anti-IDOR violation`).
  - `GET /api/v1/reports`: Open to all authenticated users, but scoped by role:
    - `warga` -> only reports filed by that user (`pelapor_user_id = callerID`).
    - `kades` / `bpd` -> all reports on contracts belonging to caller's `village_id`.
    - `inspektorat` -> all reports across villages (or filtered by `villageId`).
- Privacy masking: Reporter name must be masked as `"Warga terverifikasi"` for `kades`, `perangkat_desa`, and `penyedia`.
- Postman Collection file `docs/saksi-api.postman_collection.json` v2.1.0 must be updated and kept strictly valid.

## Review Focus

- Calling `GET /api/v1/reports` as `kades` returns reports from multiple citizens in that village.
- Calling `GET /api/v1/reports` as `warga` returns only their own submitted reports.
- Calling `GET /api/v1/contracts/{id}/reports` as `kades` for another village's contract returns `403 Forbidden`.
- Calling `GET /api/v1/contracts/{id}/reports` as `warga` returns `403 Forbidden`.
- Reports response includes attachments (`files`) and actions (`report_actions`).

---

### Task 1: Store Port & PostgreSQL Adapter Queries

**Files:**
- Modify: `backend/internal/usecase/ports.go:60-70`
- Modify: `backend/internal/adapter/postgres/store_reports.go`
- Test: `backend/internal/adapter/postgres/store_reports_test.go`

**Interfaces:**
- Produces in `usecase.Store`:
  - `ListCitizenReportsByContract(ctx context.Context, contractID int64, villageID int64, requesterRole domain.UserRole) ([]domain.CitizenReport, error)`
  - `ListCitizenReports(ctx context.Context, filter usecase.ListReportsFilter) ([]domain.CitizenReport, error)`
- Types in `usecase`:
  ```go
  type ListReportsFilter struct {
      RequesterRole   domain.UserRole
      RequesterUserID int64
      VillageID       int64
      ContractID      *int64
      Status          *domain.ReportStatus
      Search          string
  }
  ```

- [x] **Step 1: Declare `ListReportsFilter` and store methods in `ports.go`**
- [x] **Step 2: Write failing integration test in `store_reports_test.go`**
- [x] **Step 3: Run integration test to verify it fails**
- [x] **Step 4: Implement `ListCitizenReportsByContract` and `ListCitizenReports` in `store_reports.go`**
- [x] **Step 5: Run integration test to verify it passes**
- [x] **Step 6: Commit**

---

### Task 2: HTTP Handlers & Route Wiring

**Files:**
- Modify: `backend/internal/adapter/http/handlers/reports_handler.go`
- Modify: `backend/cmd/api/main.go:80-92`
- Test: `backend/internal/adapter/http/handlers/reports_handler_test.go`

**Interfaces:**
- Consumes: `usecase.Store.ListCitizenReports` & `usecase.Store.ListCitizenReportsByContract`
- Produces:
  - `HandleListReports(d *Deps) http.HandlerFunc` on `GET /api/v1/reports`
  - `HandleListContractReports(d *Deps) http.HandlerFunc` on `GET /api/v1/contracts/{id}/reports`

- [x] **Step 1: Write unit tests in `reports_handler_test.go`**
- [x] **Step 2: Run handler tests to verify they fail**
- [x] **Step 3: Implement handlers and update route registrations in `reports_handler.go` & `cmd/api/main.go`**
- [x] **Step 4: Run handler tests to verify they pass**
- [x] **Step 5: Rebuild backend container and verify live with curl/PowerShell**
- [x] **Step 6: Commit**

---

### Task 3: Postman Collection Synchronization & Verification

**Files:**
- Modify: `docs/saksi-api.postman_collection.json`

**Interfaces:**
- Produces: Updated Postman Collection v2.1.0 documenting:
  1. `Daftar Seluruh Laporan Warga Desa (Kades) - GET /reports`
  2. `Daftar Laporan pada Kontrak Tertentu (Kades) - GET /contracts/:id/reports`

- [x] **Step 1: Add new requests into Postman Collection under `Citizen Reports`**
- [x] **Step 2: Validate JSON syntax**
- [x] **Step 3: Commit**
