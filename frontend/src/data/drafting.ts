import type { IllustrationName } from '@/data/illustrations'
import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import type { CounterpartyType } from '@/interfaces/master'

export const templates: Record<
  TemplateKey,
  { label: string; desc: string; art: IllustrationName; partyTypes: CounterpartyType[]; workLabel: string; workPlaceholder: string }
> = {
  pengadaan: {
    label: 'Pengadaan',
    desc: 'Membeli barang atau jasa, misalnya material bangunan.',
    art: 'document-ready_o5d5',
    partyTypes: ['Penyedia', 'UMKM'],
    workLabel: 'Barang atau pekerjaan apa yang dibeli?',
    workPlaceholder: 'Contoh: 30 batang pipa PVC 3 inci untuk air bersih Dusun Babakan',
  },
  hibah: {
    label: 'Hibah',
    desc: 'Memberi bantuan barang atau uang kepada kelompok warga.',
    art: 'online-community_3o0l',
    partyTypes: ['Penerima hibah'],
    workLabel: 'Apa yang dihibahkan?',
    workPlaceholder: 'Contoh: dua unit mesin perontok padi',
  },
  bumdes: {
    label: 'Kerja sama BUMDes',
    desc: 'Mengelola usaha desa bersama BUMDes.',
    art: 'in-progress_2mox',
    partyTypes: ['BUMDes'],
    workLabel: 'Usaha apa yang dikerjasamakan?',
    workPlaceholder: 'Contoh: pengelolaan wisata Curug Cikondang',
  },
  sewa: {
    label: 'Sewa aset',
    desc: 'Menyewakan aset desa seperti kios atau lahan.',
    art: 'food-truck_my6o',
    partyTypes: ['Penyewa', 'UMKM'],
    workLabel: 'Aset apa yang disewakan?',
    workPlaceholder: 'Contoh: kios nomor 4 di pasar desa',
  },
}

export const methods = ['Pengadaan langsung', 'Penunjukan langsung', 'Swakelola', 'Lelang terbatas'] as const

/* legal_references (examples) */
export const legal = {
  sahPerjanjian: 'KUHPerdata Pasal 1320 tentang syarat sah perjanjian',
  kebebasan: 'KUHPerdata Pasal 1338 tentang kekuatan mengikat perjanjian',
  wanprestasi: 'KUHPerdata Pasal 1243 tentang ganti rugi karena ingkar janji',
  kahar: 'KUHPerdata Pasal 1244–1245 tentang keadaan memaksa',
  pbjDesa: 'Peraturan LKPP Nomor 12 Tahun 2019 tentang Pengadaan Barang/Jasa di Desa',
  keuanganDesa: 'Permendagri Nomor 20 Tahun 2018 tentang Pengelolaan Keuangan Desa',
  asetDesa: 'Permendagri Nomor 1 Tahun 2016 tentang Pengelolaan Aset Desa',
  bumdes: 'PP Nomor 11 Tahun 2021 tentang Badan Usaha Milik Desa',
  desa: 'UU Nomor 6 Tahun 2014 tentang Desa',
}

export const objectText: Record<TemplateKey, (a: Answers) => string> = {
  pengadaan: (a) => `Pihak Kedua menyediakan ${a.work}. Pemilihan penyedia dilakukan melalui ${a.method.toLowerCase()}.`,
  hibah: (a) => `Pihak Pertama menyerahkan hibah berupa ${a.work} kepada Pihak Kedua untuk kepentingan anggotanya.`,
  bumdes: (a) => `Para pihak bekerja sama dalam ${a.work}.`,
  sewa: (a) => `Pihak Pertama menyewakan ${a.work} kepada Pihak Kedua.`,
}

export const objectLegal: Record<TemplateKey, string> = { pengadaan: legal.pbjDesa, hibah: legal.keuanganDesa, bumdes: legal.bumdes, sewa: legal.asetDesa }

export const VAGUE_SANCTION = 'Keterlambatan akan dikenakan sanksi sesuai kesepakatan kemudian.'

export const extra: Record<TemplateKey, Clause[]> = {
  pengadaan: [
    {
      key: 'serah_terima',
      title: 'Serah Terima',
      text: 'Barang atau pekerjaan diserahkan di balai desa dan dibuktikan dengan berita acara serah terima yang ditandatangani kedua pihak.',
      plain: 'Kapan dan bagaimana barang dianggap sudah diterima desa.',
      legal: legal.pbjDesa,
    },
  ],
  hibah: [
    {
      key: 'kewajiban_penerima',
      title: 'Kewajiban Penerima',
      text: 'Penerima merawat barang hibah dan memakainya untuk kepentingan seluruh anggota kelompok.',
      plain: 'Apa yang wajib dilakukan penerima setelah menerima hibah.',
      legal: legal.keuanganDesa,
    },
    {
      key: 'pelaporan',
      title: 'Pelaporan Penggunaan',
      text: 'Penerima melaporkan penggunaan hibah paling lambat 3 bulan setelah serah terima, lalu setiap 6 bulan.',
      plain: 'Kapan penerima harus melapor ke desa.',
      legal: legal.keuanganDesa,
    },
  ],
  bumdes: [
    {
      key: 'bagi_hasil',
      title: 'Bagi Hasil',
      text: 'Pendapatan bersih dibagi 60 persen untuk BUMDes dan 40 persen untuk Pemerintah Desa, dilaporkan setiap bulan.',
      plain: 'Bagaimana keuntungan dibagi dan seberapa sering dilaporkan.',
      legal: legal.bumdes,
    },
  ],
  sewa: [
    {
      key: 'pemeliharaan',
      title: 'Pemeliharaan',
      text: 'Penyewa menjaga kebersihan aset dan menanggung perbaikan ringan selama masa sewa.',
      plain: 'Siapa yang merawat aset selama disewa.',
      legal: legal.asetDesa,
    },
  ],
}

export const sanctionFix: Record<TemplateKey, string> = {
  pengadaan: 'Keterlambatan dikenakan denda 1 per mil dari nilai kontrak untuk setiap hari, paling banyak 5 persen dari nilai kontrak.',
  bumdes: 'Keterlambatan setoran bagi hasil dikenakan denda 1 per mil per hari dari nilai setoran, dan kerja sama dapat dievaluasi.',
  hibah: 'Jika hibah tidak digunakan sesuai peruntukan, penerima wajib mengembalikan barang atau nilai hibah kepada desa.',
  sewa: 'Keterlambatan pembayaran sewa lebih dari 30 hari memberi hak kepada desa untuk mengakhiri sewa.',
}
