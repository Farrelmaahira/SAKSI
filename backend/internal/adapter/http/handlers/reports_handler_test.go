package handlers_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"saksi-backend/internal/adapter/http/handlers"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

type reportsMockStore struct {
	usecase.Store
	publicContracts []domain.PublicContractSummary
	contractDetail  domain.PublicContractDetail
	reports         map[int64]domain.CitizenReport
	lastCreated     domain.CitizenReport
}

func (m *reportsMockStore) ListPublicContracts(ctx context.Context, villageID int64, search string) ([]domain.PublicContractSummary, error) {
	return m.publicContracts, nil
}

func (m *reportsMockStore) GetPublicContractDetail(ctx context.Context, villageID int64, contractID int64) (domain.PublicContractDetail, error) {
	if m.contractDetail.ID == contractID {
		return m.contractDetail, nil
	}
	return domain.PublicContractDetail{}, domain.ErrNotFound
}

func (m *reportsMockStore) CreateCitizenReport(ctx context.Context, r domain.CitizenReport, fileIDs []int64) (domain.CitizenReport, error) {
	r.ID = 101
	r.Status = domain.ReportStatusDiterima
	r.KodePelacakan = "LAP-20261107-TEST"
	r.DibuatPada = time.Now()
	m.lastCreated = r
	if m.reports == nil {
		m.reports = make(map[int64]domain.CitizenReport)
	}
	m.reports[r.ID] = r
	return r, nil
}

func (m *reportsMockStore) ListCitizenReportsByReporter(ctx context.Context, reporterID int64) ([]domain.CitizenReport, error) {
	var list []domain.CitizenReport
	for _, r := range m.reports {
		if r.PelaporUserID == reporterID {
			list = append(list, r)
		}
	}
	return list, nil
}

func (m *reportsMockStore) GetCitizenReportByID(ctx context.Context, reportID int64, requesterID int64, requesterRole domain.UserRole) (domain.CitizenReport, error) {
	r, ok := m.reports[reportID]
	if !ok {
		return domain.CitizenReport{}, domain.ErrNotFound
	}
	if requesterRole == domain.RoleWarga && r.PelaporUserID != requesterID {
		return domain.CitizenReport{}, domain.ErrForbidden
	}
	if requesterRole == domain.RoleKades {
		r.PelaporNama = "Warga terverifikasi"
	}
	return r, nil
}

func (m *reportsMockStore) SaveUploadedFile(ctx context.Context, key string, mime string, size int64, uploadedBy int64) (int64, error) {
	return 555, nil
}

func (m *reportsMockStore) ListCitizenReportsByContract(ctx context.Context, contractID int64, villageID int64, requesterRole domain.UserRole) ([]domain.CitizenReport, error) {
	if villageID != 1 && requesterRole != domain.RoleInspektorat {
		return nil, domain.ErrForbidden
	}
	var list []domain.CitizenReport
	for _, r := range m.reports {
		if r.ContractID == contractID {
			if requesterRole == domain.RoleKades || requesterRole == domain.RolePerangkatDesa {
				r.PelaporNama = "Warga terverifikasi"
			}
			list = append(list, r)
		}
	}
	return list, nil
}

func (m *reportsMockStore) ListCitizenReports(ctx context.Context, f usecase.ListReportsFilter) ([]domain.CitizenReport, error) {
	var list []domain.CitizenReport
	for _, r := range m.reports {
		if f.RequesterRole == domain.RoleWarga {
			if r.PelaporUserID == f.RequesterUserID {
				list = append(list, r)
			}
		} else if f.RequesterRole == domain.RoleKades || f.RequesterRole == domain.RolePerangkatDesa || f.RequesterRole == domain.RoleBPD {
			if f.VillageID == 1 {
				r.PelaporNama = "Warga terverifikasi"
				list = append(list, r)
			}
		} else if f.RequesterRole == domain.RoleInspektorat {
			list = append(list, r)
		}
	}
	return list, nil
}

func TestReports_Handlers(t *testing.T) {
	mockStore := &reportsMockStore{
		publicContracts: []domain.PublicContractSummary{
			{
				ID:               10,
				Nomor:            "SPK-1-0010",
				Judul:            "Pembangunan Jembatan Desa",
				Jenis:            "pengadaan",
				Nilai:            150000000,
				Status:           "berjalan",
				VillageID:        1,
				VillageName:      "Desa Sukamaju",
				CounterpartyNama: "CV Jaya Konstruksi",
			},
		},
		contractDetail: domain.PublicContractDetail{
			PublicContractSummary: domain.PublicContractSummary{
				ID:               10,
				Nomor:            "SPK-1-0010",
				Judul:            "Pembangunan Jembatan Desa",
				Status:           "berjalan",
				VillageID:        1,
			},
			IsiTeks:     "PASAL 1 - PEKERJAAN\nPASAL 2 - BIAYA",
			KlausulList: []string{"Pasal 1 - Pekerjaan", "Pasal 2 - Biaya"},
		},
		reports: map[int64]domain.CitizenReport{
			100: {
				ID:            100,
				ContractID:    10,
				PelaporUserID: 3,
				PelaporNama:   "Budi Santoso",
				KodePelacakan: "LAP-20261107-EXST",
				Kategori:      "keterlambatan",
				Deskripsi:     "Progres jembatan mangkrak.",
				Status:        domain.ReportStatusDiterima,
			},
		},
	}

	secret := "test-hmac-secret-min16chars"
	deps := &handlers.Deps{
		Store:  mockStore,
		Secret: secret,
	}

	wargaToken, _ := usecase.IssueToken(3, domain.RoleWarga, func(i int64) *int64 { return &i }(1), secret, 1*time.Hour)
	kadesToken, _ := usecase.IssueToken(1, domain.RoleKades, func(i int64) *int64 { return &i }(1), secret, 1*time.Hour)
	otherWargaToken, _ := usecase.IssueToken(99, domain.RoleWarga, func(i int64) *int64 { return &i }(1), secret, 1*time.Hour)
	otherKadesToken, _ := usecase.IssueToken(20, domain.RoleKades, func(i int64) *int64 { return &i }(2), secret, 1*time.Hour)

	authMiddleware := handlers.RequireAuth(secret)

	// 1. Test HandleListPublicContracts
	t.Run("ListPublicContracts", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/public/contracts", nil)
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListPublicContracts(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var list []domain.PublicContractSummary
		if err := json.NewDecoder(w.Body).Decode(&list); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if len(list) != 1 || list[0].ID != 10 {
			t.Errorf("expected 1 contract with ID 10")
		}
	})

	// 2. Test HandleGetPublicContractDetail
	t.Run("GetPublicContractDetail_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/public/contracts/10", nil)
		req.SetPathValue("id", "10")
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleGetPublicContractDetail(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var detail domain.PublicContractDetail
		_ = json.NewDecoder(w.Body).Decode(&detail)
		if detail.ID != 10 || len(detail.KlausulList) == 0 {
			t.Errorf("expected detail with populated clauses")
		}
	})

	t.Run("GetPublicContractDetail_NotFound", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/public/contracts/999", nil)
		req.SetPathValue("id", "999")
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleGetPublicContractDetail(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusNotFound {
			t.Fatalf("expected status 404, got %d", w.Code)
		}
	})

	// 3. Test HandleCreateCitizenReport
	t.Run("CreateCitizenReport_Validation", func(t *testing.T) {
		// Kades cannot submit citizen report
		body, _ := json.Marshal(handlers.CreateReportJSONRequest{
			ContractID: 10,
			Kategori:   "kualitas_rendah",
			Deskripsi:  "Uraian pengaduan yang panjang dan jelas.",
		})
		req := httptest.NewRequest("POST", "/api/v1/reports", bytes.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+kadesToken)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleCreateCitizenReport(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected status 403 Forbidden for kades, got %d", w.Code)
		}
	})

	t.Run("CreateCitizenReport_SuccessJSON", func(t *testing.T) {
		body, _ := json.Marshal(handlers.CreateReportJSONRequest{
			ContractID: 10,
			Kategori:   "kualitas_rendah",
			Deskripsi:  "Uraian pengaduan yang panjang dan jelas lebih dari 15 karakter.",
		})
		req := httptest.NewRequest("POST", "/api/v1/reports", bytes.NewReader(body))
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleCreateCitizenReport(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("expected status 201 Created, got %d (body: %s)", w.Code, w.Body.String())
		}

		var created domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&created)
		if created.ID != 101 || created.KodePelacakan == "" {
			t.Errorf("expected created report with valid ID and tracking code")
		}
	})

	// 4. Test HandleListMyReports
	t.Run("ListMyReports", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/reports", nil)
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListMyReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var list []domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&list)
		if len(list) == 0 {
			t.Errorf("expected reports list")
		}
	})

	// 5. Test HandleGetReportDetail (IDOR check & Privacy Masking)
	t.Run("GetReportDetail_IDOR_Forbidden", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/reports/100", nil)
		req.SetPathValue("id", "100")
		req.Header.Set("Authorization", "Bearer "+otherWargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleGetReportDetail(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected status 403 Forbidden for other citizen, got %d", w.Code)
		}
	})

	t.Run("GetReportDetail_KadesPrivacyMasking", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/reports/100", nil)
		req.SetPathValue("id", "100")
		req.Header.Set("Authorization", "Bearer "+kadesToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleGetReportDetail(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var rep domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&rep)
		if rep.PelaporNama != "Warga terverifikasi" {
			t.Errorf("expected masked name 'Warga terverifikasi', got '%s'", rep.PelaporNama)
		}
	})

	// 6. Test HandleListReports (Role-Aware)
	t.Run("ListReports_Kades", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/reports", nil)
		req.Header.Set("Authorization", "Bearer "+kadesToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var list []domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&list)
		if len(list) == 0 {
			t.Errorf("expected reports for kades")
		}
		if list[0].PelaporNama != "Warga terverifikasi" {
			t.Errorf("expected masked PelaporNama 'Warga terverifikasi', got '%s'", list[0].PelaporNama)
		}
	})

	t.Run("ListReports_Warga", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/reports", nil)
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var list []domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&list)
		if len(list) == 0 {
			t.Errorf("expected reports for warga")
		}
	})

	// 7. Test HandleListContractReports
	t.Run("ListContractReports_Kades_Success", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/contracts/10/reports", nil)
		req.SetPathValue("id", "10")
		req.Header.Set("Authorization", "Bearer "+kadesToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListContractReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", w.Code)
		}

		var list []domain.CitizenReport
		_ = json.NewDecoder(w.Body).Decode(&list)
		if len(list) == 0 {
			t.Errorf("expected reports for contract 10")
		}
		if list[0].PelaporNama != "Warga terverifikasi" {
			t.Errorf("expected masked PelaporNama 'Warga terverifikasi', got '%s'", list[0].PelaporNama)
		}
	})

	t.Run("ListContractReports_Kades_IDOR", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/contracts/10/reports", nil)
		req.SetPathValue("id", "10")
		req.Header.Set("Authorization", "Bearer "+otherKadesToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListContractReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected status 403 Forbidden for kades of other village, got %d", w.Code)
		}
	})

	t.Run("ListContractReports_Warga_Forbidden", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/v1/contracts/10/reports", nil)
		req.SetPathValue("id", "10")
		req.Header.Set("Authorization", "Bearer "+wargaToken)
		w := httptest.NewRecorder()

		authMiddleware(handlers.HandleListContractReports(deps)).ServeHTTP(w, req)
		if w.Code != http.StatusForbidden {
			t.Fatalf("expected status 403 Forbidden for warga, got %d", w.Code)
		}
	})
}
