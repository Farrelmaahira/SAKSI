import type { UserRole } from '@/interfaces/auth'
import { fetchContractsAPI } from '@/lib/api/contracts'
import { loadContract } from '@/lib/api/load-contract'
import { toContractStatus } from '@/lib/contracts/to-contract-status'
import { uniqueBy } from '@/lib/contracts/unique-by'
import { db } from '@/lib/db/db'
import { upsertContract } from '@/lib/db/upsert-contract'
import { withStatus } from '@/lib/db/with-status'

/* Brings the contracts the server lists for this user into the local store: unknown ones are loaded in full, known ones take the server's status. */
export async function syncServerContracts(role: UserRole): Promise<void> {
  const list = uniqueBy(await fetchContractsAPI(), (c) => c.id)
  const known = new Map(db.get().contracts.filter((c) => c.apiId).map((c) => [c.apiId, c]))
  const loaded = await Promise.all(list.filter((c) => !known.has(Number(c.id))).map((c) => loadContract(Number(c.id), role, c.contractNumber)))
  loaded.forEach((c) => c && upsertContract(c))
  const status = new Map(list.map((c) => [Number(c.id), toContractStatus(c.status)]))
  db.set((d) => ({ ...d, contracts: d.contracts.map((c) => (c.apiId && status.has(c.apiId) && status.get(c.apiId) !== c.status ? withStatus(c, status.get(c.apiId)!, 'Server') : c)) }))
}
