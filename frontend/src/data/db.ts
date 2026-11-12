import type { ActionKind, ContractStatus, PubField, ReportFlow } from '@/interfaces/db'

export const statusOrder: ContractStatus[] = ['draf', 'diaudit', 'ditinjau', 'ditandatangani', 'dipublikasikan', 'berjalan', 'selesai']

export const statusLabels: Record<ContractStatus, string> = {
  draf: 'Draf',
  diaudit: 'Diaudit',
  ditinjau: 'Ditinjau',
  ditandatangani: 'Ditandatangani',
  dipublikasikan: 'Dipublikasikan',
  berjalan: 'Berjalan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

export const pubFields = ['nilai', 'pihak', 'pasal', 'termin', 'foto'] as const

export const pubFieldLabels: Record<PubField, string> = {
  nilai: 'Nilai kontrak',
  pihak: 'Identitas pihak kedua',
  pasal: 'Isi pasal',
  termin: 'Termin pembayaran',
  foto: 'Foto progres',
}

export const flowLabels: Record<ReportFlow, string> = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi BPD',
  diteruskan: 'Diteruskan ke Inspektorat',
  ditindaklanjuti: 'Ditindaklanjuti',
  ditutup: 'Ditutup',
}

/* Same flow, worded for the citizen who sent the report */
export const wargaFlowLabels: Record<ReportFlow, string> = {
  baru: 'Diterima',
  diverifikasi: 'Diverifikasi',
  diteruskan: 'Diteruskan ke Inspektorat',
  ditindaklanjuti: 'Ditindaklanjuti',
  ditutup: 'Selesai',
}

/* Notification headline per action on a citizen's report */
export const actionLabels: Record<ActionKind, string> = {
  tanggapan: 'Tanggapan desa',
  klarifikasi: 'Permintaan klarifikasi',
  verifikasi: 'Diverifikasi',
  eskalasi: 'Diteruskan ke Inspektorat',
  selesai: 'Ditandai selesai',
  tindak_lanjut: 'Tindak lanjut Inspektorat',
  tutup: 'Ditutup',
}

/* ---------- Seed ---------- */

export const keyByTitle: Record<string, string> = {
  'Para Pihak': 'para_pihak',
  'Objek Pekerjaan': 'objek',
  'Objek Hibah': 'objek',
  'Objek Sewa': 'objek',
  'Nilai Kontrak': 'nilai',
  'Nilai Hibah': 'nilai',
  'Nilai dan Jangka Waktu': 'nilai',
  'Jangka Waktu': 'jangka_waktu',
  'Serah Terima': 'serah_terima',
  'Sanksi Keterlambatan': 'sanksi',
  'Kewajiban Penerima': 'kewajiban_penerima',
  Pelaporan: 'pelaporan',
  Pemeliharaan: 'pemeliharaan',
}

