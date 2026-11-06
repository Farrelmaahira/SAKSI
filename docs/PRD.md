# Product Requirements Document: SAKSI (Sistem Audit Kontrak Segel Integritas)

## Product Overview

**Product Vision:** SAKSI adalah sistem kontrak digital untuk pemerintah desa dan UMKM yang membantu menyusun, mengaudit, menandatangani, dan mempublikasikan kontrak secara lengkap, sah, dan dapat diawasi warga.

**Target Users:** Primer: pemerintah desa (Kepala Desa, Kasi/Kaur, TPK) dan warga desa. Sekunder: BPD, Inspektorat, penyedia/UMKM (usulan), dan Admin Daerah (usulan).

**Business Objectives:**
- Mengurangi ruang penyimpangan dalam pengadaan desa dengan membuat kontrak yang jelas dan terbuka.
- Membuat keutuhan dokumen kontrak dapat dibuktikan lewat hash dan riwayat tanda tangan.
- Memberi warga dan pengawas akses ke status dan progres pekerjaan yang dibiayai dana publik.
- Menyediakan jalur pelaporan warga yang diteruskan ke pihak berwenang.

**Success Metrics (usulan):**
- Jumlah kontrak yang dibuat dan ditandatangani lewat SAKSI per desa.
- Persentase kontrak yang lolos audit AI tanpa temuan kritis.
- Persentase kontrak yang dipublikasikan sebelum pelaksanaan dimulai.
- Jumlah laporan warga dan persentase yang ditindaklanjuti.
- Waktu rata-rata dari laporan warga sampai ditindaklanjuti.

## User Personas

### Persona 1: Kepala Desa / Kasi Pemerintahan (hipotesis, perlu validasi wawancara)
- **Demographics:** Usia 35–55 tahun, perangkat desa atau kepala desa, pendidikan SMA hingga S1, kemampuan teknologi dasar (menggunakan ponsel dan aplikasi pesan).
- **Goals:** Menyusun kontrak desa yang lengkap dan sah tanpa harus menguasai seluruh ketentuan hukum, serta menghindari temuan dari pengawas.
- **Pain Points:** Tidak semua perangkat desa paham pasal wajib seperti sanksi keterlambatan dan penyelesaian sengketa. Aturan pengadaan berbeda tiap daerah. Tidak ada sistem khusus untuk kontrak desa.
- **User Journey:** Login → Buat kontrak (jawab pertanyaan sederhana) → Audit AI → Perbaiki draf → Tinjau dan tanda tangan bersama pihak kedua → Publikasikan → Catat progres pekerjaan.

### Persona 2: Warga Desa (hipotesis, perlu validasi wawancara)
- **Demographics:** Usia 20–60 tahun, pekerjaan beragam, kemampuan teknologi dasar, akses internet melalui ponsel.
- **Goals:** Memastikan dana desa digunakan sesuai kontrak dan melaporkan jika ada yang tidak sesuai.
- **Pain Points:** Kontrak desa jarang dipublikasikan. Jika ada pekerjaan yang tidak sesuai, warga tidak punya jalur pelaporan yang jelas dan tindak lanjutnya tidak terlihat.
- **User Journey:** Buka portal warga tanpa login → Cari kontrak desa → Lihat detail dan progres → Jika ada ketidaksesuaian, buat laporan → Pantau status laporan dengan kode pelacakan.

### Persona 3: Pengawas (BPD dan Inspektorat)
- **Demographics:** Anggota BPD atau auditor APIP kabupaten/kota, kemampuan teknologi menengah.
- **Goals:** Mengawasi banyak kontrak sekaligus, menindaklanjuti laporan warga, dan menyusun LHP dengan bukti yang bisa diperiksa.
- **Pain Points:** Data kontrak tidak terstruktur dan jejak audit sulit ditelusuri.
- **User Journey:** Login → Lihat laporan masuk → Periksa kontrak yang diawasi → Verifikasi hash dan jejak audit → Teruskan laporan atau susun LHP.

## Feature Requirements

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|---------|-------------|-------------|----------|---------------------|--------------|
| **F1. Pembuatan draf kontrak** | Menyusun draf perjanjian dari jawaban pertanyaan sederhana dengan bantuan AI dan templat per jenis perjanjian | Sebagai Kepala Desa, saya ingin membuat draf kontrak dari jawaban sederhana agar tidak perlu menguasai seluruh ketentuan hukum | Must | Draf memuat pasal wajib sesuai templat. Setiap perubahan disimpan sebagai versi baru. | Templat kontrak, integrasi AI engine (FastAPI), Gemini/Grok |
| **F2. Audit AI (pra-audit)** | Memeriksa kelengkapan pasal dan menampilkan temuan per pasal | Sebagai Kepala Desa, saya ingin tahu pasal yang belum lengkap sebelum kontrak ditandatangani | Must | Temuan memuat kode pasal, tingkat (kritis/saran), dan status perbaikan. Hasil ditandai sebagai saran, bukan audit resmi. | F1, daftar pasal wajib (`clause_library`) |
| **F3. Peninjauan dan tanda tangan elektronik** | Kedua pihak meninjau versi yang sama dan menandatangani secara elektronik, dengan e-meterai simulasi | Sebagai pihak kedua, saya ingin meninjau dan menandatangani draf yang sama dengan pihak pertama | Must | Tanda tangan hanya bisa dilakukan pada versi yang sama. Riwayat tanda tangan tersimpan per versi. E-meterai ditampilkan sebagai simulasi. | F1, F2, autentikasi |
| **F4. Segel hash dokumen** | Menghitung hash SHA-256 saat penandatanganan dan menyimpannya per versi, dengan rantai segel | Sebagai Inspektorat, saya ingin memastikan dokumen tidak berubah sejak ditandatangani | Must | Hash tersimpan per versi. Segel baru mengacu ke segel sebelumnya. Verifikasi menampilkan hasil cocok atau tidak cocok. | F3, tabel `document_seals` |
| **F5. Publikasi kontrak** | Mempublikasikan versi kontrak yang sudah disaring dari data pribadi | Sebagai warga, saya ingin membaca kontrak desa tanpa harus login | Must | Versi publik tidak memuat data pribadi. Versi internal tidak berubah. Kontrak dapat dicari tanpa login. | F3, F4 |
| **F6. Pelacakan progres pekerjaan** | Mencatat SPK, termin pembayaran, dan progres pekerjaan dengan bukti | Sebagai warga, saya ingin melihat progres pekerjaan dari kontrak yang dipublikasikan | Should | Progres dapat dilampiri foto atau dokumen. Realisasi termin dapat dibandingkan dengan rencana. | F5, modul file |
| **F7. Pelaporan warga** | Warga melapor tanpa akun dan mendapat kode pelacakan | Sebagai warga, saya ingin melapor ketidaksesuaian tanpa harus membuat akun | Must | Laporan memuat kategori, deskripsi, dan lampiran opsional. Kode pelacakan dapat dipakai untuk melihat status. | F5 |
| **F8. Pengawasan dan jejak audit** | BPD dan Inspektorat melihat laporan, kontrak diawasi, LHP, dan log aksi | Sebagai BPD, saya ingin menindaklanjuti laporan warga dan meneruskannya ke Inspektorat bila perlu | Should | Setiap aksi penting tercatat di log yang hanya bisa ditambah. Laporan dapat diteruskan dari BPD ke Inspektorat. | F7, F4, `audit_logs` |
| **F9. Pengaturan daerah** | Admin Daerah mengatur ambang batas, templat, dan pasal wajib per daerah | Sebagai Admin Daerah, saya ingin menyesuaikan aturan pengadaan dengan peraturan bupati/wali kota | Could | Aturan berversi dan berlaku sejak tanggal tertentu. Perubahan aturan tidak mengubah kontrak yang sudah ditandatangani. | `region_rules`, F1 |

## User Flows

### Flow 1: Pembuatan dan penandatanganan kontrak
1. Kepala Desa login dan membuka Dashboard Desa, tab Simulasi Draf.
2. Kepala Desa menjawab pertanyaan: jenis pekerjaan, nilai, tenggat, dan skema pembayaran.
3. Sistem membuat draf dan menyimpannya sebagai versi 1.
   - Alternatif: Kepala Desa mengubah jawaban, sistem membuat versi baru.
   - Error: AI engine tidak merespons. Sistem menampilkan pesan gagal dan jawaban tetap tersimpan.
4. Kepala Desa menjalankan audit AI pada versi tersebut.
5. Kepala Desa memperbaiki draf sampai tidak ada temuan kritis.
   - Alternatif: Kepala Desa menandai temuan saran sebagai diabaikan dengan alasan.
6. Kedua pihak meninjau versi yang sama dan menandatangani.
   - Error: Salah satu pihak menandatangani versi lama. Sistem menolak dan meminta peninjauan versi terbaru.
7. Sistem membuat segel hash dan mencatat e-meterai simulasi. Status berubah menjadi ditandatangani.

### Flow 2: Publikasi dan pelaksanaan
1. Kepala Desa memilih data yang akan dipublikasikan dari kontrak yang sudah ditandatangani.
   - Error: Data pribadi terdeteksi di kolom yang dipilih. Sistem meminta penyaringan ulang.
2. Kontrak tampil di portal warga.
3. Kepala Desa mencatat SPK dan termin pembayaran.
4. Kepala Desa mencatat progres pekerjaan dengan bukti foto atau dokumen.
   - Alternatif: Progres dicatat tanpa bukti. Sistem menandai progres sebagai belum terverifikasi.

### Flow 3: Pelaporan warga
1. Warga membuka portal warga dan mencari kontrak.
2. Warga memilih kontrak dan menekan tombol buat laporan.
3. Warga mengisi kategori, deskripsi, dan lampiran opsional.
4. Sistem menampilkan kode pelacakan.
   - Error: Kolom wajib kosong. Sistem menandai kolom yang belum diisi.
5. Warga memantau status laporan dengan kode pelacakan.

### Flow 4: Tindak lanjut pengawas
1. BPD membuka tab Laporan Warga dan melihat laporan masuk.
2. BPD memeriksa kontrak terkait dan jejak audit.
3. BPD meminta klarifikasi kepada pemerintah desa, atau meneruskan laporan ke Inspektorat.
   - Alternatif: Laporan dinyatakan selesai dengan catatan.
4. Inspektorat menerima laporan yang diteruskan, memverifikasi hash dokumen, dan menyusun LHP.
   - Error: Hash tidak cocok dengan segel tersimpan. Sistem menampilkan peringatan dan mencatat hasil verifikasi.

### Flow 5: Login
1. Pengguna membuka halaman login.
   - Catatan: halaman saat ini masih UI skeleton. Alur autentikasi belum terhubung.
2. Pengguna masuk dan diarahkan ke dashboard sesuai peran yang tersimpan di database.
   - Error: Peran tidak ditemukan. Akses ditolak.

## Non-Functional Requirements

### Performance
- **Load Time:** Belum ditentukan. Usulan awal: halaman utama di bawah 3 detik pada koneksi 4G.
- **Concurrent Users:** Belum ditentukan. Perlu diukur pada uji pilot.
- **Response Time:** Belum ditentukan. Respons audit AI dapat lebih lama dan perlu indikator proses.

### Security
- **Authentication:** Login untuk semua peran kecuali warga. Belum terhubung di versi saat ini.
- **Authorization:** Hak akses ditentukan dari data peran di tabel `user_roles`, bukan dari parameter URL saja. Peran: kades, bpd, inspektorat, penyedia, admin_daerah.
- **Data Protection:** Data pribadi disaring sebelum publikasi. Dokumen yang sudah disegel tidak boleh diubah. Log aksi hanya bisa ditambah.

### Compatibility
- **Devices:** Desktop dan ponsel (responsif).
- **Browsers:** Belum ditentukan. Usulan: versi terbaru Chrome, Edge, Firefox, dan Safari.
- **Screen Sizes:** Belum ditentukan. Usulan: mulai dari 360 px.

### Accessibility
- **Compliance Level:** Belum ditentukan. Usulan: WCAG 2.1 AA.
- **Specific Requirements:** Kontras teks memadai, navigasi keyboard, dan label pada form.

## Technical Specifications

### Frontend
- **Technology Stack:** Next.js.
- **Design System:** Palet dari landing page: biru #0A3CCE, navy #02258B, hitam #0F0F18, dan putih/abu #EFEFEE. Font belum dikonfirmasi.
- **Responsive Design:** Mengikuti breakpoint standar Tailwind. Detail belum ditentukan.

### Backend
- **Technology Stack:** Golang untuk API utama. FastAPI untuk AI engine yang terpisah.
- **API Requirements:** RESTful (asumsi). Endpoint per fitur sesuai bagian 7.
- **Database:** PostgreSQL. Skema terdiri dari sekitar 30 tabel, dikelompokkan per domain (wilayah, akun, kontrak, audit AI, tanda tangan, pelaksanaan, publikasi, pengawasan).

### Infrastructure
- **Hosting:** Belum ditentukan.
- **Scaling:** Belum ditentukan.
- **CI/CD:** Belum ditentukan.

## Analytics & Monitoring

- **Key Metrics:** Lihat bagian Success Metrics.
- **Events:** Kontrak dibuat, audit dijalankan, tanda tangan dilakukan, kontrak dipublikasikan, laporan dikirim, laporan diteruskan, verifikasi hash dijalankan.
- **Dashboards:** Belum ditentukan. Usulan: ringkasan jumlah kontrak per status dan jumlah laporan per status.
- **Alerting:** Belum ditentukan. Usulan: hash tidak cocok, dan laporan belum ditindaklanjuti lebih dari 14 hari.

## Release Planning

### MVP (v1.0)
- **Features:** F1 (draf kontrak), F2 (audit AI), F3 (tanda tangan dan e-meterai simulasi), F4 (segel hash), F5 (publikasi), F7 (pelaporan warga), dan halaman dashboard BPD serta Inspektorat dengan tab yang sudah ada.
- **Timeline:** Belum ditentukan.
- **Success Criteria:** Satu desa pilot dapat menyelesaikan satu kontrak dari draf sampai publikasi, dan satu laporan warga dapat diteruskan ke pengawas.

### Future Releases
- **v1.1:** F6 (pelacakan progres pekerjaan), F8 (pengawasan dan jejak audit penuh), dan penyelesaian autentikasi.
- **v1.2:** F9 (pengaturan daerah) dan dashboard Penyedia/UMKM.
- **v2.0:** Integrasi resmi dengan penyelenggara tanda tangan elektronik dan e-meterai. Ekspansi ke kontrak UMKM di luar desa.

## Open Questions & Assumptions

- **Question 1:** Status final revisi Perlem LKPP 12/2019 dan nomor barunya.
- **Question 2:** Dasar hukum peran BPD dalam pengadaan desa di tingkat daerah.
- **Question 3:** Ambang batas pembelian langsung dan penawaran yang dipakai sebagai default, dan daerah pilot mana yang dipakai.
- **Question 4:** Apakah penyedia UMKM masuk pada versi awal atau ditunda.
- **Question 5:** Mekanisme integrasi resmi untuk tanda tangan elektronik dan e-meterai.
- **Question 6:** Kriteria kapan kontrak wajib dipublikasikan dan data apa yang disaring.
- **Question 7:** Siapa yang berwenang menetapkan status "selesai" pada kontrak.
- **Question 8:** Apakah laporan warga perlu verifikasi identitas atau cukup kode pelacakan.
- **Assumption 1:** Audit AI hanya memeriksa kelengkapan pasal, bukan kewajaran harga atau kesesuaian dengan peraturan bupati.
- **Assumption 2:** Tanda tangan dan e-meterai pada prototipe bersifat simulasi.
- **Assumption 3:** Inspektorat adalah satu-satunya auditor resmi. BPD berperan sebagai pengawas.
- **Assumption 4:** Persona pengguna berdasarkan studi literatur dan asumsi tim, belum divalidasi lewat wawancara.

## Appendix

### Competitive Analysis
- **Competitor 1:** Belum diteliti. Perlu pencarian sistem kontrak desa dan platform pengadaan daerah yang sudah ada.
- **Competitor 2:** Belum diteliti. Perlu pencarian platform pengaduan warga seperti sistem pengaduan pemerintah daerah.

### User Research Findings
- **Finding 1:** Desa menjadi sektor dengan kasus korupsi terbanyak pada 2024, yaitu 77 dari 364 kasus (ICW, dikutip RRI 2025).
- **Finding 2:** Lima modus penyimpangan pengadaan desa menurut KPK: penggelembungan anggaran, permainan harga, konflik kepentingan, proyek fiktif, dan laporan tidak sesuai kondisi lapangan (InfoPublik, 2026).
- **Finding 3:** Dataset kontrak terbuka nasional tidak memuat kontrak desa dan hanya mencakup APBN dan APBD (Open Contracting Partnership, 2026).
- **Finding 4:** Dalam eksperimen di 600 proyek jalan desa, peningkatan proporsi proyek yang diaudit dari 4% menjadi 100% menurunkan pengeluaran yang hilang sekitar delapan poin persentase (Olken, 2007).
- **Finding 5:** Penelitian kualitatif menemukan tiga masalah utama tata kelola desa yang berkontribusi pada korupsi (Putri, Argilés-Bosch, dan Ravenda, 2024).

### AI Conversation Insights
- **Conversation 1:** 6 November 2026, Claude (Anthropic). Pembahasan alur pengadaan desa, dasar hukum, dan posisi auditor. Temuan utama: audit berlapis (AI, hash, BPD, Inspektorat, warga), dengan Inspektorat sebagai satu-satunya auditor resmi.
- **Conversation 2:** 6 November 2026, Claude (Anthropic). Penyusunan dashboard, use case, skema database, dan PRD. Temuan utama: hash menempel ke versi kontrak, publikasi disimpan terpisah dari versi internal, dan laporan warga tidak memerlukan akun.
- **AI-Generated Edge Cases:** Revisi kontrak setelah tanda tangan, laporan warga tanpa akun yang perlu dilacak, kontrak yang diawasi dua pengawas sekaligus, dan perubahan aturan daerah saat kontrak sudah berjalan.
- **AI-Suggested Improvements:** Menyebut audit AI sebagai "pra-audit" untuk menghindari salah tafsir sebagai audit hukum. Menyimpan aturan daerah sebagai data berversi, bukan hardcode. Memisahkan versi publik dari versi internal.

### Glossary
- **APBDes:** Anggaran Pendapatan dan Belanja Desa.
- **APIP:** Aparat Pengawasan Intern Pemerintah.
- **BPD:** Badan Permusyawaratan Desa.
- **Dana Desa:** Dana dari APBN untuk desa.
- **E-meterai:** Meterai elektronik sebagai bea meterai untuk dokumen digital.
- **Hash:** Nilai ringkas dari isi dokumen yang berubah jika isi dokumen berubah.
- **Inspektorat:** APIP di tingkat kabupaten/kota.
- **KPA:** Kuasa Pengguna Anggaran.
- **LHP:** Laporan Hasil Pemeriksaan.
- **Musrenbangdes:** Musyawarah perencanaan pembangunan desa.
- **Perlem LKPP:** Peraturan Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah.
- **SPK:** Surat Perintah Kerja.
- **Termin:** Tahap pembayaran yang dibagi berdasarkan progres pekerjaan.
- **TPK:** Tim Pelaksana Kegiatan.
- **Uji petik:** Pemeriksaan sampel dokumen atau pekerjaan untuk menilai kesesuaian.