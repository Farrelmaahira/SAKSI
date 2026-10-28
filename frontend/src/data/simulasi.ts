import type { AboutItem, FaqEntry, FlowItem } from '@/interfaces/content'

export const about: AboutItem[] = [
  { title: 'Apa itu SAKSI', text: 'Sistem kontrak digital untuk pemerintah desa dan UMKM. Kontrak disusun, diperiksa, disegel, lalu dibuka untuk publik.' },
  { title: 'Kenapa dibuat', text: 'Dana desa besar, tetapi kontraknya sering tidak jelas. Tanpa patokan tertulis, pengawasan sulit dilakukan siapa pun.' },
  { title: 'Untuk siapa', text: 'Perangkat desa, pelaku UMKM, warga, dan pengawas. Semua melihat dokumen yang sama, dengan sidik digital yang sama.' },
]

export const flow: FlowItem[] = [
  { label: 'Pilih jenis', desc: 'Pengadaan, hibah, atau sewa.', art: 'document-ready_o5d5' },
  { label: 'Susun pasal', desc: 'Enam pasal wajib, dibantu AI.', art: 'writing-online_x665' },
  { label: 'Sahkan', desc: 'Tanda tangan dan e‑meterai.', art: 'digital-signature_ttti' },
  { label: 'Segel hash', desc: 'Sidik digital pengunci isi.', art: 'fingerprint_kdwq' },
  { label: 'Publikasi', desc: 'Terbuka untuk diawasi warga.', art: 'online-community_3o0l' },
]

export const faq: FaqEntry[] = [
  {
    question: 'Apakah saya harus paham hukum untuk memakai SAKSI?',
    answer:
      'Tidak. Templat dan audit pasal membantu menyusun kontrak. AI memberi saran bila ada pasal yang terlewat, tetapi keputusan tetap di tangan perangkat desa.',
  },
  { question: 'Apakah tanda tangan dan e‑meterai di simulasi ini sah?', answer: 'Belum. Di prototipe ini keduanya hanya simulasi untuk menunjukkan alurnya.' },
  {
    question: 'Apa itu hash?',
    answer: 'Rangkaian 64 karakter yang dihitung dari isi dokumen. Isi berubah sedikit saja, hash berubah total. Karena itu hash dipakai untuk mendeteksi perubahan.',
  },
  {
    question: 'Siapa yang bisa melihat kontrak?',
    answer: 'Kontrak yang dipublikasikan bisa dilihat siapa saja, termasuk progres pekerjaannya. Data pribadi seperti nomor induk tidak ditampilkan.',
  },
  {
    question: 'Bagaimana kalau saya menemukan kejanggalan?',
    answer: 'Buka halaman Lacak dan Lapor, cari kontraknya, lalu kirim laporan dengan merujuk pasal yang tidak sesuai. Identitas boleh disembunyikan.',
  },
]
