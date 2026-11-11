# Tugas per session (handoff PM, 2026-11-11)

Cara pakai: salin blok "TEMPEL KE SESSION ..." ke session yang bersangkutan. Tiap blok berdiri sendiri (tidak butuh konteks PM).
Rencana induk: `docs/superpowers/plans/2026-11-10-grpc-redis-ai-manual-drafting.md` (bagian 7 = kontrak endpoint lanjutan, 7.12 = batal kontrak).

## Status singkat (per 2026-11-11)

| Hal | Status |
|---|---|
| Error model AI saat buat kontrak | Diperbaiki di kode (`usecase.TemplateOrRule`). Di Azure BELUM, menunggu deploy |
| Batal kontrak draf (`DELETE /contracts/{id}`) | Selesai BE+FE, lulus tes lokal. Azure BELUM |
| Bug daftar kontrak duplikat setelah audit ulang | Diperbaiki (LATERAL di `ListContracts`/`GetContractDetail`) + tes regresi. Azure BELUM |
| Endpoint tahap B (termin, segel, notifikasi, jejak audit, LHP, admin daerah, profil, reset sandi, tindak lanjut laporan) | BE selesai, FE tersambung. Teruji API per peran, BELUM dilihat di browser |
| Akun demo (6 akun, sandi `saksi123`) | Ada di Azure dan lokal (`backend/scripts/seed_demo.sql`) |
| Kirim ke pihak kedua | BUG KRITIS (lihat bagian di bawah): pihak kedua tidak bisa menemukan/membuka kontrak. BELUM diperbaiki; butuh BE + FE |
| Commit | Banyak perubahan BELUM di-commit |

## ATURAN UNTUK SEMUA TIM (keputusan user, 2026-11-11)

**Akun hanya yang sudah ada di panel "Akun demo" halaman login, dan TIDAK ditambah** (tidak ada akun baru di seed, di Azure, maupun lewat uji coba). Tujuannya: seluruh CRUD dan logic flow bisa dilacak di dalam dashboard dari akun-akun yang sama, tanpa data/akun uji yang mengotori tampilan.

Akibat untuk tiap tim:
- **Jangan membuat akun baru** (tidak lewat `/auth/register`, tidak lewat seed, tidak untuk tes asap). Uji memakai akun demo saja.
- **Jangan menambah data uji sembarangan** di database Azure; buat data hanya lewat alur UI/API dengan akun demo, supaya jejaknya (jejak audit, riwayat kontrak, notifikasi) rapi dan bisa dibaca di dashboard.
- **Setiap aksi CRUD harus terlacak di dashboard**: tercatat di `audit_logs` (aktor, peran, aksi, objek, waktu), muncul di Jejak Audit dan Riwayat kontrak, dan memicu notifikasi ke pihak terkait. Lihat tugas BE dan FE di bawah.
- Akun uji yang sudah terlanjur ada (Azure: 3 akun `cek.deploy.*@example.com`; lokal: `*@smoke.local`) bukan bagian dari demo — direkomendasikan dihapus (DevOps, dengan persetujuan user).

## BUG KRITIS: pihak kedua tidak menemukan kontrak yang dikirim (ditemukan 2026-11-11, dibuktikan lewat API lokal)

Gejala (laporan user): kades "Simpan dan kirim ke pihak kedua" / "Kirim untuk ditinjau", tetapi pihak kedua (penyedia) tidak menemukan kontraknya ("Kontrak ... tidak ditemukan").

Bukti (penyedia demo = `penyedia@saksi.id`, usaha CV Maju Bersama; kontrak dibuat kades dengan `counterpartyId` usaha itu):
1. `GET /contracts/{id}` oleh penyedia → **403 "access denied: IDOR violation"**, bahkan untuk kontrak miliknya sendiri dan setelah ia mengirim tinjauan. `usecase.AuthorizeContractAccess(role, villageID, contract)` hanya mengecek desa; penyedia tidak punya desa, jadi SELALU ditolak.
2. **Tidak ada endpoint "kirim ke pihak kedua"** (`POST /contracts/{id}/send|kirim|submit` → 404). Status `ditinjau` di server hanya terbentuk saat penyedia memposting tinjauan. Frontend (`sendForReview`, `createContract({send})`) hanya mengubah status di localStorage browser kades; server tetap `draf`/`diaudit` dan penyedia tidak pernah diberi notifikasi.
3. `GET /contracts` **tidak ter-scope untuk penyedia**: mengembalikan semua kontrak semua desa termasuk draf (91 baris di DB lokal) — kebocoran data, dan penyedia melihat kontrak yang bukan miliknya.
4. `POST /contracts/{id}/reviews` oleh penyedia diterima (201) pada kontrak berstatus `draf` (belum dikirim) dan otomatis mengubahnya jadi `ditinjau`.
5. Frontend: `KontrakDetailTemplate` hanya mencari kontrak di store lokal (`db.use()` + `scopeContracts`); daftar dari server (`KontrakListTemplate`) hanya jadi "stub" di state komponen (counterpartyId `'1'`, villageId `'sukamaju'`, tanggal `2026-11-06` ditulis tetap), tidak pernah masuk store. Akibatnya kontrak yang dibuat di browser/akun lain (penyedia, BPD, kades dari perangkat lain) selalu "tidak ditemukan" saat diklik. (Warga punya jalur khusus ke `/public/contracts`.)
6. Frontend: `wizardPayload` memakai `parseInt(partyId) || 1` → bila id pihak kedua bukan angka, kontrak diam-diam terikat ke usaha #1 ("PT Rekanan Uji Coba"), bukan usaha yang dipilih.

Kontrak perbaikan (disarankan; tim BE boleh menyesuaikan, dokumentasikan di plan 7.14):
- `POST /api/v1/contracts/{id}/send` — kades/perangkat_desa desa kontrak itu. Hanya status `draf`/`diaudit` (selain itu 409 `CONTRACT_LOCKED`/`INVALID_STATE`). Aksi dalam satu transaksi: status → `ditinjau`, `contract_status_history`, `audit_logs` (`contract.send`), notifikasi `kontrak_dikirim` ke `counterparties.user_id` pihak kedua dengan tautan `/dashboard/kontrak/{id}`; hapus cache `saksi:public:*`/`saksi:metrics:*` terkait. Respons 200 berisi ringkasan kontrak (id, status). Bila audit terakhir punya temuan KRITIS terbuka → 409 `CRITICAL_FINDINGS` (FE sudah memblokir di UI; server harus ikut menegakkan).
- Akses baca (`AuthorizeContractAccess` + list): samakan dengan aturan FE `scopeContracts`: perangkat_desa = desanya; bpd = desanya, status terkirim; inspektorat = wilayahnya, status terkirim; **penyedia = hanya kontrak yang `contract_parties` peran `kedua`-nya adalah usaha miliknya (`counterparties.user_id`) dengan status ≥ `ditinjau` (bukan `draf`/`diaudit`/`dibatalkan`)**; warga = desanya, status publik. Di luar scope → 404 (bukan 403) agar id tidak bisa ditebak.
- `POST /contracts/{id}/reviews` hanya bila status `ditinjau` dan pemanggil adalah pengguna usaha pihak kedua; selain itu 409 `INVALID_STATE`.
- `GET /contracts/{id}` (atau `/lifecycle` + `/audit/latest`) harus cukup untuk menghidrasi halaman detail: judul, jenis, nilai, tenggat, status, desa, pihak kedua (id+nama), versi terbaru (`nomorVersi`, `sumber`, pasal[] `kodePasal/judul/isi/urutan/legalReferenceId`), audit terakhir, tinjauan, tanda tangan, riwayat status.

## Keputusan yang menunggu user (blokir sebagian tugas di bawah)

1. Sumber isi `clause_library`, `contract_templates`, `legal_references` (tim, atau ML menyusun draf dari peraturan di proposal lalu direview). Sekarang kosong; pasal baku pengganti dari rule engine (P-01..P-10).
2. Tambah kolom `judul` di `contract_clauses`? (perlu migrasi manual di Azure)
3. `TRUSTED_PROXIES` di Azure (batas login dibagi semua pengguna selama kosong).
4. Akun demo: hapus / ganti sandi setelah presentasi (sandi tertulis di halaman login).

---

## TEMPEL KE SESSION DevOps (yang sama dengan sebelumnya, jangan buat baru)

Deploy ulang backend SAKSI ke Azure. Kode ada di working tree `/Users/yutaaa/Developments/SAKSI` (sebagian belum di-commit; deploy dari working tree seperti sebelumnya). Minta persetujuan user langsung di session ini.

Konteks: di Azure `POST /contracts/wizard/preview` masih 502 AI_ERROR karena `clause_library` kosong; fix hanya di kode backend, tanpa perubahan skema/`SAKSI.sql`. ai-engine TIDAK perlu redeploy.

Sebelum deploy:
1. Cek app setting `SAKSI_SECRET` di `saksi-api` (jangan tampilkan nilainya): backend sekarang exit 1 bila kosong atau < 16 karakter dan `APP_ENV` bukan development/local/test. Bila terlalu pendek, buat baru acak ≥ 32 karakter; konsekuensinya semua token login lama tidak valid, kabari user dulu. Biarkan `APP_ENV` kosong/production.
2. Pastikan `AI_ENGINE_GRPC_ADDR=saksi-ai-engine.azurewebsites.net:443` dan `AI_ENGINE_GRPC_TLS=true` masih ada.

Deploy: build linux/amd64 `api` + `migrate`, zip bersama `SAKSI.sql`, `az webapp deploy` ke `saksi-api` (langkah di memory `azure-deployment`). `cmd/migrate` melewati `SAKSI.sql` bila tabel `regions` sudah ada, jadi data aman.

Smoke test setelah live (laporkan hasil nyata):
- `GET /api/v1/contracts/options?jenis=pengadaan` → 200, `clauses` berisi 10 pasal (P-01..P-10).
- Login 6 akun demo (`kades@`, `penyedia@`, `bpd@`, `inspektorat@`, `warga@saksi.id`, `budi.santoso@warga.id`; sandi `saksi123`) → 200.
- Sandi bawaan lama sudah tertutup: login `kades@saksi.id` dengan sandi `passwordKades123` (dan `passwordPenyedia123`/`passwordWarga123` untuk akun lain) → harus 401, sedangkan `saksi123` → 200. (Jangan buat akun baru untuk tes ini.)
- `POST /contracts/wizard/preview` (kades; jenis pengadaan, judul, nilai 75000000, tenggat 2027-03-01, skemaPembayaran termin, metodePemilihan pengadaan_langsung, jawabanForm {work,value}) → 200 dengan 10 pasal.
- `POST /contracts` lalu `POST /contracts/{id}/audit` lalu `DELETE /contracts/{id}` → 204; `GET /contracts` memuat kontrak itu SEKALI dengan status `dibatalkan`.
- `GET /termin`, `/notifications`, `/audit-logs`, `/seals` dengan token kades → 200; token warga → `/termin` 403.
- `GET /public/contracts` tanpa token → 200 (portal publik terbuka).
Jangan hapus atau tambah akun demo. Rekomendasi (minta persetujuan user): hapus 3 akun uji `cek.deploy.*@example.com` beserta datanya, karena akun di luar demo mengotori pelacakan di dashboard. Jangan menambah akun/data uji baru di DB Azure. Opsional: aktifkan application logging sementara untuk memastikan backend memakai gRPC (bukan fallback REST).

Lalu putuskan dengan user soal `TRUSTED_PROXIES` (isi hanya bila rentang IP front end App Service pasti).

### JOB BARU DevOps (2026-11-11): deploy perbaikan bug "pihak kedua tidak menemukan kontrak"

Perbaikan backend sudah ada di working tree (belum di-commit): endpoint baru `POST /contracts/{id}/send`, aturan akses baca kontrak (penyedia hanya melihat kontrak usahanya yang sudah dikirim, di luar cakupan = 404), dan tinjauan hanya saat status `ditinjau`. Detail di plan `2026-11-10-grpc-redis-ai-manual-drafting.md` bagian 7.14. Minta persetujuan user langsung di session ini sebelum deploy dan sebelum mengubah DB.

Sebelum deploy:
1. Lokal: `cd backend && go build ./... && go vet ./...`, lalu `psql "postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable" -f scripts/migrate_seal_verifications.sql` dan jalankan `DATABASE_URL=... go test -count=1 ./...`. Semua harus lulus (tanpa migrasi itu `TestStore_Termin_Workflow` gagal karena kolom `hash_dicari` belum ada). Laporkan hasil nyata.
2. Session Back-end dan Front-End mengedit working tree bersamaan: pastikan build bersih di saat deploy, jangan deploy saat build gagal.
3. DB Azure: `cmd/migrate` melewati `SAKSI.sql` di DB berisi. Dengan persetujuan user, jalankan skrip idempoten `scripts/migrate_seal_verifications.sql` dan `scripts/migrate_indexes.sql` ke `saksi-db`. Tanpa skrip pertama, verifikasi segel yang tidak cocok tidak tercatat (hanya log WARN, API tetap jalan).

Deploy: sama seperti job di atas (build linux/amd64 `api` + `migrate`, zip dengan `SAKSI.sql`, `az webapp deploy` ke `saksi-api`). ai-engine TIDAK perlu redeploy. Simpan zip lama untuk rollback.

Smoke test di Azure setelah live, hanya dengan akun demo (jangan buat akun baru):
- Kades membuat kontrak dengan pihak kedua CV Maju Bersama (`POST /contracts`), lalu `POST /contracts/{id}/audit`.
- Penyedia (`penyedia@saksi.id`): `GET /contracts` TIDAK memuat kontrak itu; `GET /contracts/{id}` → 404; `POST /contracts/{id}/reviews` → 404 atau 409.
- Kades: `POST /contracts/{id}/send` → 200 `{"id":..,"status":"ditinjau"}`; kirim ulang → 409 `INVALID_STATE`. Bila 409 `CRITICAL_FINDINGS`, revisi pasal sampai audit bersih (itu perilaku yang benar), laporkan.
- Penyedia: `GET /contracts` memuat kontrak itu; `GET /contracts/{id}` dan `/contracts/{id}/lifecycle` → 200; `GET /notifications` memuat `kontrak_dikirim`; `POST /contracts/{id}/reviews` `{"status":"minta_revisi","komentar":"..."}` → 201.
- Kades: `GET /notifications` memuat `kontrak_ditinjau`; `GET /audit-logs?contractId={id}` memuat `contract.send` dan `contract.review`.
- `penyedia@saksi.id` tidak boleh melihat kontrak desa/usaha lain di `GET /contracts` (bandingkan jumlahnya dengan sebelum deploy).
- `bpd@saksi.id`: kontrak terkirim terlihat, draf tidak.
- Akhiri dengan `DELETE /contracts/{id}` oleh kades supaya kontrak uji tercatat dibatalkan (jejaknya tetap terlacak di dashboard).

---

## TEMPEL KE SESSION QA Engineer

Uji regresi + fitur baru SAKSI. Lingkungan LOKAL (stack dijalankan dari session PM, mungkin perlu dinyalakan ulang, lihat bawah). Azure baru valid setelah DevOps deploy.

Akun demo (sandi semua `saksi123`): `kades@saksi.id`, `penyedia@saksi.id`, `bpd@saksi.id`, `inspektorat@saksi.id`, `warga@saksi.id`, `budi.santoso@warga.id`.
ATURAN: pakai HANYA akun demo ini; jangan daftar/buat akun baru (di lokal maupun Azure). Fokus ekstra: setiap aksi yang kamu lakukan harus bisa dilacak di dashboard — cek Jejak Audit (aktor, peran, aksi, objek, waktu), Riwayat kontrak, dan Notifikasi pihak terkait; laporkan aksi yang TIDAK muncul di sana sebagai bug.

URL: frontend `http://localhost:3000`, backend `http://localhost:8099/api/v1`.

Nyalakan ulang bila mati:
- Postgres 16: `/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D <scratchpad>/pg -o "-p 5432 -k '' -c listen_addresses=localhost" start` (data dir `.../scratchpad/pg`; bila hilang: `initdb -A trust -U postgres`, `createdb saksi`, `cd backend && go run ./cmd/migrate`, lalu muat `scripts/seed_villages.sql` dan `scripts/seed_demo.sql`).
- ai-engine: `cd ai-engine && set -a && . ./.env && set +a && unset AI_PROVIDERS && GRPC_PORT=50051 .venv/bin/python -m uvicorn app.main:app --port 8000` (`.env` lama berisi `AI_PROVIDERS=groq,gemini`; di-unset agar memakai rantai default).
- Backend: `cd backend && go run ./cmd/api` dengan env `PORT=8099 APP_ENV=development SAKSI_SECRET=local-smoke-secret-123456 AI_ENGINE_GRPC_ADDR=localhost:50051 AI_ENGINE_URL=http://localhost:8000 AI_API_KEY=<dari ai-engine/.env> STORAGE_DIR=./data/files`.
- Frontend: `cd frontend && NEXT_PUBLIC_API_URL=http://localhost:8099/api/v1 npm run dev -- -p 3000`.

A. Buat kontrak (login kades):
1. Wizard pengadaan → preview AI: 10 pasal, lencana sumber "AI", skor audit + temuan, tanpa error model.
2. Mode "Tulis manual": editor terisi 10 pasal; ubah/tambah/hapus; simpan → lencana "Manual"; audit ulang jalan.
3. Revisi kontrak AI secara manual → versi baru, status kembali draf; kontrak yang sudah ditandatangani terkunci (409 CONTRACT_LOCKED).
4. Semua jenis: pengadaan, hibah, kerja_sama_bumdes, sewa_aset, umkm.
5. Negatif: nilai 0/negatif, tenggat lampau, judul kosong, jawaban sangat panjang, tanpa login (401), role warga/bpd tidak boleh buat kontrak (403).
6. Bila semua model AI kena limit: pesan "Layanan AI sedang penuh…" + tombol "Coba lagi" (bukan error mentah).
7. Daftar kontrak: SETELAH beberapa kali "Audit ulang", kontrak harus muncul SATU kali (bug duplikat sudah diperbaiki) dengan skor terbaru.
9. KIRIM KE PIHAK KEDUA (bug kritis, uji setelah BE+FE selesai): kades buat kontrak lalu "Simpan dan kirim ke pihak kedua" → login `penyedia@saksi.id` di jendela/profil browser BARU (localStorage kosong) → kontrak muncul di daftar/"Perlu tindakan", bisa dibuka, penyedia bisa kirim tinjauan; status, riwayat, jejak audit, dan notifikasi (ke penyedia saat dikirim, ke kades saat ditinjau) benar. Negatif: draf yang belum dikirim TIDAK terlihat oleh penyedia; kontrak usaha lain / desa lain 404; penyedia tidak bisa memposting tinjauan pada draf (409); kontrak dengan temuan kritis tidak bisa dikirim (UI dan server); BPD hanya melihat kontrak yang sudah terkirim.
8. "Terapkan saran" di panel audit wizard (diperbaiki 2026-11-11): pada draf AI lengkap tidak boleh ada temuan palsu "Sanksi belum jelas"/"kahar"; hapus pasal sanksi di mode manual → temuan kritis muncul → klik "Terapkan saran" → pasal sanksi ditambahkan, temuan jadi "Diperbaiki", skor naik; ulangi untuk pasal kahar (saran), retensi (skema termin ≥ 2), dan "Melewati ambang pengadaan langsung" (nilai di atas batas wilayah + metode Pengadaan langsung).

B. Batal kontrak draf:
- Tombol "Batalkan kontrak" hanya untuk kades/perangkat desa, kontrak dari server berstatus draf/diaudit. Dialog konfirmasi → status "Dibatalkan" (badge merah, chip filter di daftar), redirect ke daftar.
- Tidak tampil untuk bpd, inspektorat, penyedia, warga, atau status ditandatangani+. Kontrak batal tidak bisa diedit/diaudit/dipublikasikan/ditandatangani dan tidak muncul di halaman publik/hitungan dashboard.

C. Fitur tahap B (per peran, cek akses terlarang juga): termin & progres & SPK & bayar (penyedia lapor progres; kades tandai dibayar; bpd/inspektorat baca saja); verifikasi segel (`/verifikasi`, hash benar/salah, tanpa login); notifikasi (dibaca/semua dibaca, paginasi); jejak audit (filter tanggal, "muat lebih lama"); LHP (inspektorat buat/terbitkan; kades/bpd hanya yang terbit); admin daerah (inspektorat read; admin_daerah tulis; fitur belum ada tampil "Segera hadir"); profil & ganti sandi; lupa/atur ulang sandi (di dev token ditampilkan); laporan warga (kirim, tindak lanjut oleh petugas, status berubah); halaman `/lacak` publik tanpa login, progres tampil.

D. Keamanan: login dengan `saksi123` untuk akun non-demo harus ditolak; warga/kades desa lain tidak bisa membaca `GET /reports/{id}` laporan desa lain (404); rate limit login (429 RATE_LIMITED).

Format laporan: langkah reproduksi, ekspektasi vs aktual, status HTTP/response, tangkapan layar. Catatan: daftar "dasar hukum" kosong itu EXPECTED (belum ada seed); simulasi (`/simulasi`) sengaja offline; kontrak contoh bawaan tanpa id server tidak bisa ditandatangani/dibatalkan (diketahui).

---

## TEMPEL KE SESSION Front-End

Konteks: Fase A (publikasi, lacak, form laporan, tab laporan, laporan saya) dan Fase B (termin, segel, notifikasi, jejak audit, LHP, admin daerah, profil, lupa sandi, tindak lanjut laporan, progres lacak) + tombol batal kontrak sudah tersambung ke backend; `tsc`/lint/build bersih tapi BELUM ada layar yang dilihat di browser.

Tugas:
00. PRIORITAS TERTINGGI — perbaiki "Kontrak ... tidak ditemukan" untuk pihak kedua (lihat bagian "BUG KRITIS" di atas; selaraskan dengan endpoint BE `POST /contracts/{id}/send`): (a) "Simpan dan kirim ke pihak kedua" (`saveWizardContract`, send=true) dan `SendReviewPanel` harus memanggil endpoint kirim di server dan baru mengubah status lokal setelah sukses; bila gagal tampilkan pesan server (FormAlert), jangan diam-diam ubah lokal. (b) `KontrakDetailTemplate` harus menghidrasi kontrak dari server saat tidak ada di store lokal (GET `/contracts/{id}`, `/lifecycle`, `/audit/latest`) lalu memasukkannya ke store (upsert dengan `apiId`, `counterpartyId`/`villageId` NYATA dari API, status apa adanya, pasal dari versi terbaru), supaya tab Tinjauan/Tanda tangan/Segel/dll bekerja; hapus "stub" hard-coded di `KontrakListTemplate` (counterpartyId `'1'`, villageId `'sukamaju'`, tanggal `2026-11-06`) dan upsert hasil daftar ke store yang sama. (c) `wizardPayload`: hentikan `parseInt(partyId) || 1` — bila id pihak kedua tidak valid tampilkan error, jangan terikat diam-diam ke usaha #1. (d) Uji sebagai penyedia di jendela/profil browser BARU (localStorage kosong): kontrak yang dikirim kades muncul di "Perlu tindakan" dan bisa dibuka.
0. PELACAKAN DI DASHBOARD (prioritas, keputusan user): akun tetap hanya 6 akun di panel "Akun demo" (jangan tambah/ubah daftar `seedAccounts`). Semua CRUD dan logic flow harus terlihat di dashboard dari akun-akun itu: Jejak Audit dan tab Riwayat kontrak harus membaca `GET /audit-logs` (aktor, peran, aksi, objek, waktu, filter kontrak/aktor/tanggal), BUKAN `lib/audit` lokal (`addAudit`/`auditStore`/`seedAuditLogs`); Notifikasi dari `GET /notifications`; status kontrak/termin/laporan langsung berubah di dashboard peran terkait setelah aksi (refetch/store). Hapus pencatatan audit lokal yang jadi tidak terpakai. Aksi yang ada di UI tapi tidak tercatat di server → laporkan ke tim BE.
1. Verifikasi di browser (desktop + mobile, fokus keyboard, loading/empty/error) setiap layar di atas dengan akun demo (lihat QA di atas untuk cara menyalakan stack lokal). Perbaiki bentrok semantik antar session yang tidak tertangkap `tsc`.
2. `GET /contracts/options?jenis=` sekarang selalu mengembalikan `clauses` (10 pasal) — pastikan mode "Tulis manual" (`DrafVersiTab`/`ClauseEditor`/`use-legal-references`) memakai template dari server, bukan template lokal.
3. Daftar kontrak untuk peran selain warga menurunkan status `draf`/`dipublikasikan` dari API menjadi `diaudit` (`KontrakListTemplate`) — badge bisa tidak tepat; petakan status apa adanya.
4. Tombol "coba lagi" setelah gagal memuat audit memicu audit BARU (POST) alih-alih GET `/contracts/{id}/audit/latest`; `signContractAPI` mengembalikan error generik → tampilkan pesan server.
5. Sisa data lokal yang masih dipakai: `lib/audit` (`addAudit`/`auditStore`) di beranda Desa/Pihak/BPD & riwayat; tab "Perlu tindakan"/badge kontrak/SegelTab dari salinan kontrak lokal; ProfilDesa lokal. Putuskan dengan user mana yang harus pindah ke API (jejak audit: `GET /audit-logs`; notifikasi: `GET /notifications`).
6. Kontrak contoh bawaan (tanpa `apiId`) tidak bisa ditandatangani/dibatalkan: tawarkan opsi ke user (seed ke backend, atau tanda tangan "simulasi" lokal berlabel).
7. Konvensi: atomic design, Tailwind saja (belum shadcn), `next/image`, tanpa barrel, satu fungsi per file di `lib/api`. Jangan ubah desain yang sudah disetujui.
8. KETAHUAN 2026-11-11: panel audit di wizard buat kontrak (`auditDraft`/`AuditPanel`, "Audit ini simulasi") dihitung lokal di browser dan membuang hasil audit AI dari server (`POST /contracts/wizard/preview` mengembalikan `integrityScore`, `findings[kodePasal, tingkat, pesan]`, `mandatoryFulfilled`). Putuskan dengan user: tampilkan temuan server di wizard (hanya bisa "lihat", karena temuan AI tidak punya teks perbaikan otomatis) berdampingan dengan temuan lokal yang bisa "Terapkan saran". Bug "Terapkan saran" yang tidak jalan pada draf server (kode pasal `P-xx`) sudah diperbaiki lewat `lib/drafting/find-clause.ts`; pasal yang ditambah klien memakai kode lokal (`sanksi`/`kahar`/`retensi`), sehingga audit backend setelah simpan bisa menganggap pasal wajib `P-07`/`P-09` hilang bila pasal aslinya dihapus lalu ditambah lagi lewat saran — pertimbangkan memakai kode `P-xx` dari template server saat menyisipkan.

---

## TEMPEL KE SESSION Back-end

Kontrak API ada di plan bagian 7 (7.1–7.13). Tes lengkap: `DATABASE_URL=postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable go test -count=1 ./...` (butuh Postgres lokal dengan skema + `seed_villages.sql` + user id 1–3 untuk tes store; lihat bagian QA untuk menyalakan DB).

Tugas (urut prioritas):
00. **SUDAH DIKERJAKAN (2026-11-11, belum di-commit dan belum di-deploy ke Azure)**: `POST /contracts/{id}/send`, cakupan baca lewat `scopeCond` (daftar, detail, lifecycle; penyedia hanya kontrak usahanya yang sudah dikirim; di luar cakupan = 404), tinjauan hanya saat `ditinjau`. Detail di plan 7.14, Postman sudah diperbarui. Sisa untuk tim BE: review kode, jalankan `go test ./...` setelah `scripts/migrate_seal_verifications.sql` diterapkan ke DB lokal, lalu deploy. Tugas asli: perbaiki bug "pihak kedua tidak menemukan kontrak" sesuai bagian "BUG KRITIS" di atas: endpoint `POST /contracts/{id}/send`, scope akses baca (detail + daftar) untuk penyedia berdasarkan `counterparties.user_id`, batasi `reviews` hanya saat `ditinjau`, dan pastikan detail kontrak cukup untuk dihidrasi FE. Tes: handler (peran/status/scope), store dengan Postgres asli (penyedia pemilik vs penyedia lain vs desa lain), dan alur: kades kirim → penyedia melihat di daftar + membuka detail → penyedia kirim tinjauan → status/riwayat/audit log/notifikasi benar. Tidak boleh menambah akun; pakai `kades@saksi.id`, `penyedia@saksi.id` (usaha CV Maju Bersama), `bpd@saksi.id`. Update Postman + plan 7.14.
0. PELACAKAN DI DASHBOARD (keputusan user): akun TIDAK ditambah — `seed_demo.sql` tetap 6 akun demo, jangan tambah seed akun/kontrak lain. Pastikan SETIAP endpoint tulis menulis `audit_logs` dalam transaksi yang sama (aktor, peran, aksi, jenis_objek, id_objek, ip, data sebelum/sesudah bila ada) dan mengirim notifikasi ke pihak terkait: buat kontrak, revisi/simpan pasal, audit (ulang), publikasi, batal, review, tanda tangan, termin (jadwal/SPK/progres/bayar), laporan warga + tindak lanjut, LHP (buat/terbit), admin daerah (aturan/penugasan), ubah profil/sandi. Audit dulu endpoint mana yang belum menulis audit log (mis. buat kontrak, simpan pasal, publish, audit AI) dan lengkapi, plus tes yang menegaskan baris `audit_logs` ada per aksi. `GET /audit-logs` harus bisa memfilter per kontrak/aktor/aksi/tanggal dan menampilkan nama + peran aktor.
1. Seed `clause_library`, `contract_templates`, `legal_references` — HANYA bila user sudah memutuskan sumber datanya (lihat "Keputusan menunggu user" no. 1). Isi dari peraturan nyata, jangan karangan. Sampai itu, `TemplateOrRule` memakai pasal baku rule engine.
2. Tambah log `ai transport=grpc|rest` per panggilan AI agar terbukti backend memakai gRPC di Azure.
3. `/healthz` dan `/readyz` untuk backend.
4. Indeks yang belum ada: `notifications(user_id)`, `audit_logs`, `payment_terms(contract_id)`, `work_progress(contract_id)` — butuh migrasi; `cmd/migrate` melewati `SAKSI.sql` di DB berisi, jadi sediakan skrip migrasi terpisah yang idempoten.
5. Reset sandi: belum ada layanan email (token hanya di dev); token login lama tetap berlaku setelah reset. Usulkan penyedia email + pencabutan token.
6. Admin daerah yang belum ada: undangan akun, pustaka pasal (CRUD), rekap kabupaten, hapus/edit penugasan pengawas. Verifikasi termin oleh BPD/inspektorat (butuh kolom persetujuan; sekarang "setujui" = desa tandai dibayar).
7. Inspektorat di endpoint baru di-scope ke wilayahnya (`user_roles.region_id`/`oversight_assignments`), berbeda dari endpoint kontrak lama (semua desa): samakan.
8. `seal_verifications` tidak mencatat verifikasi yang tidak cocok (`seal_id` wajib); pencarian lewat kode segel/awalan hash belum ada.
9. `cmd/migrate` + `SAKSI.sql`: perubahan skema (mis. kolom `judul` di `contract_clauses`) tidak otomatis berlaku di Azure; rancang jalur migrasi.

---

## TEMPEL KE SESSION Machine Learning

Konteks: ai-engine punya gRPC `saksi.ai.v1.AiEngine` (DraftContract, AuditContract, RedactText) + REST `/v1/audit`, rantai fallback `AI_PROVIDERS` = `gemini:gemini-3-flash-preview,groq:qwen/qwen3.8-27b,groq:openai/gpt-oss-120b,gemini:gemini-3.5-flash`. pytest 35 lulus.

Tugas:
1. Perluas golden set (`ai-engine/tests/golden/`) untuk DraftContract (5 jenis kontrak) dan RedactText (nama/alamat/NIK/HP/email, termasuk negatif: nama jabatan/instansi tidak boleh tersamar); ukur ulang model dengan skrip benchmark dan laporkan akurasi + latensi.
2. Coba ulang `gemini-3.8-flash` (sebelumnya 400 untuk `reasoning_effort: minimal` dan 503 overloaded) dan model baru Groq/Gemini; ubah rantai default hanya bila lebih baik dan kabari DevOps untuk app setting.
3. `ai-engine/.env.example` sudah memakai rantai baru; pastikan `.env` lokal tiap anggota diperbarui (`.env` lama `AI_PROVIDERS=groq,gemini` masih jalan karena format lama didukung).
4. Setelah user memutuskan sumbernya: susun DRAF isi `clause_library`/`legal_references` dari peraturan yang dirujuk proposal (Permendagri 20/2018, Perkades, dll.) dengan kutipan nomor pasal sebenarnya untuk direview user; jangan menyimpan klaim hukum yang tidak bisa diverifikasi.
5. Evaluasi kualitas draf di mode tanpa `clause_library` (pasal baku P-01..P-10): adakah pasal yang berubah makna/hilang? Audit menandai 3 dari 10 pasal wajib tidak terpenuhi pada draf uji — periksa apakah itu benar atau prompt/checklist perlu disetel.

**Status ML (2026-11-11, pytest 97 lulus; panduan lengkap: `docs/ai-engine.md`):**
- Tugas 1, 2, 3, 5 selesai. Golden set: audit 8, draft 6 (5 jenis), redact 13 kasus; benchmark: `python -m evals.benchmark` (tabel hasil di `docs/ai-engine.md` bagian 7). Rantai bawaan TIDAK diubah (tidak ada model yang terbukti lebih baik), jadi app setting Azure tidak perlu diubah.
- Tugas 5: audit pasal baku hanya menandai P-06 KRITIS (benar: "masa garansi" tanpa durasi, templat BE perlu kolom durasi); angka "3 dari 10" tidak bisa direproduksi. Draf AI sempat menghapus isi benar (P-02 APBDes), merusak baris baru, dan menyalin judul; sudah diperbaiki di prompt + pengaman `_faithful`.
- Bug lain yang diperbaiki di ai-engine: timeout kini total (sebelumnya jawaban menetes bisa melewati 6 dtk), `AI_PROVIDER_TIMEOUT` < 1 tidak lagi mematikan AI, regex Redact menangkap rekening berbank, `+62 812-...`, NIK berspasi. **DevOps: ai-engine di Azure perlu dipastikan sudah memuat versi ini** (`/healthz` sudah berformat `provider:model`, tapi belum terbukti memuat perbaikan timeout dan pengaman draf); deploy ulang hanya `app/` + `requirements.txt` bila belum.
- Tugas 4 BELUM dikerjakan: menunggu keputusan user soal sumber `clause_library`/`legal_references` (keputusan nomor 1). Nomor pasal peraturan tidak bisa diverifikasi tanpa sumber resmi, jadi tidak disusun sendiri.
- Belum terukur: `gemini-3-flash-preview` (model pertama rantai) karena kuota gratis Gemini 20 permintaan/hari/model habis; ulangi setelah kuota reset: `python -m evals.benchmark --models gemini:gemini-3-flash-preview --limit 6`. `gemini-3.7-flash`/`3.8-flash` menolak `reasoning_effort: minimal` dan belum menjawab dengan `low` (429/503/timeout).
- Aturan akun/data: ML tidak membuat akun atau data di Azure. Benchmark hanya memanggil provider LLM; kuota Gemini/Groq dihitung per API key, jadi memakai key yang sama dengan Azure ikut menghabiskan kuota produksi.
- Terbuka untuk keputusan: nama pejabat penandatangan (mis. Kades) disamarkan atau tidak di kontrak publik; belum ada golden case sampai diputuskan.
