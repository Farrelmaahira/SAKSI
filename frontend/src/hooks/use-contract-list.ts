import { useEffect, useMemo, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import type { KontrakFilter } from '@/interfaces/dash'
import type { DContract } from '@/interfaces/db'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { publicToContract } from '@/lib/contracts/public-to-contract'
import { syncServerContracts } from '@/lib/contracts/sync-server-contracts'
import { uniqueBy } from '@/lib/contracts/unique-by'
import { contractChips } from '@/lib/dash/contract-chips'
import { contractMatches } from '@/lib/dash/contract-matches'
import { db } from '@/lib/db/db'
import { nextStep } from '@/lib/db/next-step'
import { scopeContracts } from '@/lib/db/scope-contracts'

/* The contract list of the dashboard: what this role may see, filtered by chip and search text. */
export function useContractList() {
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [published, setPublished] = useState<DContract[] | null>(null)
  const [filter, setFilter] = useState<KontrakFilter>('semua')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    if (role.role === 'warga') {
      listPublicContracts().then((r) => {
        if (active && r.ok && r.data.length > 0) setPublished(uniqueBy(r.data, (c) => c.id).map((c) => publicToContract(c)))
      })
    } else {
      // the server's own list: contracts this browser does not have yet are loaded into the store, known ones take the server's status
      void syncServerContracts(role)
    }
    return () => {
      active = false
    }
  }, [role])

  const local = scopeContracts(d, role)
  const all = useMemo(() => {
    if (!published || published.length === 0) return local
    // server contracts first, then the local ones the server does not list
    const codes = new Set(published.map((c) => c.code.toLowerCase()))
    return [...published, ...local.filter((c) => !codes.has(c.code.toLowerCase()))]
  }, [published, local])

  const needsMe = (c: DContract) => nextStep(c)?.who === role.role && (role.role === 'pihak_kedua' || nextStep(c)?.tab !== 'progres')
  const isDesa = role.role === 'perangkat_desa'

  return {
    role: role.role,
    isDesa,
    all,
    list: all.filter((c) => contractMatches(c, filter, query, needsMe)),
    chips: contractChips(all, needsMe, isDesa),
    filter,
    setFilter,
    query,
    setQuery,
    needsMe,
  }
}
