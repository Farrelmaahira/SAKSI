import type { DReport, Db } from '@/interfaces/db'
import { loadReports } from '@/lib/contracts/load-reports'

/* ---------- Reports ---------- */

/* Seed reports that belong to the demo citizen account (older saved data has no owner on them) */
const seedOwners: Record<string, Pick<DReport, 'owner' | 'reporterName'>> = {
  'LPR-2026-0102': { owner: 'warga@saksi.id', reporterName: 'Siti Rahma' },
  'LPR-2026-0087': { owner: 'warga@saksi.id', reporterName: 'Siti Rahma' },
}

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
          owner: r.owner,
          reporterName: r.reporterName,
          photos: r.photos ?? 0,
          flow: 'baru',
          actions: [],
        })
  return [...extra, ...d.reports].map((r) => (r.owner || !seedOwners[r.id] ? r : { ...r, ...seedOwners[r.id] }))
}
