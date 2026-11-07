import type { Db } from '@/interfaces/db'
import type { UserRole } from '@/interfaces/auth'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { allReports } from '@/lib/db/all-reports'

export function scopeReports(d: Db, r: UserRole) {
  const codes = new Set(scopeContracts(d, r).map((c) => c.code))
  const list = allReports(d).filter((x) => codes.has(x.contractCode))
  return r.role === 'inspektorat' ? list.filter((x) => x.actions.some((a) => a.kind === 'eskalasi')) : list
}
