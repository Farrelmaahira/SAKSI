import type { DReport, Db } from '@/interfaces/db'
import { loadReports } from '@/lib/contracts/load-reports'

/* ---------- Reports ---------- */

/* Citizen reports sent from the public portal live in their own key; merge them in as "baru" */
export function allReports(d: Db): DReport[] {
  const stored = loadReports()
  const extra: DReport[] = []
  for (const [code, list] of Object.entries(stored))
    for (const r of list)
      if (!d.reports.some((x) => x.id === r.id))
        extra.push({
          id: r.id,
          contractCode: code,
          category: r.category,
          clause: r.clause,
          text: r.text,
          location: r.location,
          date: r.date,
          reporter: r.reporter,
          photos: r.photos ?? 0,
          flow: 'baru',
          actions: [],
        })
  return [...extra, ...d.reports]
}
