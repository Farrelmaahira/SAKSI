package domain

import "testing"

func TestNotificationTitle(t *testing.T) {
	for jenis, want := range map[string]string{
		"kontrak_dikirim":  "Kontrak dikirim untuk Anda tinjau",
		"laporan_baru":     "Laporan warga baru",
		"jenis_baru_belum": "Jenis baru belum", // belum dikenal: dibaca dari namanya
		"":                 "Notifikasi",
	} {
		if got := NotificationTitle(jenis); got != want {
			t.Errorf("NotificationTitle(%q) = %q, mau %q", jenis, got, want)
		}
	}
}
