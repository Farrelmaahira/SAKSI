import type { AuditLog } from '@/interfaces/audit'
import type { UserRole } from '@/interfaces/auth'
import type { Db } from '@/interfaces/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { villageById } from '@/lib/master/village-by-id'

/* Jejak audit visible to a role: its village, its regency, or its own contracts */
export function scopeLogs(logs: AuditLog[], r: UserRole, d: Db, actorName?: string) {
  const codes = new Set(scopeContracts(d, r).map((c) => c.code))
  return logs.filter((l) => {
    if (r.role === 'pihak_kedua') return Boolean(l.contractCode && codes.has(l.contractCode)) || l.actor === actorName
    if (r.role === 'inspektorat') return l.regionId === r.regionId || villageById(l.villageId)?.regionId === r.regionId
    return l.villageId === r.villageId || Boolean(l.contractCode && codes.has(l.contractCode))
  })
}
