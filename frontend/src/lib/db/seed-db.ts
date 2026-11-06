import type { ActionKind, DContract, DReport, Db, ReportAction, Review } from '@/interfaces/db'
import type { Answers } from '@/interfaces/drafting'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { seedContracts } from '@/data/seed-contracts'
import { stampFromNow } from '@/lib/dates/stamp-from-now'
import { mkVersion } from '@/lib/db/mk-version'
import { clausesFromPublic } from '@/lib/db/clauses-from-public'
import { signed } from '@/lib/db/signed'
import { prog } from '@/lib/db/prog'
import { allPub } from '@/data/db'
import { hist } from '@/lib/db/hist'
import { titleFor } from '@/lib/db/title-for'
import { mkTerms } from '@/lib/db/mk-terms'
import type { RoleKey } from '@/interfaces/auth'
import { uid } from '@/lib/dates/uid'

export function seedDb(): Db {
  const a014: Answers = { work: '40 sak semen dan 6 m³ pasir untuk perbaikan jalan Dusun Krajan', value: 24_000_000, deadline: daysFromNow(10), scheme: 'Termin', terms: 2, method: 'Pengadaan langsung' }
  const a022: Answers = { work: 'dua unit mesin perontok padi beserta perlengkapan perawatan', value: 45_500_000, deadline: daysFromNow(60), scheme: 'Sekaligus', terms: 1, method: 'Penunjukan langsung' }
  const a031: Answers = { work: 'kios nomor 4 di pasar desa berukuran 3 x 4 meter', value: 6_000_000, deadline: daysFromNow(700), scheme: 'Sekaligus', terms: 1, method: 'Penunjukan langsung' }
  const a038: Answers = { work: '30 batang pipa PVC 3 inci dan 4 tandon air untuk air bersih Dusun Babakan', value: 68_000_000, deadline: daysFromNow(45), scheme: 'Termin', terms: 2, method: 'Pengadaan langsung' }
  const a041: Answers = { work: 'pengelolaan wisata Curug Cikondang', value: 120_000_000, deadline: daysFromNow(365), scheme: 'Termin', terms: 4, method: 'Penunjukan langsung' }
  const a045: Answers = { work: '12 unit lampu jalan tenaga surya untuk Dusun Krajan dan Babakan', value: 52_000_000, deadline: daysFromNow(30), scheme: 'Termin', terms: 2, method: 'Pengadaan langsung' }
  const a019: Answers = { work: 'rehabilitasi saluran irigasi Blok Sawah Tengah sepanjang 400 meter', value: 145_000_000, deadline: daysFromNow(-6), scheme: 'Termin', terms: 3, method: 'Pengadaan langsung' }
  const a027: Answers = { work: 'pembangunan jembatan bambu Dusun Kaler sepanjang 18 meter', value: 88_000_000, deadline: daysFromNow(12), scheme: 'Termin', terms: 2, method: 'Pengadaan langsung' }

  const hendra = 'Hendra Wijaya'
  const base = { reviews: [] as Review[], selfReport: true }

  const contracts: DContract[] = [
    {
      ...base,
      code: 'SKS-2026-014',
      villageId: 'sukamaju',
      template: 'pengadaan',
      title: seedContracts[0].title,
      counterpartyId: 'cp-maju',
      status: 'berjalan',
      createdAt: stampFromNow(-24),
      versions: [mkVersion('pengadaan', a014, 'sukamaju', 'cp-maju', [], stampFromNow(-24), clausesFromPublic('SKS-2026-014', 'pengadaan', a014, 'sukamaju', 'cp-maju'))],
      reviewDecision: 'setuju',
      signatures: signed(hendra, 'Rina Kartika', -21, 'SIM-10000-0142'),
      seals: [{ hash: '', at: stampFromNow(-20.1), prev: null, versionNo: 1 }],
      spk: { number: 'SPK/014/DS-SKM/2026', date: daysFromNow(-20), start: daysFromNow(-20), end: daysFromNow(10) },
      terms: [
        { no: 1, label: 'Termin 1', percent: 50, amount: 12_000_000, planDate: daysFromNow(-12), paidDate: daysFromNow(-12) },
        { no: 2, label: 'Termin 2', percent: 50, amount: 12_000_000, planDate: daysFromNow(5) },
      ],
      progress: [
        prog(20, -14, 'Material tiba di balai desa: 40 sak semen dan 3 m³ pasir.', 3, hendra),
        prog(45, -7, 'Pengecoran ruas pertama selesai.', 2, 'Rina Kartika', 'pihak_kedua'),
        prog(60, -2, 'Sekitar 60 persen ruas jalan selesai dicor.', 4, hendra),
      ],
      publication: { at: stampFromNow(-20), ...allPub },
      history: hist(hendra, ['draf', -24], ['diaudit', -24], ['ditinjau', -23], ['ditandatangani', -21], ['dipublikasikan', -20], ['berjalan', -20]),
    },
    {
      ...base,
      code: 'SKS-2026-045',
      villageId: 'sukamaju',
      template: 'pengadaan',
      title: titleFor('pengadaan', a045.work),
      counterpartyId: 'cp-maju',
      status: 'ditinjau',
      createdAt: stampFromNow(-6),
      versions: [mkVersion('pengadaan', a045, 'sukamaju', 'cp-maju', ['sanksi', 'kahar', 'retensi'], stampFromNow(-6))],
      reviewDecision: 'setuju',
      reviews: [
        {
          id: 'rv-045-1',
          versionNo: 1,
          clauseKey: 'objek',
          author: 'Rina Kartika',
          role: 'pihak_kedua',
          text: 'Mohon dicantumkan spesifikasi minimal lampu supaya tidak ada salah paham saat serah terima.',
          at: stampFromNow(-3),
          resolved: true,
          replies: [{ author: hendra, role: 'perangkat_desa', text: 'Spesifikasi 60 watt, tiang 7 meter, kami lampirkan di berita acara.', at: stampFromNow(-2.5) }],
        },
      ],
      signatures: {},
      seals: [],
      terms: mkTerms(a045, daysFromNow(0)),
      progress: [],
      history: hist(hendra, ['draf', -6], ['diaudit', -6], ['ditinjau', -4]),
    },
    {
      ...base,
      code: 'SKS-2026-038',
      villageId: 'sukamaju',
      template: 'pengadaan',
      title: titleFor('pengadaan', a038.work),
      counterpartyId: 'cp-maju',
      status: 'ditinjau',
      createdAt: stampFromNow(-3),
      versions: [mkVersion('pengadaan', a038, 'sukamaju', 'cp-maju', ['sanksi', 'kahar'], stampFromNow(-3))],
      signatures: {},
      seals: [],
      terms: mkTerms(a038, daysFromNow(0)),
      progress: [],
      history: hist(hendra, ['draf', -3], ['diaudit', -3], ['ditinjau', -1.2]),
    },
    {
      ...base,
      code: 'SKS-2026-041',
      villageId: 'sukamaju',
      template: 'bumdes',
      title: titleFor('bumdes', a041.work),
      counterpartyId: 'cp-bumdes',
      status: 'draf',
      createdAt: stampFromNow(-5),
      versions: [mkVersion('bumdes', a041, 'sukamaju', 'cp-bumdes', [], stampFromNow(-5))],
      signatures: {},
      seals: [],
      terms: mkTerms(a041, daysFromNow(0)),
      progress: [],
      history: hist(hendra, ['draf', -5]),
    },
    {
      ...base,
      code: 'SKS-2026-031',
      villageId: 'sukamaju',
      template: 'sewa',
      title: seedContracts[2].title,
      counterpartyId: 'cp-sari',
      status: 'berjalan',
      createdAt: stampFromNow(-40),
      versions: [mkVersion('sewa', a031, 'sukamaju', 'cp-sari', [], stampFromNow(-40), clausesFromPublic('SKS-2026-031', 'sewa', a031, 'sukamaju', 'cp-sari'))],
      reviewDecision: 'setuju',
      signatures: signed(hendra, 'Sari Lestari', -38, 'SIM-10000-0131'),
      seals: [{ hash: '', at: stampFromNow(-37), prev: null, versionNo: 1 }],
      spk: { number: 'SPK/031/DS-SKM/2026', date: daysFromNow(-37), start: daysFromNow(-37), end: daysFromNow(700) },
      terms: [{ no: 1, label: 'Sewa tahun pertama', percent: 100, amount: 6_000_000, planDate: daysFromNow(-37), paidDate: daysFromNow(-37) }],
      progress: [prog(100, -36, 'Kios sudah digunakan penyewa.', 1, hendra)],
      publication: { at: stampFromNow(-37), ...allPub },
      history: hist(hendra, ['draf', -40], ['diaudit', -40], ['ditinjau', -39], ['ditandatangani', -38], ['dipublikasikan', -37], ['berjalan', -37]),
    },
    {
      ...base,
      code: 'SKS-2026-019',
      villageId: 'cibodas',
      template: 'pengadaan',
      title: titleFor('pengadaan', a019.work),
      counterpartyId: 'cp-karya',
      status: 'berjalan',
      createdAt: stampFromNow(-66),
      versions: [mkVersion('pengadaan', a019, 'cibodas', 'cp-karya', ['sanksi'], stampFromNow(-66))],
      reviewDecision: 'setuju',
      signatures: signed('Ujang Suryana', 'Dadang Hermawan', -62, 'SIM-10000-0119'),
      seals: [{ hash: '', at: stampFromNow(-61), prev: null, versionNo: 1 }],
      spk: { number: 'SPK/019/DS-CBD/2026', date: daysFromNow(-60), start: daysFromNow(-60), end: daysFromNow(-6) },
      terms: [
        { no: 1, label: 'Termin 1', percent: 40, amount: 58_000_000, planDate: daysFromNow(-40), paidDate: daysFromNow(-40) },
        { no: 2, label: 'Termin 2', percent: 30, amount: 43_500_000, planDate: daysFromNow(-3) },
        { no: 3, label: 'Termin 3', percent: 30, amount: 43_500_000, planDate: daysFromNow(-6) },
      ],
      progress: [prog(15, -45, 'Galian saluran dimulai.', 2, 'Ujang Suryana'), prog(35, -18, 'Pemasangan batu kali di 140 meter pertama.', 3, 'Ujang Suryana')],
      publication: { at: stampFromNow(-61), ...allPub },
      history: hist('Ujang Suryana', ['draf', -66], ['diaudit', -66], ['ditinjau', -64], ['ditandatangani', -62], ['dipublikasikan', -61], ['berjalan', -60]),
    },
    {
      ...base,
      code: 'SKS-2026-022',
      villageId: 'mekarsari',
      template: 'hibah',
      title: seedContracts[1].title,
      counterpartyId: 'cp-sri',
      status: 'berjalan',
      createdAt: stampFromNow(-14),
      versions: [mkVersion('hibah', a022, 'mekarsari', 'cp-sri', [], stampFromNow(-14), clausesFromPublic('SKS-2026-022', 'hibah', a022, 'mekarsari', 'cp-sri'))],
      reviewDecision: 'setuju',
      signatures: signed('Siti Aminah', 'Darto', -12, 'SIM-10000-0122'),
      seals: [{ hash: '', at: stampFromNow(-11), prev: null, versionNo: 1 }],
      spk: { number: 'SPK/022/DS-MKS/2026', date: daysFromNow(-11), start: daysFromNow(-11), end: daysFromNow(60) },
      terms: [{ no: 1, label: 'Pembayaran penuh', percent: 100, amount: 45_500_000, planDate: daysFromNow(-10), paidDate: daysFromNow(-10) }],
      progress: [prog(35, -5, 'Satu dari dua unit mesin sudah diterima kelompok tani.', 1, 'Siti Aminah')],
      publication: { at: stampFromNow(-11), ...allPub },
      history: hist('Siti Aminah', ['draf', -14], ['diaudit', -14], ['ditinjau', -13], ['ditandatangani', -12], ['dipublikasikan', -11], ['berjalan', -11]),
    },
    {
      ...base,
      code: 'SKS-2026-027',
      villageId: 'mekarsari',
      template: 'pengadaan',
      title: titleFor('pengadaan', a027.work),
      counterpartyId: 'cp-subur',
      status: 'berjalan',
      createdAt: stampFromNow(-34),
      versions: [mkVersion('pengadaan', a027, 'mekarsari', 'cp-subur', ['sanksi', 'kahar'], stampFromNow(-34))],
      reviewDecision: 'setuju',
      signatures: signed('Siti Aminah', 'Yayan Sopyan', -31, 'SIM-10000-0127'),
      seals: [{ hash: '', at: stampFromNow(-30), prev: null, versionNo: 1 }],
      spk: { number: 'SPK/027/DS-MKS/2026', date: daysFromNow(-30), start: daysFromNow(-30), end: daysFromNow(12) },
      terms: [
        { no: 1, label: 'Termin 1', percent: 50, amount: 44_000_000, planDate: daysFromNow(-20), paidDate: daysFromNow(-20) },
        { no: 2, label: 'Termin 2', percent: 50, amount: 44_000_000, planDate: daysFromNow(12) },
      ],
      progress: [prog(70, -3, 'Rangka jembatan terpasang, tinggal lantai dan pegangan.', 3, 'Siti Aminah')],
      publication: { at: stampFromNow(-30), ...allPub },
      history: hist('Siti Aminah', ['draf', -34], ['diaudit', -34], ['ditinjau', -33], ['ditandatangani', -31], ['dipublikasikan', -30], ['berjalan', -30]),
    },
  ]

  const act = (kind: ActionKind, by: string, role: RoleKey, d: number, text: string): ReportAction => ({ id: uid('ra-'), kind, by, role, at: stampFromNow(d), text })
  const reports: DReport[] = [
    {
      id: 'LPR-2026-0102',
      contractCode: 'SKS-2026-014',
      category: 'Pekerjaan tidak sesuai kontrak',
      clause: 'Objek Pekerjaan',
      text: 'Cor jalan di dekat RT 05 sudah retak padahal baru seminggu selesai.',
      location: 'Jalan Dusun Krajan, RT 05',
      date: daysFromNow(-1),
      reporter: 'Anonim',
      photos: 2,
      flow: 'baru',
      actions: [],
    },
    {
      id: 'LPR-2026-0087',
      contractCode: 'SKS-2026-014',
      category: 'Pekerjaan tidak sesuai kontrak',
      clause: 'Objek Pekerjaan',
      text: 'Pasir yang datang baru sekitar setengah truk, padahal di kontrak tertulis 6 m³.',
      location: 'Balai Desa Sukamaju',
      date: daysFromNow(-19),
      reporter: 'Warga RT 03',
      photos: 2,
      flow: 'ditindaklanjuti',
      actions: [
        act('verifikasi', 'Asep Saepudin', 'bpd', -18.5, 'Sudah dicek ke balai desa, pasir memang baru 3 m³.'),
        act('tanggapan', hendra, 'perangkat_desa', -18, 'Penyedia mengonfirmasi pengiriman bertahap. Sisa 3 m³ dijadwalkan tiba minggu depan.'),
        act('selesai', 'Asep Saepudin', 'bpd', -12, 'Sisa pasir sudah tiba dan dicek bersama warga.'),
      ],
    },
    {
      id: 'LPR-2026-0091',
      contractCode: 'SKS-2026-019',
      category: 'Proyek terlambat',
      clause: 'Jangka Waktu',
      text: 'Pekerjaan berhenti hampir dua minggu dan alat berat sudah ditarik dari lokasi.',
      location: 'Blok Sawah Tengah',
      date: daysFromNow(-9),
      reporter: 'Kelompok Tani Cibodas',
      photos: 3,
      flow: 'diteruskan',
      actions: [
        act('verifikasi', 'Nina Marlina', 'bpd', -8.5, 'Lokasi dicek, tidak ada aktivitas pekerjaan.'),
        act('klarifikasi', 'Nina Marlina', 'bpd', -8, 'Mohon desa menjelaskan penyebab pekerjaan berhenti.'),
        act('tanggapan', 'Ujang Suryana', 'perangkat_desa', -6, 'Penyedia beralasan menunggu material batu kali.'),
        act('eskalasi', 'Nina Marlina', 'bpd', -4, 'Tanggapan desa belum menjawab keterlambatan, sementara termin 1 sudah cair 40 persen.'),
      ],
    },
    {
      id: 'LPR-2026-0095',
      contractCode: 'SKS-2026-019',
      category: 'Dugaan penggelembungan biaya',
      clause: 'Cara Pembayaran',
      text: 'Termin pertama sudah cair 40 persen, tapi pekerjaan di lapangan belum sampai sepertiga.',
      date: daysFromNow(-5),
      reporter: 'Anonim',
      photos: 0,
      flow: 'diverifikasi',
      actions: [act('verifikasi', 'Nina Marlina', 'bpd', -4.5, 'Selisih pembayaran dan progres terkonfirmasi.')],
    },
    {
      id: 'LPR-2026-0099',
      contractCode: 'SKS-2026-019',
      category: 'Pekerjaan tidak sesuai kontrak',
      clause: 'Objek Perjanjian',
      text: 'Lebar saluran yang dibangun terlihat lebih sempit dari gambar di papan proyek.',
      location: 'Blok Sawah Tengah, ujung timur',
      date: daysFromNow(-2),
      reporter: 'Anonim',
      photos: 1,
      flow: 'baru',
      actions: [],
    },
    {
      id: 'LPR-2026-0093',
      contractCode: 'SKS-2026-027',
      category: 'Pekerjaan tidak sesuai kontrak',
      clause: 'Objek Perjanjian',
      text: 'Bambu yang dipakai masih basah dan beberapa sudah retak.',
      location: 'Jembatan Dusun Kaler',
      date: daysFromNow(-7),
      reporter: 'Warga Dusun Kaler',
      photos: 4,
      flow: 'diteruskan',
      actions: [
        act('verifikasi', 'Dodi Kurnia', 'bpd', -6.5, 'Kondisi bambu sesuai laporan.'),
        act('eskalasi', 'Dodi Kurnia', 'bpd', -6, 'Perlu pemeriksaan teknis, diteruskan ke Inspektorat Subang.'),
      ],
    },
  ]

  return { contracts, reports }
}
