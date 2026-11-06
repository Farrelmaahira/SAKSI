import type { UserRole } from '@/interfaces/auth'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { regionById } from '@/lib/master/region-by-id'
import { villageById } from '@/lib/master/village-by-id'

export function wilayahLabel(r: UserRole) {
  if (r.role === 'pihak_kedua') return counterpartyById(r.counterpartyId)?.name ?? 'Pihak kedua'
  if (r.role === 'inspektorat') return regionById(r.regionId)?.name ?? '–'
  return villageById(r.villageId)?.name ?? '–'
}
