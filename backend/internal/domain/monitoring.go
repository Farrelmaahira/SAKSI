package domain

import (
	"encoding/json"
	"errors"
	"time"
)

// ErrInvalidState: status kontrak/termin tidak mengizinkan aksi ini (HTTP 409 INVALID_STATE).
var ErrInvalidState = errors.New("domain: invalid state")

// ErrCriticalFindings: audit AI terakhir masih punya temuan kritis yang belum diperbaiki (HTTP 409 CRITICAL_FINDINGS).
var ErrCriticalFindings = errors.New("domain: critical audit findings still open")

// ErrAlreadyPaid: termin sudah berstatus dibayar.
var ErrAlreadyPaid = errors.New("domain: payment term already paid")

type PaymentTermStatus string

const (
	TermRencana    PaymentTermStatus = "rencana"
	TermJatuhTempo PaymentTermStatus = "jatuh_tempo"
	TermDibayar    PaymentTermStatus = "dibayar"
	TermTerlambat  PaymentTermStatus = "terlambat"
)

type PaymentTerm struct {
	ID               int64             `json:"id"`
	ContractID       int64             `json:"contractId"`
	Urutan           int               `json:"urutan"`
	Persen           float64           `json:"persen"`
	Nominal          float64           `json:"nominal"`
	JatuhTempo       time.Time         `json:"jatuhTempo"`
	Status           PaymentTermStatus `json:"status"`
	RealisasiNominal *float64          `json:"realisasiNominal,omitempty"`
	TanggalRealisasi *time.Time        `json:"tanggalRealisasi,omitempty"`
}

type ProgressEvidence struct {
	FileID           int64  `json:"fileId"`
	KunciPenyimpanan string `json:"kunciPenyimpanan"`
	Mime             string `json:"mime"`
	Ukuran           int64  `json:"ukuran"`
}

type WorkProgress struct {
	ID             int64              `json:"id"`
	ContractID     int64              `json:"contractId"`
	TermID         *int64             `json:"termId,omitempty"`
	PersenSelesai  float64            `json:"persenSelesai"`
	Catatan        string             `json:"catatan"`
	DilaporkanOleh int64              `json:"dilaporkanOleh"`
	PelaporNama    string             `json:"pelaporNama"`
	Waktu          time.Time          `json:"waktu"`
	Bukti          []ProgressEvidence `json:"bukti"`
}

type SPK struct {
	ID         int64      `json:"id"`
	ContractID int64      `json:"contractId"`
	Nomor      string     `json:"nomor"`
	Tanggal    time.Time  `json:"tanggal"`
	Mulai      *time.Time `json:"mulai,omitempty"`
	Selesai    *time.Time `json:"selesai,omitempty"`
}

type ContractTermin struct {
	ContractID      int64          `json:"contractId"`
	VillageID       int64          `json:"villageId"`
	Status          ContractStatus `json:"status"`
	Nilai           float64        `json:"nilai"`
	TotalDibayar    float64        `json:"totalDibayar"`
	ProgresTerakhir float64        `json:"progresTerakhir"`
	SPK             *SPK           `json:"spk"`
	Terms           []PaymentTerm  `json:"terms"`
	Progress        []WorkProgress `json:"progress"`
}

type TerminSummary struct {
	ContractID      int64          `json:"contractId"`
	Nomor           string         `json:"nomor"`
	Judul           string         `json:"judul"`
	VillageID       int64          `json:"villageId"`
	VillageName     string         `json:"villageName"`
	Nilai           float64        `json:"nilai"`
	Status          ContractStatus `json:"status"`
	TotalDibayar    float64        `json:"totalDibayar"`
	ProgresTerakhir float64        `json:"progresTerakhir"`
	Terms           []PaymentTerm  `json:"terms"`
}

// SealVerifyResult adalah hasil verifikasi publik segel dari hash SHA-256.
type SealVerifyResult struct {
	Cocok   bool              `json:"cocok"`
	Segel   *SealInfo         `json:"segel,omitempty"`
	Kontrak *SealContractInfo `json:"kontrak,omitempty"`
}

type SealInfo struct {
	ID                int64     `json:"id"`
	VersionID         int64     `json:"versionId"`
	NomorVersi        int       `json:"nomorVersi"`
	SHA256            string    `json:"sha256"`
	WaktuSegel        time.Time `json:"waktuSegel"`
	SegelSebelumnyaID *int64    `json:"segelSebelumnyaId"`
	Chain             string    `json:"chain"`
	TxHash            string    `json:"txHash"`
}

type SealContractInfo struct {
	ID          int64  `json:"id"`
	Nomor       string `json:"nomor"`
	Judul       string `json:"judul"`
	VillageName string `json:"villageName"`
}

type SealSummary struct {
	SealID            int64     `json:"sealId"`
	ContractID        int64     `json:"contractId"`
	Nomor             string    `json:"nomor"`
	Judul             string    `json:"judul"`
	VillageID         int64     `json:"villageId"`
	VillageName       string    `json:"villageName"`
	VersionID         int64     `json:"versionId"`
	NomorVersi        int       `json:"nomorVersi"`
	SHA256            string    `json:"sha256"`
	WaktuSegel        time.Time `json:"waktuSegel"`
	SegelSebelumnyaID *int64    `json:"segelSebelumnyaId"`
	Chain             string    `json:"chain"`
	TxHash            string    `json:"txHash"`
	JumlahVerifikasi  int       `json:"jumlahVerifikasi"`
}

type Notification struct {
	ID         int64      `json:"id"`
	Jenis      string     `json:"jenis"`
	Pesan      string     `json:"pesan"`
	Tautan     string     `json:"tautan"`
	Dibaca     bool       `json:"dibaca"`
	DibacaPada *time.Time `json:"dibacaPada"`
	DibuatPada time.Time  `json:"dibuatPada"`
}

type AuditLogEntry struct {
	ID            int64           `json:"id"`
	AktorUserID   *int64          `json:"aktorUserId"`
	AktorNama     string          `json:"aktorNama"`
	AktorRole     string          `json:"aktorRole"`
	Aksi          string          `json:"aksi"`
	JenisObjek    string          `json:"jenisObjek"`
	IDObjek       int64           `json:"idObjek"`
	ContractID    *int64          `json:"contractId"`
	ContractJudul string          `json:"contractJudul"`
	VillageID     *int64          `json:"villageId"`
	VillageName   string          `json:"villageName"`
	Sebelum       json.RawMessage `json:"sebelum"`
	Sesudah       json.RawMessage `json:"sesudah"`
	Waktu         time.Time       `json:"waktu"`
}

type AuditReportFinding struct {
	ID          int64  `json:"id"`
	Objek       string `json:"objek"`   // spk | termin | pasal
	Temuan      string `json:"temuan"`  //
	Tingkat     string `json:"tingkat"` // kritis | saran
	Rekomendasi string `json:"rekomendasi"`
}

type AuditReport struct {
	ID             int64                `json:"id"`
	ContractID     int64                `json:"contractId"`
	ContractJudul  string               `json:"contractJudul"`
	VillageID      *int64               `json:"villageId"`
	VillageName    string               `json:"villageName"`
	Jenis          string               `json:"jenis"` // lhp | uji_petik
	PenyusunUserID int64                `json:"penyusunUserId"`
	PenyusunNama   string               `json:"penyusunNama"`
	Ringkasan      string               `json:"ringkasan"`
	Status         string               `json:"status"` // draf | terbit
	TerbitPada     *time.Time           `json:"terbitPada"`
	JumlahTemuan   int                  `json:"jumlahTemuan"`
	Findings       []AuditReportFinding `json:"findings,omitempty"`
}

type RegionRule struct {
	ID                      int64     `json:"id"`
	RegionID                int64     `json:"regionId"`
	RegionNama              string    `json:"regionNama"`
	AmbangPembelianLangsung *float64  `json:"ambangPembelianLangsung"`
	AmbangPenawaran         *float64  `json:"ambangPenawaran"`
	DasarHukum              string    `json:"dasarHukum"`
	BerlakuSejak            time.Time `json:"berlakuSejak"`
}

type OversightAssignment struct {
	ID             int64     `json:"id"`
	ContractID     int64     `json:"contractId"`
	ContractJudul  string    `json:"contractJudul"`
	VillageName    string    `json:"villageName"`
	PengawasUserID int64     `json:"pengawasUserId"`
	PengawasNama   string    `json:"pengawasNama"`
	Jenis          string    `json:"jenis"` // bpd | inspektorat
	DitetapkanPada time.Time `json:"ditetapkanPada"`
}

type Pengawas struct {
	UserID      int64  `json:"userId"`
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	Jenis       string `json:"jenis"`
	VillageID   *int64 `json:"villageId"`
	VillageName string `json:"villageName"`
	RegionID    *int64 `json:"regionId"`
}
