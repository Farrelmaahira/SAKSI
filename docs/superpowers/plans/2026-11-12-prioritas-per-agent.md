# Prioritas per agent (PM, 2026-11-12)

Written for: kamu (pengirim) dan agent di tiap session. Tempel HANYA blok agent yang bersangkutan; tiap blok berdiri sendiri.
Detail lengkap + kontrak API: `docs/superpowers/plans/2026-11-11-tugas-per-session.md` dan `docs/superpowers/plans/2026-11-10-grpc-redis-ai-manual-drafting.md` (bagian 7).

Legenda: **P0** = kerjakan sekarang, blokir demo. **P1** = setelah P0. **P2** = bila sempat.

## Aturan untuk semua agent (keputusan user)
- Akun HANYA 6 akun yang sudah ada di panel "Akun demo" (sandi `saksi123`): `kades@`, `penyedia@`, `bpd@`, `inspektorat@`, `warga@saksi.id`, `budi.santoso@warga.id`. Jangan membuat akun/data uji baru, terutama di Azure.
- Pihak kedua = usaha milik `penyedia@saksi.id` (CV Maju Bersama). Tidak ada vendor tiruan/lokal.
- Semua CRUD dan alur harus terlacak di dashboard (Jejak Audit, Riwayat kontrak, Notifikasi) dari server, bukan dari catatan lokal browser.
- Read sebelum Edit (beberapa session mengedit file yang sama). Jangan commit/deploy kecuali diminta.

## Keputusan user yang membuka P0 Back-end & ML (belum dijawab)
**Gerbang kirim ke pihak kedua.** Server menolak kirim bila audit terakhir punya temuan KRITIS (`CRITICAL_FINDINGS`), tetapi tingkat keparahan dari LLM bergeser antar audit: diuji 2026-11-12, setelah P-04 dan P-06 diperbaiki, audit ulang memberi kritis baru di P-07. Pilihan: (a) tetap blokir semua kritis; (b) blokir hanya temuan deterministik (pasal wajib hilang, dasar hukum tidak sah) dan kritis dari LLM = peringatan + konfirmasi eksplisit yang dicatat di `audit_logs` (REKOMENDASI PM); (c) izinkan kirim tanpa syarat. Blok di bawah memakai (b); ganti bila user memutuskan lain.

---

## TEMPEL KE: Back-end

P0
1. Gerbang kirim sesuai keputusan di atas (default (b)): `POST /contracts/{id}/send` hanya memblokir temuan deterministik. Pisahkan jenis temuan di `ai_audit_findings`/respons audit (mis. field `sumber`: `aturan` | `llm`); kritis `llm` boleh dikirim bila body `{ "konfirmasiTemuanKritis": true }` dan hal itu dicatat di `audit_logs` (aksi `contract.send`, data: temuan yang dikonfirmasi). Tanpa konfirmasi → 409 `CRITICAL_FINDINGS` yang menyertakan daftar temuan. Tes: handler + Postgres asli, termasuk skenario "kritis llm tanpa/dengan konfirmasi" dan "pasal wajib hilang tetap diblokir".
2. Cakupan `audit_logs` + notifikasi untuk SETIAP endpoint tulis (buat kontrak, simpan pasal/revisi, audit ulang, kirim, tinjau, tanda tangan, publikasi, batal, termin/SPK/progres/bayar, laporan + tindak lanjut, LHP, admin daerah, profil/sandi). Audit dulu mana yang belum menulis; lengkapi + tes yang menegaskan baris `audit_logs` per aksi. `GET /audit-logs` memfilter per kontrak/aktor/aksi/tanggal dan mengembalikan nama + peran aktor.
3. `GET /counterparties`: hanya usaha yang punya akun terdaftar (`counterparties.user_id` tidak null) dan sertakan `email`/`kontak` asli dari `users` (frontend sekarang mengarang email `cvmajubersama@rekanan.id`). Tes: daftar hanya berisi CV Maju Bersama untuk seed demo.

P1
4. `GET /contracts/{id}` (atau `/lifecycle`) harus cukup untuk menghidrasi halaman detail FE: pasal versi terbaru (`kodePasal/judul/isi/urutan/legalReferenceId`), audit terakhir, tinjauan, tanda tangan, riwayat status. Verifikasi dengan akun `penyedia@saksi.id` (404 untuk kontrak usaha lain / draf).
5. Log `ai transport=grpc|rest` per panggilan AI; `/healthz` dan `/readyz`.
6. Indeks yang belum ada (notifications.user_id, audit_logs, payment_terms.contract_id, work_progress.contract_id) lewat skrip migrasi idempoten terpisah (`cmd/migrate` melewati `SAKSI.sql` di DB berisi).
7. Seed `clause_library`/`legal_references` HANYA setelah user menentukan sumber datanya.

P2: admin daerah yang belum ada (undangan akun, pustaka pasal CRUD, rekap, hapus/edit penugasan); pencabutan token + email untuk reset sandi; `seal_verifications` mencatat verifikasi tidak cocok.

Selesai bila: `go build ./... && go vet ./... && DATABASE_URL=postgres://postgres:postgres@localhost:5432/saksi?sslmode=disable go test -count=1 ./...` hijau, Postman + plan 7.x diperbarui. Lapor output tes nyata.

---

## TEMPEL KE: Front-End

P0
1. Wizard "Buat kontrak": panel audit saat ini simulasi lokal (`auditDraft`) dan membuang hasil audit AI server dari `POST /contracts/wizard/preview` (`integrityScore`, `findings[kodePasal, tingkat, pesan]`). Tampilkan temuan server di langkah draf dan hitung `critical` untuk tombol "Simpan dan kirim ke pihak kedua" dari temuan server (selaras dengan gerbang kirim di server; bila BE menerapkan konfirmasi temuan kritis LLM, sediakan checkbox konfirmasi dan kirim `konfirmasiTemuanKritis: true`). Teruskan juga `findings` lewat `previewDraft`.
2. Hidrasi dari server: `KontrakDetailTemplate` harus memuat kontrak dari server bila tidak ada di store lokal (GET `/contracts/{id}`, `/lifecycle`, `/audit/latest`) lalu upsert ke store dengan `apiId`, `counterpartyId`/`villageId` NYATA, status apa adanya. Hapus "stub" hard-coded di `KontrakListTemplate` (counterpartyId `'1'`, villageId `'sukamaju'`, tanggal `2026-11-06`). Uji sebagai `penyedia@saksi.id` di profil browser BARU (localStorage kosong): kontrak yang dikirim kades muncul dan bisa dibuka.
3. Pelacakan di dashboard: Jejak Audit dan tab Riwayat membaca `GET /audit-logs`; Notifikasi dari `GET /notifications`; buang `lib/audit` lokal (`addAudit`/`auditStore`/`seedAuditLogs`) yang jadi tak terpakai. Status berubah langsung di dashboard peran terkait setelah aksi.

P1
4. Buang data tiruan yang tersisa: `seedCounterparties` (`data/master.ts`) di `ProfilUsaha`/`ProfilDesa`/`counterpartyById`, dan kontrak contoh lokal (`seed-db.ts`) yang tidak ada di server; kontrak lokal tanpa `apiId` diberi label jelas atau dihapus dari daftar bila user setuju.
5. Verifikasi di browser (desktop + mobile, fokus keyboard, loading/empty/error) semua layar tahap A/B + batal kontrak + daftar pihak kedua baru. Ekstensi Chrome PM tidak tersambung, jadi layar-layar ini belum pernah dilihat.
6. Mode "Tulis manual" memakai `clauses` dari `GET /contracts/options` (10 pasal `P-01..P-10`), bukan template lokal; pasal yang disisipkan "Terapkan saran" memakai kode `P-xx` template server (saat ini `sanksi`/`kahar`/`retensi`).

P2: status `draf`/`dipublikasikan` dipetakan jadi `diaudit` di `KontrakListTemplate` (badge tak tepat); tombol "coba lagi" audit memicu POST baru; `signContractAPI` error generik.

Sudah dikerjakan PM 2026-11-12 (jangan diulang, tinjau saja): `lib/drafting/find-clause.ts` (+ `audit-draft`, `apply-finding`) agar "Terapkan saran" jalan pada draf server; daftar pihak kedua hanya usaha dari server dan tombol "Undang pihak kedua baru" dihapus; `DrafVersiTab`/`SendReviewPanel` menghitung temuan kritis server; "Buka draf" membuka `?tab=draf`.

Selesai bila: `npx tsc --noEmit && npm run lint && npm run build` bersih (jangan jalankan `next build` saat dev server dipakai QA), dan layar diuji di browser. Lapor per layar.

---

## TEMPEL KE: QA Engineer

Lingkungan: lokal (frontend `localhost:3000`, backend `localhost:8099/api/v1`, ai-engine REST `localhost:8001` + gRPC `50051`; port 8000 dipakai proyek lain). Cara menyalakan ulang ada di blok QA file `2026-11-11-tugas-per-session.md`. Gunakan HANYA akun demo.

P0 (alur inti, uji di browser)
1. Kades `kades@saksi.id` → Buat kontrak (AI) → langkah "Siapa pihak keduanya?": HANYA "CV Maju Bersama" (penyedia demo) yang muncul, tanpa vendor tiruan dan tanpa tombol "Undang pihak kedua baru" → preview AI → "Simpan dan kirim ke pihak kedua".
2. Ulangi dengan mode "Tulis manual" (10 pasal P-01..P-10).
3. Login `penyedia@saksi.id` di profil/jendela browser BARU (localStorage kosong): kontrak yang dikirim muncul di daftar/"Perlu tindakan", bisa dibuka; penyedia kirim tinjauan; status, Riwayat, Jejak Audit, dan Notifikasi (ke penyedia saat dikirim, ke kades saat ditinjau) benar. Lanjut tanda tangan, lalu `bpd@saksi.id` melihat kontrak terkirim.
4. Bila pengiriman ditolak (`CRITICAL_FINDINGS`): pesan terbaca jelas, tombol "Buka draf" membuka tab "Draf & Versi" dengan temuan server + editor pasal; perbaiki → audit ulang → kirim. Catat apakah pengguna bisa berputar tanpa pernah lolos (audit AI memberi kritis baru tiap kali?). Laporkan berapa kali audit sampai lolos.

P1
5. "Terapkan saran" di panel audit wizard (sudah diperbaiki): draf AI lengkap tanpa temuan palsu; hapus pasal sanksi di mode manual → kritis muncul → "Terapkan saran" menambahkannya → "Diperbaiki"; ulangi untuk kahar, retensi (termin ≥ 2), ambang pengadaan langsung.
6. Batal kontrak draf (tombol hanya untuk kades/perangkat desa, status draf/diaudit; dialog konfirmasi; status "Dibatalkan"); daftar kontrak: setelah beberapa kali "Audit ulang" kontrak muncul SATU kali.
7. Negatif/keamanan: draf belum dikirim tidak terlihat penyedia; kontrak usaha/desa lain 404; sandi lama (`passwordKades123`) 401; `GET /reports/{id}` desa lain 404; rate limit login 429.

P2: fitur tahap B per peran (termin, segel, notifikasi, jejak audit, LHP, admin daerah, profil, lupa sandi, laporan warga, /lacak), mobile, keyboard.

Format laporan: langkah reproduksi, ekspektasi vs aktual, status HTTP/response, tangkapan layar.

---

## TEMPEL KE: DevOps

P0
1. Pastikan Azure = HEAD terbaru. Diperiksa PM 2026-11-12: `POST /contracts/{id}/send` dan `DELETE /contracts/{id}` ada (401 tanpa token) dan `GET /contracts/options` mengembalikan 10 pasal, tetapi commit `74e0866` dan perubahan setelahnya belum tentu ter-deploy. Bandingkan dan deploy ulang `saksi-api` bila beda (build linux/amd64 `api` + `migrate`, zip bersama `SAKSI.sql`). Cek `SAKSI_SECRET` ≥ 16 karakter sebelum deploy; minta persetujuan user di session ini.
2. Smoke test Azure dengan akun demo SAJA (jangan membuat akun/data baru): login 6 akun → 200; `passwordKades123` → 401; `kades` buat kontrak → kirim → `penyedia` melihat (hanya setelah kirim). Bila perlu data uji, satu kontrak saja lewat alur normal, dan catat id-nya untuk dibatalkan.
3. Bersihkan akun/data uji di DB Azure (3 akun `cek.deploy.*@example.com` + datanya, kontrak berjudul "Uji ...") HANYA dengan persetujuan user; laporkan apa yang akan dihapus lebih dulu.

P1: putuskan `TRUSTED_PROXIES` dengan user (bila kosong, semua pengguna berbagi satu batas login 20/15 menit); aktifkan application logging sementara untuk memastikan backend memakai gRPC, bukan fallback REST.
P2: migrasi manual untuk perubahan skema berikutnya (indeks, kolom `judul`) karena `cmd/migrate` melewati `SAKSI.sql` di DB berisi.

---

## TEMPEL KE: Machine Learning

Dikoreksi setelah audit ML 2026-11-12 (bukti dan alasan: `docs/ai-engine.md`, bagian "Stabilitas severitas audit"). Rencana awal (rubrik prompt + temperature 0 + few-shot) dibatalkan: temperature sudah 0 dan flip terbukti terjadi di tiga model, karena LLM menilai keparahan secara relatif.

**SELESAI 2026-11-12 (pytest 138 lulus):**
1. Severitas audit dipindah ke kode. `KRITIS` hanya dari cek pasti: pasal wajib hilang, id dasar hukum tidak sah, kolom kosong (`[diisi manual]`, `(isi sesuai ...)`), dan slot wajib kosong menurut judul pasal (sanksi tanpa besaran, jangka waktu tanpa tanggal/durasi, garansi tanpa durasi, pembayaran tanpa persen/jumlah/skema pasti, nilai tanpa rupiah, bagi hasil tanpa persentase; `ai-engine/app/audit_rules.py`). LLM hanya memberi `SARAN`. Terverifikasi di model sungguhan: draf baku A `KRITIS=[P-06]`, setelah P-04 dan P-06 diperbaiki `KRITIS=[]`, tanpa eskalasi ke P-07/P-09. Proto dan skema TIDAK berubah: karena semua `KRITIS` pasti dari aturan, field `sumber` tidak diperlukan.
2. Uji stabilitas: tes offline dengan LLM palsu yang menandai semua pasal KRITIS (hasil KRITIS tidak berubah, memperbaiki satu pasal tidak menaikkan pasal lain), golden `audit_quality` (9 kasus; `kritis`/`clean` ditentukan kode, `saran` mengukur LLM). Koreksi atas rencana lama: input identik sudah stabil (di-cache 24 jam bila Redis aktif); yang goyah adalah draf yang *diubah*, jadi uji yang dipakai adalah metamorfik, bukan "5 kali draf sama".
3. Golden DraftContract (6 kasus, 5 jenis) dan RedactText (13 kasus) dan benchmark sudah selesai sejak 2026-11-11 (butir lama "perluas golden set" tidak perlu dikerjakan lagi). `gemini-3.8-flash` sudah dicoba ulang: 400 untuk `minimal`, 429/503/timeout dengan `low`.

**KEPUTUSAN USER (belum dijawab):** slot wajib kosong memblokir pengiriman (default sekarang) atau cukup peringatan? Akibat default: draf AI dari wizard saat ini SELALU terblokir di P-06 sampai pengguna mengisi durasi garansi di "Draf & Versi", karena templat baku tidak punya slot durasi dan frontend tidak mengirim `masa_garansi`. Melonggarkan satu aturan = ubah `tingkat` aturan itu jadi `"saran"` di `RULES` (tanpa ubah prompt).

**BLOKIR (butuh BE/FE sebelum ML bisa mengerjakan):** kualitas draf P-04/P-06. Rencana lama meminta ML mengisi rincian termin (persen, syarat capaian) dan durasi garansi dari jawaban wizard, tetapi datanya tidak ada: FE hanya mengirim `work, value, deadline, scheme, terms, method`; pertanyaan `masa_garansi`/`denda_keterlambatan` ada di BE tetapi tidak ditanyakan FE dan `RuleDraftClauses` mengabaikannya; tidak ada input persen atau syarat capaian. Mengisinya tanpa input = mengarang (kontrak 125 memakai 30/40/30 dan 180 hari: keputusan manusia). Prasyarat: (a) FE menanyakan dan mengirim `masa_garansi`, jumlah dan persen termin; (b) BE memakai jawaban itu atau templat memberi slot (`[masa garansi]`). Setelah itu ML menyesuaikan prompt draf (sekarang menyuruh teks konkret dipertahankan dan hanya kolom kosong diisi) dan menambah golden.

**P2:** ukur ulang `gemini-3-flash-preview` setelah kuota harian reset (`python -m evals.benchmark --models gemini:gemini-3-flash-preview --limit 6`); pertimbangkan `AI_PROVIDER_TIMEOUT` 8 dtk (audit 10 pasal di Groq 2 dari 8 percobaan timeout di 6 dtk); setelah user menentukan sumber, susun DRAF `clause_library`/`legal_references` dari peraturan nyata untuk direview (jangan karang pasal).

Selesai bila: `cd ai-engine && .venv/bin/python -m pytest -q` hijau (sudah). Redeploy ai-engine ke Azure (hanya `app/` + `requirements.txt`) supaya perubahan ini aktif; minta persetujuan user.
