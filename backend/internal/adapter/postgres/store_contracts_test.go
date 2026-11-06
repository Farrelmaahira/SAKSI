package postgres_test

import (
	"context"
	"os"
	"testing"
	"time"

	"saksi-backend/internal/adapter/postgres"
	"saksi-backend/internal/domain"
	"saksi-backend/internal/usecase"
)

func getTestStore(t *testing.T) *postgres.Store {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	store, err := postgres.Open(ctx, dbURL)
	if err != nil {
		t.Skipf("skipping postgres integration test (db connection failed: %v)", err)
		return nil
	}
	return store
}

func TestStore_Contracts_Workflow(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()

	ctx := context.Background()

	// 1. Test ListCounterparties
	counterparties, err := store.ListCounterparties(ctx, nil, "")
	if err != nil {
		t.Fatalf("ListCounterparties failed: %v", err)
	}

	var cpID int64
	if len(counterparties) > 0 {
		cpID = counterparties[0].ID
	} else {
		// Insert dummy counterparty if table empty
		p := usecase.RegisterUserParams{
			Nama:              "Kontraktor Dummy",
			Email:             "dummy.vendor@pt.com",
			PasswordHash:      "$2a$10$xyz",
			Role:              domain.RolePenyedia,
			CounterpartyName:  "PT Rekanan Uji Coba",
			CounterpartyJenis: "penyedia",
			NPWP:              "01.999.888.7-000.000",
			Alamat:            "Jl. Uji No. 1",
		}
		u, err := store.CreateUserWithRole(ctx, p)
		if err == nil {
			cps, _ := store.ListCounterparties(ctx, nil, "PT Rekanan Uji Coba")
			if len(cps) > 0 {
				cpID = cps[0].ID
			}
		} else {
			t.Logf("CreateUserWithRole notice: %v", err)
			cpID = u.ID
		}
	}

	if cpID <= 0 {
		t.Skip("no counterparties available to link contract")
	}

	// 2. Test CounterpartyByID
	cp, err := store.CounterpartyByID(ctx, cpID)
	if err != nil {
		t.Fatalf("CounterpartyByID failed: %v", err)
	}
	if cp.ID != cpID {
		t.Fatalf("expected counterparty ID %d, got %d", cpID, cp.ID)
	}

	// 3. Test CreateContractWithDetails
	params := usecase.CreateContractParams{
		VillageID:       1,
		CounterpartyID:  cpID,
		Jenis:           domain.JenisPengadaan,
		Judul:           "Pembangunan Talud Jalan Desa",
		Nilai:           45000000,
		Tenggat:         time.Now().AddDate(0, 1, 0),
		SkemaPembayaran: "termin",
		MetodePemilihan: "pengadaan_langsung",
		JawabanForm: map[string]any{
			"lingkup_pekerjaan": "Talud sepanjang 100m tinggi 1.5m",
		},
		IsiTeks:        "Draf kontrak uji coba...",
		CreatedBy:      1,
		IntegrityScore: 92.5,
		SHA256Hash:     "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	}

	created, err := store.CreateContractWithDetails(ctx, params)
	if err != nil {
		t.Fatalf("CreateContractWithDetails failed: %v", err)
	}
	if created.ID <= 0 || created.Status != "diaudit" {
		t.Fatalf("unexpected created contract: %+v", created)
	}

	// 4. Test GetContractDetail
	detail, err := store.GetContractDetail(ctx, created.ID)
	if err != nil {
		t.Fatalf("GetContractDetail failed: %v", err)
	}
	if detail.ID != created.ID || detail.Judul != params.Judul {
		t.Fatalf("detail mismatch: %+v", detail)
	}
	if detail.IntegrityScore != params.IntegrityScore {
		t.Fatalf("expected integrity score %f, got %f", params.IntegrityScore, detail.IntegrityScore)
	}
}
