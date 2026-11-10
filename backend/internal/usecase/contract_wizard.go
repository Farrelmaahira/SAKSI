package usecase

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"saksi-backend/internal/domain"
)

type CreateContractDraftParams struct {
	Jenis           domain.ContractJenis
	Judul           string
	KadesName       string
	VillageName     string
	VendorName      string
	VendorNPWP      string
	VendorAddress   string
	Nilai           float64
	Tenggat         time.Time
	SkemaPembayaran string
	MetodePemilihan string
	JawabanForm     map[string]any
}

// GenerateWizardQuestions mengembalikan daftar pertanyaan wizard sesuai jenis kontrak.
func GenerateWizardQuestions(jenis domain.ContractJenis, vendorName string) []domain.WizardQuestion {
	if vendorName == "" {
		vendorName = "Pihak Kedua / Rekanan"
	}

	commonQuestions := []domain.WizardQuestion{
		{
			Key:         "lingkup_pekerjaan",
			Label:       "Ruang Lingkup dan Spesifikasi Utama",
			Description: "Jelaskan rincian volume, spesifikasi teknis, atau target pekerjaan yang harus diserahkan oleh " + vendorName,
			Type:        "textarea",
			Required:    true,
			Placeholder: "Contoh: Pengaspalan jalan volume 350m x 3m dengan agregat kelas B...",
		},
		{
			Key:         "jadwal_mulai",
			Label:       "Tanggal Mulai Efektif Pelaksanaan",
			Description: "Tanggal pekerjaan atau kegiatan mulai dilaksanakan",
			Type:        "date",
			Required:    true,
		},
		{
			Key:         "tahapan_serah_terima",
			Label:       "Mekanisme Serah Terima Hasil Pekerjaan",
			Description: "Kriteria pemeriksaan fisik oleh Tim Pelaksana Kegiatan (TPK) desa",
			Type:        "textarea",
			Required:    false,
			Placeholder: "Berita Acara Serah Terima (BAST) setelah pemeriksaan fisik 100% bersama BPD...",
		},
		{
			Key:         "rekening_bank",
			Label:       "Informasi Rekening Bank Rekanan",
			Description: "Nama bank dan nomor rekening untuk transfer pembayaran",
			Type:        "text",
			Required:    false,
			Placeholder: "Contoh: Bank Jateng Cabang Banyumas No. Rek 1234567890 a.n. " + vendorName,
		},
	}

	switch jenis {
	case domain.JenisPengadaan, domain.JenisUMKM:
		return append(commonQuestions, []domain.WizardQuestion{
			{
				Key:         "masa_garansi",
				Label:       "Masa Pemeliharaan / Garansi (Hari/Bulan)",
				Description: "Masa pertanggungjawaban pemeliharaan oleh rekanan setelah BAST",
				Type:        "text",
				Required:    false,
				Placeholder: "Contoh: 90 (sembilan puluh) hari kalender",
			},
			{
				Key:         "denda_keterlambatan",
				Label:       "Besaran Denda Keterlambatan",
				Description: "Sanksi denda per hari jika rekanan melewati tenggat",
				Type:        "select",
				Required:    true,
				Options: []domain.WizardQuestionOption{
					{Value: "1_per_mil", Label: "1/1000 (satu permil) per hari keterlambatan dari nilai kontrak"},
					{Value: "1_per_mil_bagian", Label: "1/1000 (satu permil) dari bagian kontrak yang belum diselesaikan"},
				},
			},
		}...)

	case domain.JenisHibah:
		return []domain.WizardQuestion{
			{
				Key:         "tujuan_hibah",
				Label:       "Maksud dan Tujuan Pemberian Hibah",
				Description: "Peruntukan pemanfaatan bantuan barang/dana hibah bagi masyarakat desa",
				Type:        "textarea",
				Required:    true,
				Placeholder: "Contoh: Peningkatan sarana posyandu balita dan lansia...",
			},
			{
				Key:         "jadwal_mulai",
				Label:       "Jadwal Penyaluran / Pemanfaatan",
				Type:        "date",
				Required:    true,
			},
			{
				Key:         "kewajiban_lpj",
				Label:       "Batas Waktu Penyampaian Laporan Pertanggungjawaban (LPJ)",
				Description: "Kewajiban pelaporan penerima hibah kepada Kepala Desa",
				Type:        "text",
				Required:    true,
				Placeholder: "Contoh: Maksimal 30 hari kalender setelah dana/barang diterima",
			},
			{
				Key:         "larangan_pengalihan",
				Label:       "Komitmen Larangan Pengalihan Aset",
				Type:        "select",
				Required:    true,
				Options: []domain.WizardQuestionOption{
					{Value: "ya", Label: "Bersedia tidak mengalihkan atau memperjualbelikan aset hibah"},
				},
			},
		}

	case domain.JenisKerjaSamaBUMDes:
		return []domain.WizardQuestion{
			{
				Key:         "lingkup_pekerjaan",
				Label:       "Bidang dan Bentuk Kerja Sama Usaha Desa",
				Type:        "textarea",
				Required:    true,
				Placeholder: "Contoh: Pengelolaan unit usaha wisata desa dan rest area...",
			},
			{
				Key:         "jadwal_mulai",
				Label:       "Tanggal Mulai Operasional",
				Type:        "date",
				Required:    true,
			},
			{
				Key:         "bagi_hasil",
				Label:       "Skema Bagi Hasil / Kontribusi PADes",
				Description: "Persentase atau nominal tetap setoran ke Pendapatan Asli Desa",
				Type:        "text",
				Required:    true,
				Placeholder: "Contoh: 30% dari laba bersih disetorkan ke kas desa setiap semester",
			},
			{
				Key:         "evaluasi_kinerja",
				Label:       "Periode Evaluasi Bersama BPD",
				Type:        "select",
				Required:    true,
				Options: []domain.WizardQuestionOption{
					{Value: "tahunan", Label: "Evaluasi setiap 1 (satu) tahun anggaran"},
					{Value: "semester", Label: "Evaluasi setiap 6 (enam) bulan"},
				},
			},
		}

	case domain.JenisSewaAset:
		return []domain.WizardQuestion{
			{
				Key:         "lingkup_pekerjaan",
				Label:       "Identitas dan Rincian Aset Desa yang Disewakan",
				Type:        "textarea",
				Required:    true,
				Placeholder: "Contoh: Tanah kas desa seluas 1.500 m2 di blok Legok...",
			},
			{
				Key:         "jadwal_mulai",
				Label:       "Awal Masa Sewa",
				Type:        "date",
				Required:    true,
			},
			{
				Key:         "peruntukan_sewa",
				Label:       "Peruntukan Pemanfaatan Lahan / Bangunan",
				Type:        "text",
				Required:    true,
				Placeholder: "Contoh: Pertanian tanaman pangan / gudang logistik",
			},
			{
				Key:         "jaminan_perawatan",
				Label:       "Tanggung Jawab Pemeliharaan dan Pajak (PBB)",
				Type:        "select",
				Required:    true,
				Options: []domain.WizardQuestionOption{
					{Value: "penyewa", Label: "Sepenuhnya ditanggung oleh Penyewa"},
					{Value: "proporsional", Label: "PBB ditanggung Desa, perawatan ditanggung Penyewa"},
				},
			},
		}

	default:
		return commonQuestions
	}
}

// formatRupiah memformat angka ke format Rupiah Indonesia standar.
func formatRupiah(amount float64) string {
	intPart := int64(amount)
	str := fmt.Sprintf("%d", intPart)
	n := len(str)
	if n <= 3 {
		return "Rp " + str
	}

	var sb strings.Builder
	sb.WriteString("Rp ")
	rem := n % 3
	if rem > 0 {
		sb.WriteString(str[:rem])
		if n > rem {
			sb.WriteString(".")
		}
	}
	for i := rem; i < n; i += 3 {
		sb.WriteString(str[i : i+3])
		if i+3 < n {
			sb.WriteString(".")
		}
	}
	return sb.String()
}

// RenderContractDraft menghasilkan draf teks SPK lengkap berlandaskan kaidah hukum kontrak pengadaan desa (rule engine).
func RenderContractDraft(p CreateContractDraftParams) (string, error) {
	return ComposeContractText(p, RuleDraftClauses(p)), nil
}

// ComposeContractText menyusun naskah lengkap: kepala SPK (identitas para pihak) + pasal + penutup.
func ComposeContractText(p CreateContractDraftParams, clauses []domain.Clause) string {
	p = withDraftDefaults(p)
	var sb strings.Builder
	sb.WriteString("================================================================================\n")
	sb.WriteString("                  SURAT PERJANJIAN KERJA (SPK) PEMERINTAH DESA                  \n")
	sb.WriteString("================================================================================\n\n")

	sb.WriteString(fmt.Sprintf("TENTANG: %s\n", strings.ToUpper(p.Judul)))
	sb.WriteString(fmt.Sprintf("JENIS KONTRAK: %s | METODE PEMILIHAN: %s\n\n", strings.ToUpper(string(p.Jenis)), strings.ToUpper(p.MetodePemilihan)))

	sb.WriteString(fmt.Sprintf("Pada hari ini, tanggal %s, bertempat di Kantor Desa %s, kami yang bertanda tangan di bawah ini:\n\n", time.Now().Format("02 January 2006"), p.VillageName))

	sb.WriteString(fmt.Sprintf("1. NAMA        : %s\n", p.KadesName))
	sb.WriteString(fmt.Sprintf("   JABATAN     : Kepala Desa %s\n", p.VillageName))
	sb.WriteString("   ALAMAT      : Kantor Pemerintah Desa Setempat\n")
	sb.WriteString("   Bertindak untuk dan atas nama Pemerintah Desa, selanjutnya disebut sebagai PIHAK PERTAMA.\n\n")

	sb.WriteString(fmt.Sprintf("2. REKANAN     : %s\n", p.VendorName))
	sb.WriteString(fmt.Sprintf("   NPWP        : %s\n", p.VendorNPWP))
	sb.WriteString(fmt.Sprintf("   ALAMAT      : %s\n", p.VendorAddress))
	sb.WriteString("   Bertindak secara sah untuk dan atas nama badan usaha/pribadi, selanjutnya disebut sebagai PIHAK KEDUA.\n\n")

	sb.WriteString("Kedua belah pihak secara bersama-sama telah sepakat mengikatkan diri dalam Perjanjian Kerja dengan ketentuan sebagai berikut:\n\n")

	sb.WriteString(ClausesToText(clauses))

	sb.WriteString("Demikian Surat Perjanjian Kerja ini dibuat dalam rangkap 2 (dua) bermeterai cukup dan memiliki kekuatan hukum yang sama.\n\n")
	sb.WriteString("PIHAK PERTAMA (Kepala Desa)                 PIHAK KEDUA (Rekanan)\n\n\n\n")
	sb.WriteString(fmt.Sprintf("( %s )                                ( %s )\n", p.KadesName, p.VendorName))
	return sb.String()
}

func withDraftDefaults(p CreateContractDraftParams) CreateContractDraftParams {
	def := func(v, d string) string {
		if v = strings.TrimSpace(v); v == "" {
			return d
		}
		return v
	}
	p.KadesName = def(p.KadesName, "Kepala Desa")
	p.VillageName = def(p.VillageName, "Pemerintah Desa")
	p.VendorName = def(p.VendorName, "Pihak Kedua / Rekanan")
	p.VendorNPWP = def(p.VendorNPWP, "-")
	p.VendorAddress = def(p.VendorAddress, "Sesuai domisili badan usaha")
	p.SkemaPembayaran = def(p.SkemaPembayaran, "Sekaligus setelah pekerjaan selesai 100%")
	p.MetodePemilihan = def(p.MetodePemilihan, "Pengadaan Langsung")
	return p
}

// RuleDraftClauses adalah pasal baku rule engine; dipakai saat DraftContract AI tidak tersedia.
func RuleDraftClauses(p CreateContractDraftParams) []domain.Clause {
	p = withDraftDefaults(p)
	lingkup, _ := p.JawabanForm["lingkup_pekerjaan"].(string)
	if lingkup == "" {
		lingkup = p.Judul
	}
	isi := []struct{ judul, isi string }{
		{"RUANG LINGKUP PEKERJAAN", fmt.Sprintf("PIHAK KEDUA berkewajiban melaksanakan dan menyelesaikan pekerjaan: %s, sesuai dengan rincian teknis dan penawaran yang telah disepakati.", lingkup)},
		{"NILAI KONTRAK DAN PEMBIAYAAN", fmt.Sprintf("1. Total nilai pekerjaan yang disepakati adalah sebesar %s (termasuk pajak sesuai ketentuan peraturan perundang-undangan yang berlaku).\n2. Sumber pembiayaan dibebankan pada Anggaran Pendapatan dan Belanja Desa (APBDes) tahun anggaran berjalan.", formatRupiah(p.Nilai))},
		{"JANGKA WAKTU PELAKSANAAN", fmt.Sprintf("Pekerjaan wajib diselesaikan secara menyeluruh paling lambat tanggal %s, dibuktikan dengan Berita Acara Serah Terima (BAST).", p.Tenggat.Format("02 January 2006"))},
		{"SISTEM DAN TATA CARA PEMBAYARAN", fmt.Sprintf("1. Skema pembayaran dilaksanakan secara: %s.\n2. Pembayaran ditransfer ke rekening resmi PIHAK KEDUA setelah verifikasi kelengkapan berkas fisik dan administrasi oleh Tim Pelaksana Kegiatan.", p.SkemaPembayaran)},
		{"HAK DAN KEWAJIBAN", "1. PIHAK PERTAMA berhak menerima hasil pekerjaan sesuai spesifikasi dan berkewajiban melakukan pembayaran tepat waktu.\n2. PIHAK KEDUA berkewajiban menyelesaikan pekerjaan tepat waktu, tepat mutu, serta berhak menerima pembayaran sesuai termin."},
		{"JAMINAN PEMELIHARAAN DAN GARANSI", "PIHAK KEDUA memberikan jaminan pemeliharaan dan mutu atas hasil pekerjaan selama masa garansi terhitung sejak tanggal penandatanganan BAST."},
		{"SANKSI DAN DENDA KETERLAMBATAN", "Apabila terjadi keterlambatan penyelesaian pekerjaan yang disebabkan oleh kelalaian PIHAK KEDUA, maka dikenakan denda keterlambatan sebesar 1/1000 (satu permil) untuk setiap hari keterlambatan."},
		{"KLAUSUL INTEGRITAS DAN ANTI KORUPSI", "1. Para pihak berkomitmen menjunjung tinggi prinsip transparansi, akuntabilitas, serta bebas dari korupsi, kolusi, dan nepotisme.\n2. Dilarang keras menjanjikan, menawarkan, atau memberikan imbalan dalam bentuk apa pun (suap/gratifikasi) yang berkaitan dengan perjanjian ini."},
		{"KEADAAN KAHAR (FORCE MAJEURE)", "Keadaan kahar meliputi bencana alam, kebijakan moneter mendesak, atau huru-hara yang berada di luar kemampuan wajar para pihak untuk mencegahnya."},
		{"PENYELESAIAN PERSELISIHAN", "Segala perselisihan yang timbul dari pelaksanaan perjanjian ini akan diselesaikan secara musyawarah dan mufakat. Apabila musyawarah tidak tercapai, para pihak sepakat menyelesaikannya melalui Pengadilan Negeri setempat."},
	}
	out := make([]domain.Clause, len(isi))
	for i, c := range isi {
		out[i] = domain.Clause{KodePasal: fmt.Sprintf("P-%02d", i+1), Judul: c.judul, Isi: c.isi, Urutan: i + 1}
	}
	return out
}

type mandatoryRule struct {
	Name     string
	Keywords []string
}

// mandatoryRules adalah satu-satunya daftar klausul wajib; AI Engine menerima nama-namanya sebagai checklist.
var mandatoryRules = []mandatoryRule{
	{Name: "Objek dan Ruang Lingkup", Keywords: []string{"ruang lingkup", "lingkup pekerjaan", "spk", "pekerjaan"}},
	{Name: "Nilai Kontrak dan Ketentuan Pajak", Keywords: []string{"nilai", "rp", "pajak", "apbdes"}},
	{Name: "Jangka Waktu dan Serah Terima (BAST)", Keywords: []string{"jangka waktu", "paling lambat", "bast", "tenggat"}},
	{Name: "Hak dan Kewajiban Para Pihak", Keywords: []string{"hak", "kewajiban"}},
	{Name: "Tata Cara Pembayaran", Keywords: []string{"pembayaran", "skema", "termin", "rekening"}},
	{Name: "Jaminan Pemeliharaan dan Garansi", Keywords: []string{"pemeliharaan", "garansi", "jaminan"}},
	{Name: "Sanksi dan Denda Keterlambatan", Keywords: []string{"sanksi", "denda", "1/1000", "permil"}},
	{Name: "Pakta Integritas dan Anti Korupsi", Keywords: []string{"integritas", "anti korupsi", "suap", "gratifikasi"}},
	{Name: "Penyelesaian Perselisihan", Keywords: []string{"penyelesaian", "perselisihan", "musyawarah"}},
}

// RuleAuditorModel dicatat di ai_audits.model bila audit dilakukan rule auditor, bukan LLM.
const RuleAuditorModel = "saksi-rule-auditor-v1"

func MandatoryClauseNames() []string {
	names := make([]string, len(mandatoryRules))
	for i, r := range mandatoryRules {
		names[i] = r.Name
	}
	return names
}

func HashText(text string) string {
	h := sha256.Sum256([]byte(text))
	return hex.EncodeToString(h[:])
}

// AuditContractDraft melakukan audit kepatuhan klausul standar terhadap teks kontrak.
func AuditContractDraft(contractText string) (score float64, fulfilled int, total int, summary string, hash string) {
	rules := mandatoryRules

	total = len(rules)
	missingRules := missingMandatory(contractText)
	fulfilled = total - len(missingRules)

	score = (float64(fulfilled) / float64(total)) * 100.0

	hash = HashText(contractText)

	if len(missingRules) == 0 {
		summary = fmt.Sprintf("Audit berhasil: Seluruh %d klausul wajib terpenuhi dengan skor sempurna 100%%. Dokumen memenuhi standar akuntabilitas pengadaan desa.", total)
	} else {
		summary = fmt.Sprintf("Audit parsial: %d dari %d klausul wajib terpenuhi (Skor: %.1f%%). Klausul belum terdeteksi: %s.",
			fulfilled, total, score, strings.Join(missingRules, ", "))
	}

	return score, fulfilled, total, summary, hash
}

func missingMandatory(contractText string) []string {
	textLower := strings.ToLower(contractText)
	var missing []string
	for _, rule := range mandatoryRules {
		matched := false
		for _, kw := range rule.Keywords {
			if strings.Contains(textLower, kw) {
				matched = true
				break
			}
		}
		if !matched {
			missing = append(missing, rule.Name)
		}
	}
	return missing
}

