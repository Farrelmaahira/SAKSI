import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { useServerContract } from '@/hooks/use-server-contract'
import type { DContract } from '@/interfaces/db'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { publicToContract } from '@/lib/contracts/public-to-contract'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'

/* The contract of the /kontrak/[code] page: found locally, loaded from the server, or (for citizens) taken from the public list. */
export function useContractLookup() {
  const { code = '' } = useParams<{ code: string }>()
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [published, setPublished] = useState<DContract | null>(null)
  // links from the API (notifications, termin) use the server id instead of the local code
  const local = scopeContracts(d, role).find((x) => x.code === code || String(x.apiId) === code)

  useEffect(() => {
    if (role.role !== 'warga' || local) return
    let active = true
    listPublicContracts().then((r) => {
      const found = r.ok ? r.data.find((x) => x.nomor === code || String(x.id) === code) : undefined
      if (active && found) setPublished(publicToContract(found, false))
    })
    return () => {
      active = false
    }
  }, [code, local, role])

  const c = local || published
  const loading = useServerContract(code, role, !c && role.role !== 'warga')
  return { code, c, loading, session }
}
