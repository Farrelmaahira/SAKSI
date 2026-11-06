import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function markPaid(code: string, no: number, s: Session) {
  update(code, (c) => ({ ...c, terms: c.terms.map((t) => (t.no === no ? { ...t, paidDate: daysFromNow(0) } : t)) }))
  log(s, `Menandai ${find(code)?.terms.find((t) => t.no === no)?.label.toLowerCase() ?? 'termin'} dibayar`, find(code))
}
