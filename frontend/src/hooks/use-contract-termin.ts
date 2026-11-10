'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ApiResult, ContractTermin } from '@/interfaces/api'
import type { DContract } from '@/interfaces/db'
import { getContractTermin } from '@/lib/api/get-contract-termin'
import { withTermin } from '@/lib/api/with-termin'

/* Server contracts: SPK, terms and progress from GET /contracts/{id}/termin laid over the local copy.
   Local-only contracts (no apiId) come back as they are. result undefined = still loading. */
export function useContractTermin(c: DContract) {
  const [state, setState] = useState<{ id: number; result: ApiResult<ContractTermin> } | null>(null)
  const [tick, setTick] = useState(0)
  const id = c.apiId
  useEffect(() => {
    if (!id) return
    let active = true
    getContractTermin(id).then((r) => {
      if (active) setState({ id, result: r })
    })
    return () => {
      active = false
    }
  }, [id, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  if (!id) return { c, server: false as const, reload }
  const result = state?.id === id ? state.result : undefined
  return { c: result?.ok ? withTermin(c, result.data) : c, server: true as const, result, reload }
}
