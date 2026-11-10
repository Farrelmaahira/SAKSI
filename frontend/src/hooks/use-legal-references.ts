import { useEffect, useState } from 'react'
import type { ApiResult, LegalReference } from '@/interfaces/api'
import { fetchDraftOptions } from '@/lib/api/fetch-draft-options'

/* Legal references for one contract type; null while loading. */
export function useLegalReferences(jenis: string): ApiResult<LegalReference[]> | null {
  const [state, setState] = useState<{ jenis: string; result: ApiResult<LegalReference[]> } | null>(null)
  useEffect(() => {
    let active = true
    fetchDraftOptions(jenis).then((r) => {
      if (!active) return
      const result: ApiResult<LegalReference[]> = !r.ok
        ? r
        : r.data.legalReferences
          ? { ok: true, data: r.data.legalReferences }
          : { ok: false, status: 200, error: 'Server belum mengirim daftar dasar hukum.' }
      setState({ jenis, result })
    })
    return () => {
      active = false
    }
  }, [jenis])
  return state?.jenis === jenis ? state.result : null
}
