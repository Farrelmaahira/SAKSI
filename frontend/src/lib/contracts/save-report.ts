import { REPORT_KEY } from '@/data/storage-keys'
import type { Report } from '@/interfaces/contract'
import { loadReports } from './load-reports'

export function saveReport(code: string, report: Report) {
  const all = loadReports()
  all[code] = [report, ...(all[code] ?? [])]
  localStorage.setItem(REPORT_KEY, JSON.stringify(all))
}
