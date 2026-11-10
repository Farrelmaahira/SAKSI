package usecase

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"math"
	"strings"
	"time"

	"saksi-backend/internal/domain"
)

// Scope adalah identitas pemanggil untuk membatasi kontrak yang boleh dilihat (desa/wilayah/pihak).
type Scope struct {
	UserID    int64
	Role      domain.UserRole
	VillageID *int64
}

// IsDesa: role pemerintah desa yang boleh mengelola termin, SPK, dan pembayaran.
func IsDesa(r domain.UserRole) bool { return r == domain.RoleKades || r == domain.RolePerangkatDesa }

// CanViewMonitoring: role yang boleh melihat termin, segel, jejak audit (dengan scope).
func CanViewMonitoring(r domain.UserRole) bool {
	switch r {
	case domain.RoleKades, domain.RolePerangkatDesa, domain.RoleBPD, domain.RoleInspektorat, domain.RolePenyedia:
		return true
	}
	return false
}

const (
	MaxTerms          = 24
	MaxProgressURLs   = 10
	MaxProgressFiles  = 10
	MaxReportFindings = 50
	ResetTokenTTL     = 30 * time.Minute
	LimitResetPerKey  = 5
	WindowResetRL     = 15 * time.Minute
	LimitSealVerify   = 30
	WindowSealVerify  = time.Minute
	LimitPwChange     = 10
	WindowPwChange    = 15 * time.Minute
)

func KeyRLReset(k string) string        { return "saksi:rl:reset:" + k }
func KeyRLSealVerify(ip string) string  { return "saksi:rl:seal:" + ip }
func KeyRLPwChange(userID int64) string { return fmt.Sprintf("saksi:rl:pwchange:%d", userID) }

type TermInput struct {
	Persen     float64
	JatuhTempo time.Time
}

type SetTermsParams struct {
	ContractID int64
	Scope      Scope
	Terms      []TermInput
	ActorIP    string
}

type SetSPKParams struct {
	ContractID int64
	Scope      Scope
	SPK        domain.SPK
	ActorIP    string
}

type ReportProgressParams struct {
	ContractID    int64
	Scope         Scope
	TermID        *int64
	PersenSelesai float64
	Catatan       string
	FileIDs       []int64
	BuktiURL      []string
	ActorIP       string
}

type PayTermParams struct {
	ContractID       int64
	TermID           int64
	Scope            Scope
	RealisasiNominal *float64
	TanggalRealisasi *time.Time
	ActorIP          string
}

type AuditLogFilter struct {
	Scope      Scope
	ContractID *int64
	ActorID    *int64
	From       string // YYYY-MM-DD, kosong = tanpa batas
	To         string // YYYY-MM-DD inklusif
	Limit      int
	Before     int64
}

type CreateAuditReportParams struct {
	Scope      Scope
	ContractID int64
	Jenis      string
	Ringkasan  string
	Terbit     bool
	Findings   []domain.AuditReportFinding
	ActorIP    string
}

type CreateRegionRuleParams struct {
	ActorID                 int64
	RegionID                int64
	AmbangPembelianLangsung *float64
	AmbangPenawaran         *float64
	DasarHukum              string
	BerlakuSejak            time.Time
	ActorIP                 string
}

type AssignOversightParams struct {
	ActorID        int64
	RegionIDs      []int64
	ContractID     int64
	PengawasUserID int64
	Jenis          string
	ActorIP        string
}

type UpdateProfileParams struct {
	UserID int64
	Role   domain.UserRole
	Nama   *string
	NoHP   *string
	Usaha  *UsahaInput
	IP     string
}

type UsahaInput struct {
	Nama   string
	NPWP   string
	Alamat string
}

// BuildTermSchedule memvalidasi jadwal termin dan menghitung nominal dari nilai kontrak.
// Total persen wajib 100; sisa pembulatan rupiah masuk termin terakhir agar total nominal = nilai.
func BuildTermSchedule(nilai float64, in []TermInput) ([]domain.PaymentTerm, error) {
	if len(in) == 0 || len(in) > MaxTerms {
		return nil, fmt.Errorf("%w: jumlah termin harus 1-%d", domain.ErrInvalidInput, MaxTerms)
	}
	var total, sum float64
	out := make([]domain.PaymentTerm, len(in))
	for i, t := range in {
		if t.Persen <= 0 || t.Persen > 100 {
			return nil, fmt.Errorf("%w: persen termin ke-%d harus di antara 0 dan 100", domain.ErrInvalidInput, i+1)
		}
		if t.JatuhTempo.IsZero() {
			return nil, fmt.Errorf("%w: jatuhTempo termin ke-%d wajib diisi", domain.ErrInvalidInput, i+1)
		}
		if i > 0 && t.JatuhTempo.Before(in[i-1].JatuhTempo) {
			return nil, fmt.Errorf("%w: jatuhTempo termin ke-%d tidak boleh sebelum termin sebelumnya", domain.ErrInvalidInput, i+1)
		}
		total += t.Persen
		nominal := math.Round(nilai * t.Persen / 100)
		if i == len(in)-1 {
			nominal = math.Round(nilai) - sum
		}
		sum += nominal
		out[i] = domain.PaymentTerm{Urutan: i + 1, Persen: t.Persen, Nominal: nominal, JatuhTempo: t.JatuhTempo, Status: domain.TermRencana}
	}
	if math.Abs(total-100) > 0.01 {
		return nil, fmt.Errorf("%w: total persen termin harus 100 (sekarang %.2f)", domain.ErrInvalidInput, total)
	}
	return out, nil
}

// CanSetTerms: jadwal termin bisa diganti selama belum ada termin dibayar. Setelah kontrak
// ditandatangani, jadwal hanya boleh diisi sekali (kontrak lama tanpa termin), tidak diganti.
func CanSetTerms(status domain.ContractStatus, hasTerms, anyPaid bool) error {
	switch {
	case anyPaid:
		return fmt.Errorf("%w: sudah ada termin yang dibayar", domain.ErrInvalidState)
	case status == domain.StatusDone || status == domain.StatusCancelled:
		return fmt.Errorf("%w: kontrak sudah selesai atau dibatalkan", domain.ErrInvalidState)
	case status.Locked() && hasTerms:
		return fmt.Errorf("%w: jadwal termin kontrak yang sudah ditandatangani tidak bisa diubah", domain.ErrInvalidState)
	}
	return nil
}

// CanSetSPK: SPK terbit setelah kontrak ditandatangani dan sebelum selesai.
func CanSetSPK(status domain.ContractStatus) error {
	switch status {
	case domain.StatusSigned, domain.StatusPublished, domain.StatusRunning:
		return nil
	}
	return fmt.Errorf("%w: SPK hanya bisa disimpan untuk kontrak yang sudah ditandatangani dan belum selesai", domain.ErrInvalidState)
}

// StatusAfterSPK: kontrak yang sudah dipublikasikan mulai berjalan saat SPK terbit.
func StatusAfterSPK(status domain.ContractStatus) domain.ContractStatus {
	if status == domain.StatusPublished {
		return domain.StatusRunning
	}
	return status
}

// CanReportProgress: progres fisik hanya dilaporkan saat kontrak berjalan; termin yang dirujuk belum dibayar.
func CanReportProgress(status domain.ContractStatus, term *domain.PaymentTermStatus) error {
	if status != domain.StatusRunning {
		return fmt.Errorf("%w: progres hanya bisa dilaporkan saat kontrak berjalan", domain.ErrInvalidState)
	}
	if term != nil && *term == domain.TermDibayar {
		return fmt.Errorf("%w: termin ini sudah dibayar", domain.ErrInvalidState)
	}
	return nil
}

// TermStatusAfterProgress: progres yang merujuk termin = termin diajukan untuk dibayar (jatuh_tempo).
func TermStatusAfterProgress(s domain.PaymentTermStatus) domain.PaymentTermStatus {
	if s == domain.TermRencana || s == domain.TermTerlambat {
		return domain.TermJatuhTempo
	}
	return s
}

// StatusAfterProgress: progres 100% menutup kontrak yang sedang berjalan.
func StatusAfterProgress(status domain.ContractStatus, persen float64) domain.ContractStatus {
	if status == domain.StatusRunning && persen >= 100 {
		return domain.StatusDone
	}
	return status
}

// CanPayTerm: termin dibayar hanya saat kontrak berjalan/selesai dan termin belum dibayar.
func CanPayTerm(status domain.ContractStatus, term domain.PaymentTermStatus) error {
	if status != domain.StatusRunning && status != domain.StatusDone {
		return fmt.Errorf("%w: termin bisa dibayar setelah SPK terbit dan kontrak berjalan", domain.ErrInvalidState)
	}
	if term == domain.TermDibayar {
		return domain.ErrAlreadyPaid
	}
	return nil
}

// NormalizeSealHash menerima SHA-256 heksadesimal penuh (64 karakter), huruf kecil.
func NormalizeSealHash(h string) (string, error) {
	h = strings.ToLower(strings.TrimSpace(h))
	if len(h) != 64 {
		return "", domain.ErrInvalidInput
	}
	if _, err := hex.DecodeString(h); err != nil {
		return "", domain.ErrInvalidInput
	}
	return h, nil
}

// NewResetToken membuat token reset acak; hanya hash-nya yang disimpan.
func NewResetToken() (plain, hash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	plain = base64.RawURLEncoding.EncodeToString(b)
	return plain, HashResetToken(plain), nil
}

func HashResetToken(plain string) string {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:])
}

type ReportActionParams struct {
	ReportID         int64
	Scope            Scope
	Tindakan         string // klarifikasi | eskalasi | selesai
	Catatan          string
	Status           string // target status opsional untuk klarifikasi
	DiteruskanKeRole string // eskalasi: bpd | inspektorat (default inspektorat)
	ActorIP          string
}

// reportNext: transisi status laporan warga lewat tindakan "klarifikasi".
var reportNext = map[domain.ReportStatus][]domain.ReportStatus{
	domain.ReportStatusDiterima:        {domain.ReportStatusDiverifikasi, domain.ReportStatusDitolak},
	domain.ReportStatusDiverifikasi:    {domain.ReportStatusDitindaklanjuti, domain.ReportStatusDitolak},
	domain.ReportStatusDiteruskan:      {domain.ReportStatusDitindaklanjuti, domain.ReportStatusDitolak},
	domain.ReportStatusDitindaklanjuti: {},
}

// NextReportStatus menentukan status laporan setelah tindakan petugas.
// Laporan selesai/ditolak sudah tertutup. klarifikasi tanpa status: diterima → diverifikasi, lainnya tetap (catatan saja).
func NextReportStatus(current domain.ReportStatus, tindakan, requested string) (domain.ReportStatus, error) {
	if current == domain.ReportStatusSelesai || current == domain.ReportStatusDitolak {
		return "", fmt.Errorf("%w: laporan sudah ditutup", domain.ErrInvalidState)
	}
	switch tindakan {
	case "selesai":
		return domain.ReportStatusSelesai, nil
	case "eskalasi":
		if current == domain.ReportStatusDiteruskan {
			return "", fmt.Errorf("%w: laporan sudah diteruskan", domain.ErrInvalidState)
		}
		return domain.ReportStatusDiteruskan, nil
	case "klarifikasi":
		if requested == "" || domain.ReportStatus(requested) == current {
			if current == domain.ReportStatusDiterima {
				return domain.ReportStatusDiverifikasi, nil
			}
			return current, nil
		}
		for _, s := range reportNext[current] {
			if string(s) == requested {
				return s, nil
			}
		}
		return "", fmt.Errorf("%w: status %q tidak bisa dipilih dari %q", domain.ErrInvalidState, requested, current)
	}
	return "", fmt.Errorf("%w: tindakan harus klarifikasi, eskalasi, atau selesai", domain.ErrInvalidInput)
}
