package handlers

import (
	"encoding/json"
	"math"
	"strings"
	"time"
)

const (
	maxJudulLen      = 255      // contracts.judul varchar(255)
	maxNilai         = 9.99e15  // contracts.nilai decimal(18,2)
	maxJawabanBytes  = 16 << 10 // jawaban wizard yang wajar; lebih besar hanya menghabiskan kuota AI lalu gagal sebagai "AI penuh"
	defaultTenggatMo = 1
)

var wib = time.FixedZone("WIB", 7*3600)

// validateContractInput dipakai preview dan buat kontrak supaya aturannya sama. Mengembalikan tenggat (default +1 bulan
// bila kosong) atau pesan galat untuk 400. Tenggat yang salah format atau sebelum hari ini (WIB) ditolak, tidak diganti diam-diam.
func validateContractInput(judul string, nilai float64, tenggat string, jawaban map[string]any, now time.Time) (time.Time, string) {
	if j := strings.TrimSpace(judul); len(j) < 3 || len(j) > maxJudulLen {
		return time.Time{}, "judul kontrak 3 sampai 255 karakter"
	}
	if nilai <= 0 || math.IsNaN(nilai) || math.IsInf(nilai, 0) || nilai > maxNilai {
		return time.Time{}, "nilai kontrak harus lebih besar dari 0"
	}
	if len(jawaban) > 0 {
		if b, err := json.Marshal(jawaban); err != nil || len(b) > maxJawabanBytes {
			return time.Time{}, "jawaban terlalu panjang (maks. 16 KB)"
		}
	}
	tenggat = strings.TrimSpace(tenggat)
	if tenggat == "" {
		return now.AddDate(0, defaultTenggatMo, 0), ""
	}
	t, err := time.Parse("2006-01-02", tenggat)
	if err != nil {
		return time.Time{}, "tenggat harus berformat YYYY-MM-DD"
	}
	today := now.In(wib)
	if t.Before(time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)) {
		return time.Time{}, "tenggat tidak boleh sebelum hari ini"
	}
	return t, ""
}
