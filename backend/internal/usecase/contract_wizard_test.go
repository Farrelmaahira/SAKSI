package usecase_test

import (
	"strings"
	"testing"
	"time"

	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func TestWizardQuestions_Fallback(t *testing.T) {
	testCases := []struct {
		jenis      domain.ContractJenis
		vendorName string
		minCount   int
	}{
		{jenis: domain.JenisPengadaan, vendorName: "PT Maju Konstruksi", minCount: 3},
		{jenis: domain.JenisHibah, vendorName: "Yayasan Bina Desa", minCount: 3},
		{jenis: domain.JenisKerjaSamaBUMDes, vendorName: "BUMDes Sejahtera", minCount: 3},
		{jenis: domain.JenisSewaAset, vendorName: "CV Rental Usaha", minCount: 3},
	}

	for _, tc := range testCases {
		t.Run(string(tc.jenis), func(t *testing.T) {
			questions := usecase.GenerateWizardQuestions(tc.jenis, tc.vendorName)
			if len(questions) < tc.minCount {
				t.Fatalf("expected at least %d questions, got %d", tc.minCount, len(questions))
			}
			for _, q := range questions {
				if q.Key == "" || q.Label == "" || q.Type == "" {
					t.Fatalf("invalid question definition: %+v", q)
				}
			}
		})
	}
}

func TestRenderContractDraft_Fallback(t *testing.T) {
	params := usecase.CreateContractDraftParams{
		Jenis:           domain.JenisPengadaan,
		Judul:           "Pembangunan Jalan Lingkungan RT 02 RW 01",
		KadesName:       "Kepala Desa Budi",
		VillageName:     "Desa Sukamaju",
		VendorName:      "PT Maju Konstruksi",
		VendorNPWP:      "01.234.567.8-901.000",
		VendorAddress:   "Jl. Raya Industri No. 45",
		Nilai:           75000000,
		Tenggat:         time.Now().AddDate(0, 1, 0),
		SkemaPembayaran: "termin",
		MetodePemilihan: "pengadaan_langsung",
		JawabanForm: map[string]any{
			"lingkup_pekerjaan": "Pengaspalan jalan sepanjang 350 meter",
			"jadwal_mulai":      "2026-12-01",
			"rekening_bank":     "Bank Jateng 123456789",
		},
	}

	draft, err := usecase.RenderContractDraft(params)
	if err != nil {
		t.Fatalf("failed to render contract draft: %v", err)
	}

	// Must contain crucial legal anchors
	assertions := []string{
		"SURAT PERJANJIAN KERJA",
		"Kepala Desa Budi",
		"Desa Sukamaju",
		"PT Maju Konstruksi",
		"Rp 75.000.000",
		"Pengaspalan jalan sepanjang 350 meter",
		"INTEGRITAS DAN ANTI KORUPSI",
		"PENYELESAIAN PERSELISIHAN",
	}

	for _, s := range assertions {
		if !strings.Contains(draft, s) {
			t.Errorf("expected draft to contain %q, but missing", s)
		}
	}
}

func TestAuditContractDraft_Fallback(t *testing.T) {
	contractText := `
SURAT PERJANJIAN KERJA (SPK)
Pembangunan Jembatan Desa
Pihak Pertama: Desa Sukamaju
Pihak Kedua: PT Konstruksi Amanah
Pasal 1: Lingkup Pekerjaan jembatan beton.
Pasal 2: Nilai Kontrak Rp 150.000.000.
Pasal 3: Hak dan Kewajiban Para Pihak.
Pasal 4: Jaminan Pemeliharaan dan Masa Garansi pekerjaan selama 6 bulan.
Pasal 5: Sanksi dan Denda Keterlambatan sebesar 1/1000 per hari keterlambatan.
Pasal 6: Pakta Integritas, Larangan Suap, Gratifikasi, dan Tindak Pidana Korupsi.
Pasal 7: Penyelesaian Perselisihan melalui musyawarah mufakat.
`

	score, fulfilled, total, summary, hash := usecase.AuditContractDraft(contractText)
	if total == 0 {
		t.Fatalf("total mandatory clauses must be > 0, got %d", total)
	}
	if fulfilled == 0 {
		t.Fatalf("expected some fulfilled clauses, got 0")
	}
	if score <= 0 || score > 100 {
		t.Fatalf("expected score between 1 and 100, got %f", score)
	}
	if len(hash) != 64 {
		t.Fatalf("expected 64-char SHA256 hex string, got %s", hash)
	}
	if summary == "" {
		t.Fatalf("expected non-empty summary")
	}
}

