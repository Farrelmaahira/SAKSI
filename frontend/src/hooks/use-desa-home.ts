import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { fetchDashboardMetricsAPI, type DashboardMetricsResponse } from '@/lib/api/contracts'
import { desaSummary } from '@/lib/dash/desa-summary'
import { desaTodos } from '@/lib/dash/desa-todos'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'

/* The village head's home: server metrics when they arrive, local numbers until then, and the to-do list. */
export function useDesaHome() {
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)

  useEffect(() => {
    let active = true
    fetchDashboardMetricsAPI().then((res) => {
      if (active && res) setMetrics(res)
    })
    return () => {
      active = false
    }
  }, [])

  const contracts = scopeContracts(d, role)
  const year = new Date().getFullYear()
  const summary = desaSummary(contracts, scopeReports(d, role), year)

  return { session, role, metrics, year, contracts, ...summary, todos: desaTodos(contracts, summary.unanswered) }
}
