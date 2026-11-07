import type { UserRole } from '@/interfaces/auth'
import { villageById } from '@/lib/master/village-by-id'

export const regionOf = (r: UserRole) => r.regionId ?? villageById(r.villageId)?.regionId
