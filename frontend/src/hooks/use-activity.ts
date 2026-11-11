import { useEffect, useState } from 'react'
import type { ActivityItem } from '@/interfaces/activity'
import { listAuditLogs } from '@/lib/api/list-audit-logs'
import { toActivity } from '@/lib/api/to-activity'

/* Latest audit-log lines from the server, newest first; optionally only those of one contract. */
export function useActivity(limit: number, contractId?: number) {
  const [state, setState] = useState<{ key: string; items: ActivityItem[]; error: string } | null>(null)
  const key = `${limit}|${contractId ?? ''}`

  useEffect(() => {
    let active = true
    listAuditLogs({ limit, contractId }).then((r) => {
      if (active) setState({ key, items: r.ok ? (r.data.items ?? []).map(toActivity) : [], error: r.ok ? '' : r.error })
    })
    return () => {
      active = false
    }
  }, [key, limit, contractId])

  const current = state?.key === key ? state : null
  return { items: current?.items ?? [], error: current?.error ?? '', loading: !current }
}
