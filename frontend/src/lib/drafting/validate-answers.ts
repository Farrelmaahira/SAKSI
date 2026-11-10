import type { Answers } from '@/interfaces/drafting'
import { daysFromNow } from '@/lib/dates/days-from-now'

/* Field errors of the questions step; an empty object means the answers are valid. */
export function validateAnswers(a: Answers): Record<string, string> {
  const e: Record<string, string> = {}
  if (a.work.trim().length < 8) e.work = 'Jelaskan lebih rinci, minimal 8 huruf.'
  if (!a.value || a.value < 100_000) e.value = 'Isi nilai kontrak, minimal Rp100.000.'
  if (!a.deadline || a.deadline <= daysFromNow(0)) e.deadline = 'Tenggat harus setelah hari ini.'
  if (a.scheme === 'Termin' && (a.terms < 2 || a.terms > 6)) e.terms = 'Pilih 2 sampai 6 termin.'
  return e
}
