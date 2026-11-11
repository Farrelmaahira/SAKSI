import type { LaporanFilter } from '@/interfaces/dash'
import type { DReport } from '@/interfaces/db'
import { isClosed } from '@/lib/db/is-closed'
import { reportInProgress } from '@/lib/dash/report-in-progress'

/* Does the report belong under the chosen filter and contain the search text? */
export function reportMatches(x: DReport, filter: LaporanFilter, query: string, needsMe: (x: DReport) => boolean): boolean {
  if (filter === 'perlu' && !needsMe(x)) return false
  if (filter === 'proses' && !reportInProgress(x)) return false
  if (filter === 'selesai' && !isClosed(x)) return false
  const t = query.trim().toLowerCase()
  return !t || [x.id, x.contractCode, x.category, x.text, x.location].some((v) => v?.toLowerCase().includes(t))
}
