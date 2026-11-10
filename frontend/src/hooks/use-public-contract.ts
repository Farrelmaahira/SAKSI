'use client'

import { useEffect, useState } from 'react'
import type { ApiResult } from '@/interfaces/api'
import type { SealedContract } from '@/interfaces/contract'
import { getPublicContract } from '@/lib/api/get-public-contract'
import { toSealedContract } from '@/lib/api/to-sealed-contract'

/* Full published contract (clauses, hash) for one server id. undefined = no id, or still loading. */
export function usePublicContract(id?: number): ApiResult<SealedContract> | undefined {
  const [state, setState] = useState<{ id?: number; result?: ApiResult<SealedContract> }>({})
  useEffect(() => {
    if (!id) return
    let active = true
    getPublicContract(id).then((r) => {
      if (active) setState({ id, result: r.ok ? { ok: true, data: toSealedContract(r.data) } : r })
    })
    return () => {
      active = false
    }
  }, [id])
  return id && state.id === id ? state.result : undefined
}
