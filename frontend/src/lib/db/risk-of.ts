import type { DContract, DReport } from '@/interfaces/db'
import { isLate } from '@/lib/db/is-late'
import { daysUntil } from '@/lib/dates/days-until'
import { deadlineOf } from '@/lib/db/deadline-of'
import { isClosed } from '@/lib/db/is-closed'
import { paidOf } from '@/lib/db/paid-of'
import { valueOf } from '@/lib/db/value-of'
import { progressOf } from '@/lib/db/progress-of'

/* Simple, explainable risk score used by the Inspektorat dashboard */
export function riskOf(c: DContract, reports: DReport[]) {
  const reasons: string[] = []
  let score = 0
  if (isLate(c)) {
    score += 3
    reasons.push(`Terlambat ${-daysUntil(deadlineOf(c))} hari`)
  }
  const open = reports.filter((r) => r.contractCode === c.code && !isClosed(r)).length
  if (open) {
    score += open
    reasons.push(`${open} laporan terbuka`)
  }
  const paidPct = Math.round((paidOf(c) / Math.max(1, valueOf(c))) * 100)
  const gap = paidPct - progressOf(c)
  if (gap > 10) {
    score += 2
    reasons.push(`Dibayar ${paidPct}%, progres ${progressOf(c)}%`)
  }
  if (c.versions.length > 1) {
    score += 1
    reasons.push(`${c.versions.length} versi`)
  }
  return { score, reasons, paidPct, gap }
}
