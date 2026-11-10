import type { Counterparty } from '@/interfaces/master'
import type { InviteForm } from '@/interfaces/invite'
import { isEmail } from '@/lib/auth/is-email'

/* First problem with the invite form, or '' when it can be sent. */
export function validateInvite(f: InviteForm, parties: Counterparty[]): string {
  if (f.name.trim().length < 3) return 'Tulis nama usaha atau kelompok, minimal 3 huruf.'
  if (!isEmail(f.email)) return 'Email belum benar. Contoh: nama@usaha.id'
  if (f.contact.trim().length < 3) return 'Tulis nama penanggung jawab.'
  if (parties.some((p) => p.email.toLowerCase() === f.email.trim().toLowerCase())) return 'Email ini sudah terdaftar. Pilih dari daftar di atas.'
  return ''
}
