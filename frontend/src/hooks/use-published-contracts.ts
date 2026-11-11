import { useEffect, useState } from 'react'
import type { SealedContract } from '@/interfaces/contract'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { toSealedContract } from '@/lib/api/to-sealed-contract'

/* Published contracts of the public registry; registry stays null while loading or after an error. */
export function usePublishedContracts() {
  const [registry, setRegistry] = useState<SealedContract[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    listPublicContracts().then((r) => {
      if (!active) return
      if (r.ok) setRegistry(r.data.map(toSealedContract))
      // the API needs a signed-in account, even for the public registry
      else setError(r.status === 401 ? 'Masuk dengan akun SAKSI untuk melihat kontrak desa.' : r.error)
    })
    return () => {
      active = false
    }
  }, [])
  return { registry, error, loading: registry === null && !error }
}
