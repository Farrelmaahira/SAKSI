import type { ContractTypeOption, Distractor, SignItem, SignedState, SimClause, SimStep } from '@/interfaces/simulator'

export const steps: SimStep[] = [
  {
    title: 'Pilih jenis kontrak',
    short: 'Tentukan bentuk perjanjian',
    guide: 'Desa ingin membeli semen dan pasir. Seret kartu jenis kontrak yang paling cocok ke meja kerja.',
    why: 'Jenis kontrak menentukan pasal apa saja yang wajib ada. Kalau jenisnya keliru, isi kontrak bisa tidak melindungi desa.',
  },
  {
    title: 'Susun pasal',
    short: 'Lengkapi isi dengan bantuan AI',
    guide: 'Seret kartu pasal ke dalam draf. SAKSI menghitung kelengkapannya, dan AI memberi saran bila ada yang terlewat.',
    why: 'Kontrak yang bolong membuka celah. Misalnya tanpa batas waktu, keterlambatan tidak bisa ditagih.',
  },
  {
    title: 'Tanda tangan dan e‑meterai',
    short: 'Simulasi pengesahan',
    guide: 'Seret tanda tangan ke kotak milik masing masing pihak, lalu tempelkan e‑meterai di tengah.',
    why: 'Tanda tangan menunjukkan kedua pihak setuju. Meterai membuat dokumen bisa dipakai sebagai alat bukti. Di sini hanya simulasi.',
  },
  {
    title: 'Segel dengan hash',
    short: 'Kunci isi dokumen',
    guide: 'Tekan tombol segel untuk membuat sidik digital. Setelah itu, coba ubah nilai kontrak dan perhatikan sidiknya.',
    why: 'Hash bekerja seperti sidik jari. Satu angka berubah, sidik jarinya ikut berubah, jadi perubahan diam diam langsung ketahuan.',
  },
  {
    title: 'Publikasi dan pantau',
    short: 'Buka untuk warga',
    guide: 'Publikasikan kontrak supaya warga bisa melihat isi dan progres pekerjaannya.',
    why: 'Warga yang tahu isi kontrak bisa membandingkannya dengan kondisi di lapangan, lalu melapor bila ada yang janggal.',
  },
]

export const types: ContractTypeOption[] = [
  { id: 'Pengadaan', note: 'Membeli barang atau jasa' },
  { id: 'Hibah', note: 'Memberi bantuan tanpa imbalan' },
  { id: 'Kerja sama BUMDes', note: 'Usaha bersama dengan mitra' },
  { id: 'Sewa aset desa', note: 'Menyewakan milik desa' },
]

export const typeFeedback: Record<string, string> = {
  Hibah: 'Belum tepat. Hibah dipakai untuk memberi bantuan tanpa imbalan, sedangkan di sini desa membeli barang.',
  'Kerja sama BUMDes': 'Belum tepat. Kerja sama BUMDes dipakai untuk usaha bersama dengan mitra, bukan untuk membeli barang.',
  'Sewa aset desa': 'Belum tepat. Sewa dipakai ketika desa menyewakan tanah, bangunan, atau peralatan miliknya.',
}

export const clauses: SimClause[] = [
  { id: 'pihak', title: 'Para Pihak', text: 'Pemerintah Desa Sukamaju, diwakili Kepala Desa Hendra Wijaya, dan CV Maju Bersama, diwakili Rina Kartika.', why: 'Tanpa pasal ini, tidak jelas siapa yang bertanggung jawab.' },
  { id: 'objek', title: 'Objek Pekerjaan', text: 'Pengadaan 40 sak semen dan 6 m³ pasir untuk perbaikan jalan Dusun Krajan.', why: 'Barang yang dibeli harus disebut beserta jumlahnya.' },
  { id: 'nilai', title: 'Nilai Kontrak', text: 'Rp24.000.000, sudah termasuk ongkos kirim dan pajak.', why: 'Harga harus tertulis supaya tidak bisa digelembungkan.' },
  { id: 'waktu', title: 'Jangka Waktu', text: '30 hari kalender sejak kontrak ditandatangani.', why: 'Tanpa batas waktu, keterlambatan sulit ditagih.' },
  { id: 'serah', title: 'Serah Terima', text: 'Barang diserahkan di balai desa dan dibuktikan dengan berita acara serah terima.', why: 'Tanpa berita acara, barang bisa dianggap sudah diterima padahal belum.' },
  { id: 'sanksi', title: 'Sanksi Keterlambatan', text: 'Denda 1 per mil dari nilai kontrak untuk setiap hari keterlambatan.', why: 'Penyedia perlu tahu akibatnya bila terlambat.' },
]

export const distractor: Distractor = {
  id: 'promosi',
  title: 'Promosi Usaha',
  reason: 'Pasal promosi tidak diperlukan. Kontrak pengadaan cukup mengatur barang, nilai, waktu, dan tanggung jawab.',
}

export const trayOrder = ['nilai', 'promosi', 'pihak', 'serah', 'waktu', 'objek', 'sanksi']

export const signItems: SignItem[] = [
  { id: 'sig-kades', key: 'kades', zone: 'zone-kades', label: 'Tanda tangan Kepala Desa' },
  { id: 'sig-meterai', key: 'meterai', zone: 'zone-meterai', label: 'E‑meterai 10.000' },
  { id: 'sig-penyedia', key: 'penyedia', zone: 'zone-penyedia', label: 'Tanda tangan penyedia' },
]

export const BASE_VALUE = 24000000

export const unsigned: SignedState = { kades: false, meterai: false, penyedia: false }
