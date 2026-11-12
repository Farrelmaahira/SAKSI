import type { DContract, DReport } from '@/interfaces/db'
import { daysUntil } from '@/lib/dates/days-until'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isActive } from '@/lib/db/is-active'
import { isClosed } from '@/lib/db/is-closed'
import { isEditable } from '@/lib/db/is-editable'
import { openCritical } from '@/lib/db/open-critical'
import { valueOf } from '@/lib/db/value-of'

/* Numbers for the village head's home: active contracts, this year's value, terms due within a week, unanswered reports, open critical findings in drafts. */
export function desaSummary(contracts: DContract[], reports: DReport[], year: number) {
  return {
    active: contracts.filter(isActive),
    yearValue: contracts.filter((c) => !isEditable(c) && c.status !== 'dibatalkan' && new Date(c.createdAt).getFullYear() === year).reduce((s, c) => s + valueOf(c), 0),
    due: contracts.flatMap((c) => c.terms.filter((t) => !t.paidDate && daysUntil(t.planDate) <= 7 && isActive(c))),
    unanswered: reports.filter((x) => !isClosed(x) && !desaAnswered(x)),
    critical: contracts.filter(isEditable).reduce((s, c) => s + openCritical(c), 0),
  }
}
