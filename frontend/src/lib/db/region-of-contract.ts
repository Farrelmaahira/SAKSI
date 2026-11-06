import type { DContract } from '@/interfaces/db'
import { villageById } from '@/lib/master/village-by-id'

export const regionOfContract = (c: DContract) => villageById(c.villageId)?.regionId
