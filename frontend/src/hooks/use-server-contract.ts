import { useEffect, useState } from 'react'
import type { UserRole } from '@/interfaces/auth'
import { fetchContractsAPI } from '@/lib/api/contracts'
import { loadContract } from '@/lib/api/load-contract'
import { upsertContract } from '@/lib/db/upsert-contract'

/* The id behind a route code: the server id itself (links from notifications), or the number of a listed contract. */
async function serverId(code: string): Promise<number | null> {
  if (/^\d+$/.test(code)) return Number(code)
  const hit = (await fetchContractsAPI()).find((c) => c.contractNumber === code)
  return hit ? Number(hit.id) : null
}

/* Loads a contract the browser does not have yet from the server into the local store. True while that is still going on. */
export function useServerContract(code: string, role: UserRole, enabled: boolean): boolean {
  const [finished, setFinished] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) return
    let live = true
    serverId(code)
      .then((id) => (id === null ? null : loadContract(id, role, /^\d+$/.test(code) ? undefined : code)))
      .then((c) => {
        if (!live) return
        if (c) upsertContract(c)
        setFinished(code)
      })
    return () => {
      live = false
    }
  }, [code, role, enabled])
  return enabled && finished !== code
}
