package postgres_test

import (
	"context"
	"testing"

	"github.com/jackc/pgx/v5"
)

// TestStore_ListCounterparties_OnlyWithAccount: hanya usaha berakun, dengan email akun yang sebenarnya.
func TestStore_ListCounterparties_OnlyWithAccount(t *testing.T) {
	store := getTestStore(t)
	if store == nil {
		return
	}
	defer store.Close()
	ctx := context.Background()

	var orphanID int64
	if throwawayDB() {
		conn, err := pgx.Connect(ctx, testDBURL())
		if err != nil {
			t.Fatal(err)
		}
		defer conn.Close(ctx)
		if err := conn.QueryRow(ctx, `INSERT INTO counterparties (nama, jenis) VALUES ('CV Tanpa Akun Uji', (SELECT jenis FROM counterparties LIMIT 1)) RETURNING id`).Scan(&orphanID); err != nil {
			t.Fatalf("sisip usaha tanpa akun: %v", err)
		}
		defer conn.Exec(ctx, `DELETE FROM counterparties WHERE id = $1`, orphanID) // jalan sebelum conn.Close (LIFO)
	}

	list, err := store.ListCounterparties(ctx, nil, "")
	if err != nil {
		t.Fatal(err)
	}
	for _, c := range list {
		if c.UserID == nil || c.Email == "" {
			t.Errorf("usaha %q (id %d) tanpa akun/email ikut terdaftar", c.Nama, c.ID)
		}
		if orphanID != 0 && c.ID == orphanID {
			t.Errorf("usaha tanpa akun (id %d) tidak boleh muncul", orphanID)
		}
	}
}
