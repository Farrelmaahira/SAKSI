import type { Db } from '@/interfaces/db'
import type { UserRole } from '@/interfaces/auth'
import { regionOfContract } from '@/lib/db/region-of-contract'

/* ---------- Scope per role ---------- */

export function scopeContracts(d: Db, r: UserRole) {
  return d.contracts.filter((c) => {
    if (r.role === 'perangkat_desa') return c.villageId === r.villageId
    if (r.role === 'bpd') return c.villageId === r.villageId && c.status !== 'draf' && c.status !== 'diaudit'
    if (r.role === 'inspektorat') return regionOfContract(c) === r.regionId && c.status !== 'draf' && c.status !== 'diaudit'
    return c.counterpartyId === r.counterpartyId && c.status !== 'draf' && c.status !== 'diaudit'
  })
}
