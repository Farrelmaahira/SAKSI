import { SIM_KEY } from '@/data/storage-keys'
import type { Contract } from '@/interfaces/contract'
import { loadSimContracts } from './load-sim-contracts'

export function saveSimContract(c: Contract) {
  const list = loadSimContracts().filter((x) => x.code !== c.code)
  localStorage.setItem(SIM_KEY, JSON.stringify([c, ...list].slice(0, 5)))
}
