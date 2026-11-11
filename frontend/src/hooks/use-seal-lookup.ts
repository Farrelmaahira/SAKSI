import { useEffect, useState } from 'react'
import { verifySeal } from '@/lib/api/verify-seal'

/* A full SHA-256 typed as the query is looked up on the server (GET /public/seals/verify). */
export function useSealLookup(query: string) {
  const q = query.trim()
  const isHash = /^[0-9a-f]{64}$/i.test(q)
  const [hit, setHit] = useState<{ hash: string; id?: number } | null>(null)

  useEffect(() => {
    if (!isHash) return
    let active = true
    verifySeal(q).then((r) => {
      if (active) setHit({ hash: q, id: r.ok && r.data.cocok ? r.data.kontrak?.id : undefined })
    })
    return () => {
      active = false
    }
  }, [isHash, q])

  const pending = isHash && hit?.hash !== q
  return { isHash, pending, contractId: isHash && !pending ? hit?.id : undefined }
}
