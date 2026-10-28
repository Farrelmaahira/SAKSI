import { seedContracts } from '@/data/seed-contracts'
import type { SealedContract } from '@/interfaces/contract'
import { contractText } from './contract-text'
import { loadReports } from './load-reports'
import { loadSimContracts } from './load-sim-contracts'
import { sha256 } from './sha256'

/* Registry = seed data + contracts published from the simulation, each sealed with its real hash. */
export async function loadRegistry(): Promise<SealedContract[]> {
  const extra = loadReports()
  const all = [...loadSimContracts(), ...seedContracts]
  return Promise.all(
    all.map(async (c) => ({ ...c, reports: [...(extra[c.code] ?? []), ...c.reports], hash: await sha256(contractText(c)) })),
  )
}
