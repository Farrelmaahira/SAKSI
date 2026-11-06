import type { ActionKind } from '@/interfaces/db'
import type { Session } from '@/interfaces/auth'
import { db } from '@/lib/db/db'
import { allReports } from '@/lib/db/all-reports'
import { nextFlow } from '@/lib/db/next-flow'
import { uid } from '@/lib/dates/uid'
import { nowIso } from '@/lib/dates/now-iso'
import { log } from '@/lib/db/log'
import { actionLabels } from '@/data/db'

export function reportAction(id: string, kind: ActionKind, text: string, s: Session) {
  db.set((d) => {
    let reports = d.reports
    if (!reports.some((r) => r.id === id)) {
      const citizen = allReports(d).find((r) => r.id === id)
      if (citizen) reports = [citizen, ...reports]
    }
    return {
      ...d,
      reports: reports.map((r) =>
        r.id === id ? { ...r, flow: nextFlow(r.flow, kind), actions: [...r.actions, { id: uid('ra-'), at: nowIso(), by: s.name, role: s.role.role, kind, text }] } : r,
      ),
    }
  })
  const r = allReports(db.get()).find((x) => x.id === id)
  const c = db.get().contracts.find((x) => x.code === r?.contractCode)
  log(s, `${actionLabels[kind]} pada laporan`, c, id)
}
