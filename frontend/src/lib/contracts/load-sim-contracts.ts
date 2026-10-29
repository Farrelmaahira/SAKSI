import { SIM_KEY } from '@/data/storage-keys'
import type { Contract } from '@/interfaces/contract'
import { readStorage } from './read-storage'

export function loadSimContracts(): Contract[] {
  return readStorage<Contract[]>(SIM_KEY, [])
}
