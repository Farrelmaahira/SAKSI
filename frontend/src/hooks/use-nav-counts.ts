'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { Db, DReport } from '@/interfaces/db'
import type { NavCounts } from '@/interfaces/dash'
import { listReports } from '@/lib/api/list-reports'
import { toDReport } from '@/lib/api/to-dreport'
import { navCounts } from '@/lib/dash/nav-counts'
import { isClosed } from '@/lib/db/is-closed'
import { desaAnswered } from '@/lib/db/desa-answered'

/* Sidebar badges: the report badge counts server reports (GET /reports, scoped by role) and refreshes on navigation; contracts stay local. */
export function useNavCounts(data: Db, session: Session, path: string): NavCounts {
  const [reports, setReports] = useState<{ user: string; list: DReport[] } | null>(null)
  const role = session.role.role
  const user = session.userId

  useEffect(() => {
    if (role === 'pihak_kedua' || role === 'admin_daerah') return
    let active = true
    listReports().then((r) => {
      if (active && r.ok) setReports({ user, list: r.data.map((x) => toDReport(x)) })
    })
    return () => {
      active = false
    }
  }, [role, user, path])

  const local = navCounts(data, session)
  const list = reports?.user === user ? reports.list : null
  if (!list) return local
  const waiting = list.filter((x) =>
    role === 'warga' ? !isClosed(x) : role === 'perangkat_desa' ? !isClosed(x) && !desaAnswered(x) : role === 'bpd' ? x.flow === 'baru' : x.flow === 'diteruskan',
  )
  return { ...local, reports: waiting.length }
}
