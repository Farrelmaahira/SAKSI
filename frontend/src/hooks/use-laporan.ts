import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import type { ApiResult } from '@/interfaces/api'
import type { LaporanFilter } from '@/interfaces/dash'
import type { DReport } from '@/interfaces/db'
import { listReports } from '@/lib/api/list-reports'
import { toDReport } from '@/lib/api/to-dreport'
import type { CreatedReportResponse } from '@/lib/api/reports'
import { reportInProgress } from '@/lib/dash/report-in-progress'
import { reportMatches } from '@/lib/dash/report-matches'
import { reportNeedsMe } from '@/lib/dash/report-needs-me'
import { db } from '@/lib/db/db'
import { isClosed } from '@/lib/db/is-closed'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'

/* Citizen reports an official can act on: server reports plus local demo ones, filtered and counted. */
export function useLaporan() {
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [filter, setFilter] = useState<LaporanFilter>('perlu')
  const [query, setQuery] = useState('')
  const [server, setServer] = useState<ApiResult<CreatedReportResponse[]> | null>(null)
  const [reload, setReload] = useState(0)
  const official = role.role === 'perangkat_desa' || role.role === 'bpd' || role.role === 'inspektorat'

  useEffect(() => {
    if (!official) return
    let active = true
    listReports().then((x) => active && setServer(x))
    return () => {
      active = false
    }
  }, [official, reload])

  const contracts = scopeContracts(d, role)
  // server reports, plus local demo reports on contracts that only exist on this device
  const reports: DReport[] = [
    ...(server?.ok ? server.data.map((x) => toDReport(x, contracts.find((c) => c.apiId === x.contractId)?.code)) : []),
    ...scopeReports(d, role).filter((x) => !contracts.find((c) => c.code === x.contractCode)?.apiId),
  ]
  const needsMe = (x: DReport) => reportNeedsMe(x, role.role)

  return {
    session,
    role: role.role,
    server,
    contracts,
    filter,
    setFilter,
    query,
    setQuery,
    list: reports.filter((x) => reportMatches(x, filter, query, needsMe)),
    counts: { perlu: reports.filter(needsMe).length, semua: reports.length, proses: reports.filter(reportInProgress).length, selesai: reports.filter(isClosed).length },
    refresh: () => setReload((n) => n + 1),
  }
}
