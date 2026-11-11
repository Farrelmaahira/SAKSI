import { useEffect, useState } from 'react'
import type { ApiResult } from '@/interfaces/api'
import type { RoleKey } from '@/interfaces/auth'
import type { DContract, DReport } from '@/interfaces/db'
import { listContractReports } from '@/lib/api/list-contract-reports'
import { listReports } from '@/lib/api/list-reports'
import { toDReport } from '@/lib/api/to-dreport'
import { allReports } from '@/lib/db/all-reports'
import { db } from '@/lib/db/db'

/* Reports of one contract: from the server when it has an id there, from this device otherwise. */
export function useContractReports(c: DContract, role: RoleKey) {
  const d = db.use()
  const [server, setServer] = useState<{ id: number; result: ApiResult<DReport[]> } | null>(null)
  const [reload, setReload] = useState(0)

  // officials get every report on the contract, a citizen only their own (GET /reports is scoped by role)
  useEffect(() => {
    const id = c.apiId
    if (!id) return
    let active = true
    ;(role === 'warga' ? listReports(id) : listContractReports(id)).then((r) => {
      if (active) setServer({ id, result: r.ok ? { ok: true, data: r.data.map((x) => toDReport(x, c.code)) } : r })
    })
    return () => {
      active = false
    }
  }, [c.apiId, c.code, role, reload])

  // contracts that exist only on this device (demo seed) keep their local reports
  const result: ApiResult<DReport[]> | null = c.apiId ? (server?.id === c.apiId ? server.result : null) : { ok: true, data: allReports(d).filter((r) => r.contractCode === c.code) }
  // the server already scopes reports per role; the local demo shows Inspektorat only escalated ones
  const local = !c.apiId
  const visible = result?.ok ? (role === 'inspektorat' && local ? result.data.filter((r) => r.actions.some((a) => a.kind === 'eskalasi')) : result.data) : []

  return { result, visible, refresh: () => setReload((n) => n + 1) }
}
