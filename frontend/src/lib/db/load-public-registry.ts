import type { SealedContract } from '@/interfaces/contract'
import { db } from '@/lib/db/db'
import { allReports } from '@/lib/db/all-reports'
import { loadReports } from '@/lib/contracts/load-reports'
import { isPublic } from '@/lib/db/is-public'
import { toPublic } from '@/lib/db/to-public'
import { loadSimContracts } from '@/lib/contracts/load-sim-contracts'
import { seedContracts } from '@/data/seed-contracts'
import { sha256 } from '@/lib/contracts/sha256'
import { contractText } from '@/lib/contracts/contract-text'

export async function loadPublicRegistry(): Promise<SealedContract[]> {
  const d = db.get()
  const reports = allReports(d)
  const stored = loadReports()
  const published = d.contracts.filter(isPublic).map((c) => toPublic(c, reports))
  const sims = loadSimContracts().map((c) => ({ ...c, reports: [...(stored[c.code] ?? []), ...c.reports] }))
  const list = [...sims, ...published, ...seedContracts.filter((s) => !published.some((p) => p.code === s.code) && !d.contracts.some((x) => x.code === s.code))]
  return Promise.all(list.map(async (c) => ({ ...c, hash: await sha256(contractText(c)) })))
}
