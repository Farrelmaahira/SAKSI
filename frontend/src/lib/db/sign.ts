import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { completeSigning } from '@/lib/db/complete-signing'
import { nowIso } from '@/lib/dates/now-iso'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

/* image: the handwritten signature drawn on the pad, as a PNG data URL */
export function sign(code: string, who: 'desa' | 'pihak', s: Session, image?: string) {
  update(code, (c) => completeSigning({ ...c, signatures: { ...c.signatures, [who]: { by: s.name, at: nowIso(), image } } }, s.name))
  log(s, who === 'desa' ? 'Menandatangani kontrak (desa)' : 'Menandatangani kontrak (pihak kedua)', find(code))
}
