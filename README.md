# SAKSI (Sistem Audit Kontrak Segel Integritas)

SAKSI (Sistem Audit Kontrak Segel Integritas) adalah platform kontrak digital yang membantu pemerintah desa, dan dapat diperluas ke UMKM serta freelancer, membuat perjanjian yang lengkap, sah, dan dapat diawasi.

## Alur Kerja Utama
1. **Kuisioner Cerdas (Smart Q&A):** Pengguna menjawab beberapa pertanyaan sederhana.
2. **Penyusunan Kontrak Berbasis AI:** AI menyusun draf perjanjian dan memeriksa kelengkapan pasal-pasal penting.
3. **Peninjauan & Persetujuan:** Kontrak ditinjau oleh kedua belah pihak secara transparan.
4. **Tanda Tangan Elektronik & e-Meterai:** Penandatanganan kontrak secara digital dan sah menurut hukum dengan e-meterai.
5. **Pencatatan Hash Dokumen (Segel Integritas):** Hash kriptografi dokumen dicatat agar setiap perubahan atau pemalsuan pasca-penandatanganan dapat terdeteksi secara instan.
6. **Penerbitan Kontrak Publik (Redaksi Data Pribadi):** Kontrak dipublikasikan ke publik setelah data pribadi (PII) disaring dan disamarkan.
7. **Pengawasan Warga & Pelaporan:** Warga masyarakat dapat memantau progres pekerjaan dan melaporkan indikasi kecurangan jika pelaksanaan di lapangan tidak sesuai dengan kontrak yang disepakati.

## Struktur Repositori
```text
├── frontend/    # Antarmuka web pengguna (Next.js, TypeScript, Tailwind CSS)
├── backend/     # API & Layanan Inti Bisnis (Golang)
├── ai-engine/   # Layanan Pemrosesan AI / LLM (Python)
└── docs/        # Rencana arsitektur dan dokumentasi implementasi
```
