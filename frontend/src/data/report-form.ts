import type { ReportCategory } from '@/interfaces/content'

export const reportCategories: ReportCategory[] = [
  { title: 'Pekerjaan tidak sesuai kontrak', note: 'Jumlah, ukuran, atau kualitas berbeda' },
  { title: 'Terlambat dari jadwal', note: 'Melewati jangka waktu di kontrak' },
  { title: 'Dugaan penggelembungan biaya', note: 'Harga terasa tidak wajar' },
  { title: 'Proyek tidak ditemukan', note: 'Tertulis ada, di lapangan tidak ada' },
  { title: 'Lainnya', note: 'Kejanggalan di luar pilihan di atas' },
]

export const formSteps = ['Pilih masalah', 'Ceritakan', 'Periksa dan kirim']

export const ticketStepNotes = ['Baru saja', 'Pengawas memeriksa bukti', 'Tindak lanjut diumumkan']
