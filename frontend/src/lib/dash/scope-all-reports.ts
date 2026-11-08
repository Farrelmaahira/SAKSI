import { db } from '@/lib/db/db'
import { scopeReports } from '@/lib/db/scope-reports'

/* All reports of one village (not only escalated ones), used for risk and village summaries */

export function scopeAllReports(d: ReturnType<typeof db.get>, villageId: string) {
  return scopeReports(d, { id: 'tmp', role: 'bpd', title: '', villageId })
}
