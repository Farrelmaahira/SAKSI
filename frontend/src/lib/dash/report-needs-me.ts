import type { RoleKey } from '@/interfaces/auth'
import type { DReport } from '@/interfaces/db'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isClosed } from '@/lib/db/is-closed'

/* Does this report wait for an answer from someone in this role? */
export function reportNeedsMe(x: DReport, role: RoleKey): boolean {
  if (role === 'perangkat_desa') return !isClosed(x) && !desaAnswered(x)
  if (role === 'bpd') return !isClosed(x) && x.flow !== 'diteruskan'
  return x.flow === 'diteruskan'
}
