import type { Todo } from '@/interfaces/dash'
import type { DContract, DReport } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { daysUntil } from '@/lib/dates/days-until'
import { fmtDate } from '@/lib/dates/fmt-date'
import { deadlineOf } from '@/lib/db/deadline-of'
import { isActive } from '@/lib/db/is-active'
import { isLate } from '@/lib/db/is-late'
import { nextStep } from '@/lib/db/next-step'

/* What waits for the village head: late work, unanswered citizen reports, terms due within a week, and the next step of each contract. */
export function desaTodos(contracts: DContract[], unanswered: DReport[]): Todo[] {
  const due = contracts.flatMap((c) => c.terms.filter((t) => !t.paidDate && daysUntil(t.planDate) <= 7 && isActive(c)).map((t) => ({ c, t })))
  return [
    ...contracts.filter((c) => isLate(c)).map((c) => ({ key: `late-${c.code}`, c, text: `Progres terlambat ${-daysUntil(deadlineOf(c))} hari`, tab: 'progres', tone: 'red' as const })),
    ...unanswered.map((x) => {
      const c = contracts.find((k) => k.code === x.contractCode)!
      return { key: `rep-${x.id}`, c, text: `Laporan warga belum ditanggapi: ${x.category.toLowerCase()}`, tab: 'laporan', tone: 'red' as const, when: x.id }
    }),
    ...due.map(({ c, t }) => ({
      key: `term-${c.code}-${t.no}`,
      c,
      text: `${t.label} ${daysUntil(t.planDate) < 0 ? 'lewat jatuh tempo' : 'jatuh tempo'} (${formatRp(t.amount)})`,
      tab: 'termin',
      tone: daysUntil(t.planDate) < 0 ? ('red' as const) : ('blue' as const),
      when: fmtDate(t.planDate),
    })),
    ...contracts.flatMap((c) => {
      const n = nextStep(c)
      return n && n.who === 'perangkat_desa' && n.tab !== 'progres' && n.tab !== 'termin' ? [{ key: `step-${c.code}`, c, text: n.text, tab: n.tab, tone: 'blue' as const }] : []
    }),
  ]
}
