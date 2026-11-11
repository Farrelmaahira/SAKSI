import type { Db } from '@/interfaces/db'
import type { UserRole } from '@/interfaces/auth'
import { regionOfContract } from '@/lib/db/region-of-contract'

/* ---------- Scope per role ---------- */

export function scopeContracts(d: Db, r: UserRole) {
  // a draft that was cancelled was never sent to anyone but the village
  const sent = (c: Db['contracts'][number]) => c.status !== 'draf' && c.status !== 'diaudit' && c.status !== 'dibatalkan'
  return d.contracts.filter((c) => {
    if (r.role === 'perangkat_desa') return c.villageId === r.villageId
    if (r.role === 'warga') return c.villageId === r.villageId && (c.status === 'dipublikasikan' || c.status === 'berjalan' || c.status === 'selesai')
    if (r.role === 'bpd') return c.villageId === r.villageId && sent(c)
    if (r.role === 'inspektorat') return regionOfContract(c) === r.regionId && sent(c)
    return c.counterpartyId === r.counterpartyId && sent(c)
  })
}
