import type { Spk } from '@/interfaces/db'

/* First problem with an SPK form, or '' when it is fine. */
export function validateSpk(f: Spk): string {
  if (f.number.trim().length < 4) return 'Isi nomor SPK.'
  if (!f.date || !f.start || !f.end) return 'Lengkapi semua tanggal.'
  if (f.end < f.start) return 'Tanggal selesai harus setelah tanggal mulai.'
  return ''
}
