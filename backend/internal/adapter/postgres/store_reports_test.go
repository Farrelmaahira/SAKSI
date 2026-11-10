package postgres_test

import (
	"context"
	"testing"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func TestStore_Reports_Workflow(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()

	ctx := context.Background()

	// 1. Ambil atau buat kontrak untuk diuji pelaporannya
	publicContracts, err := store.ListPublicContracts(ctx, 0, "")
	if err != nil {
		t.Fatalf("ListPublicContracts failed: %v", err)
	}

	var contractID int64
	contractVillage := int64(1)
	if len(publicContracts) > 0 {
		contractID = publicContracts[0].ID
		contractVillage = publicContracts[0].VillageID
	} else {
		// Buat kontrak baru berstatus berjalan/dipublikasikan
		c, err := store.CreateContractWithDetails(ctx, usecase.CreateContractParams{
			VillageID:       1,
			CounterpartyID:  1,
			Jenis:           domain.JenisPengadaan,
			Judul:           "Pembangunan Irigasi Sawah Desa Sukamaju",
			Nilai:           75000000,
			Tenggat:         time.Now().Add(60 * 24 * time.Hour),
			SkemaPembayaran: "termin",
			MetodePemilihan: "lelang_terbuka",
			IsiTeks:         "PASAL 1 - LINGKUP PEKERJAAN\nPengadaan semen dan pasir.\nPASAL 2 - BIAYA\nRp 75.000.000",
			CreatedBy:       1,
			IntegrityScore:  90,
			SHA256Hash:      "hash-dummy-test-irigasi",
		})
		if err != nil {
			t.Fatalf("CreateContractWithDetails failed: %v", err)
		}
		// Update status kontrak menjadi 'berjalan' agar masuk kriteria publik
		_ = store.SetContractStatus(ctx, c.ID, "berjalan")
		contractID = c.ID
	}

	// 2. Test GetPublicContractDetail
	detail, err := store.GetPublicContractDetail(ctx, 0, contractID)
	if err != nil {
		// Jika belum berstatus publik, skip bagian get detail atau verifikasi
		t.Logf("GetPublicContractDetail returned: %v", err)
	} else {
		if detail.ID != contractID {
			t.Errorf("expected contract id %d, got %d", contractID, detail.ID)
		}
		if len(detail.KlausulList) == 0 {
			t.Errorf("expected clauses to be populated")
		}
	}

	// 3. Test SaveUploadedFile
	fileID, err := store.SaveUploadedFile(ctx, "reports/bukti1.jpg", "image/jpeg", 102400, 3)
	if err != nil {
		t.Fatalf("SaveUploadedFile failed: %v", err)
	}
	if fileID <= 0 {
		t.Fatalf("expected valid fileID, got %d", fileID)
	}

	// 4. Test CreateCitizenReport
	reportInput := domain.CitizenReport{
		ContractID:    contractID,
		PelaporUserID: 3, // Budi Santoso (Warga)
		Kategori:      "kualitas_rendah",
		Deskripsi:     "Material pasir dan semen tidak sesuai spesifikasi SNI pada Pasal 1.",
		LokasiLat:     func(f float64) *float64 { return &f }(-6.812345),
		LokasiLng:     func(f float64) *float64 { return &f }(107.123456),
	}

	createdReport, err := store.CreateCitizenReport(ctx, reportInput, []int64{fileID})
	if err != nil {
		t.Fatalf("CreateCitizenReport failed: %v", err)
	}

	if createdReport.ID <= 0 {
		t.Fatalf("expected positive report ID, got %d", createdReport.ID)
	}
	if createdReport.KodePelacakan == "" {
		t.Errorf("expected kode pelacakan to be generated")
	}
	if createdReport.Status != domain.ReportStatusDiterima {
		t.Errorf("expected status 'diterima', got %s", createdReport.Status)
	}

	// 5. Test ListCitizenReportsByReporter
	myReports, err := store.ListCitizenReportsByReporter(ctx, 3)
	if err != nil {
		t.Fatalf("ListCitizenReportsByReporter failed: %v", err)
	}
	if len(myReports) == 0 {
		t.Errorf("expected at least 1 report in list")
	}

	// 6. Test GetCitizenReportByID dengan Hak Akses & Privasi
	// 6a. Warga yang bersangkutan (melihat nama asli)
	repWarga, err := store.GetCitizenReportByID(ctx, createdReport.ID, usecase.Scope{UserID: 3, Role: domain.RoleWarga})
	if err != nil {
		t.Fatalf("GetCitizenReportByID as warga failed: %v", err)
	}
	if len(repWarga.Attachments) == 0 {
		t.Errorf("expected attachment to be linked")
	}

	// 6b. IDOR check: warga lain tidak boleh melihat
	_, err = store.GetCitizenReportByID(ctx, createdReport.ID, usecase.Scope{UserID: 9999, Role: domain.RoleWarga})
	if err != domain.ErrNotFound {
		t.Errorf("expected ErrNotFound for other citizen, got %v", err)
	}

	// 6b'. IDOR check: kades desa lain mendapat ErrNotFound (bukan 403) agar id tidak bisa ditebak
	otherVillage := contractVillage + 1000
	if _, err = store.GetCitizenReportByID(ctx, createdReport.ID, usecase.Scope{UserID: 1, Role: domain.RoleKades, VillageID: &otherVillage}); err != domain.ErrNotFound {
		t.Errorf("expected ErrNotFound for kades of another village, got %v", err)
	}

	// 6c. Kades melihat nama tersamar "Warga terverifikasi"
	repKades, err := store.GetCitizenReportByID(ctx, createdReport.ID, usecase.Scope{UserID: 1, Role: domain.RoleKades, VillageID: &contractVillage})
	if err != nil {
		t.Fatalf("GetCitizenReportByID as kades failed: %v", err)
	}
	if repKades.PelaporNama != "Warga terverifikasi" {
		t.Errorf("expected PelaporNama to be masked as 'Warga terverifikasi', got '%s'", repKades.PelaporNama)
	}

	// 7. Test ListCitizenReportsByContract
	contractReports, err := store.ListCitizenReportsByContract(ctx, contractID, 1, domain.RoleKades)
	if err != nil {
		t.Fatalf("ListCitizenReportsByContract failed: %v", err)
	}
	if len(contractReports) == 0 {
		t.Errorf("expected at least 1 report for contract %d", contractID)
	}
	if contractReports[0].PelaporNama != "Warga terverifikasi" {
		t.Errorf("expected PelaporNama masked as 'Warga terverifikasi', got '%s'", contractReports[0].PelaporNama)
	}

	// 7b. IDOR check: Kades desa lain tidak boleh melihat laporan kontrak ini
	_, err = store.ListCitizenReportsByContract(ctx, contractID, 999, domain.RoleKades)
	if err != domain.ErrForbidden {
		t.Errorf("expected ErrForbidden for kades of another village, got %v", err)
	}

	// 8. Test ListCitizenReports (Role-Aware)
	// 8a. Kades melihat seluruh laporan di desanya
	kadesReports, err := store.ListCitizenReports(ctx, usecase.ListReportsFilter{
		RequesterRole:   domain.RoleKades,
		RequesterUserID: 1,
		VillageID:       1,
	})
	if err != nil {
		t.Fatalf("ListCitizenReports as kades failed: %v", err)
	}
	if len(kadesReports) == 0 {
		t.Errorf("expected kades to see village reports")
	}

	// 8b. Warga hanya melihat laporannya sendiri
	wargaReports, err := store.ListCitizenReports(ctx, usecase.ListReportsFilter{
		RequesterRole:   domain.RoleWarga,
		RequesterUserID: 3,
	})
	if err != nil {
		t.Fatalf("ListCitizenReports as warga failed: %v", err)
	}
	if len(wargaReports) == 0 {
		t.Errorf("expected warga to see their reports")
	}
}
