import { update } from '@/lib/db/update'
import { daysFromNow } from '@/lib/dates/days-from-now'

export function markPaid(code: string, no: number) {
  update(code, (c) => ({ ...c, terms: c.terms.map((t) => (t.no === no ? { ...t, paidDate: daysFromNow(0) } : t)) }))
}
