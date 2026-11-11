import { useEffect, useState } from 'react'
import type { ApiResult, ContractAudit } from '@/interfaces/api'
import { auditContract } from '@/lib/api/audit-contract'
import { fetchLatestAudit } from '@/lib/api/fetch-latest-audit'

/* The server-side audit of a contract: loads the latest one, and runs a new one on request. */
export function useServerAudit(apiId?: number) {
  // null = not loaded yet; ok with data null = the server has no audit for this contract yet
  const [audit, setAudit] = useState<ApiResult<ContractAudit | null> | null>(null)
  const [auditing, setAuditing] = useState(false)

  // a failed load is retried as a load (GET), never as a new audit (POST)
  const [loadFailed, setLoadFailed] = useState(false)
  const load = async () => {
    if (!apiId) return
    const r = await fetchLatestAudit(apiId)
    setAudit(r)
    setLoadFailed(!r.ok)
  }

  useEffect(() => {
    if (!apiId) return
    let active = true
    fetchLatestAudit(apiId).then((r) => {
      if (!active) return
      setAudit(r)
      setLoadFailed(!r.ok)
    })
    return () => {
      active = false
    }
  }, [apiId])

  const run = async () => {
    if (!apiId) return
    setAuditing(true)
    const r = await auditContract(apiId)
    setAudit(r)
    setLoadFailed(false)
    setAuditing(false)
  }

  return { audit, auditing, run, retry: loadFailed ? load : run, clear: () => setAudit({ ok: true, data: null }) }
}
