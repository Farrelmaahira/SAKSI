import type { DContract } from '@/interfaces/db'
import { db } from '@/lib/db/db'
import { withStatus } from '@/lib/db/with-status'

/* Puts a server contract into the local store. One the browser already has (same apiId) only takes the server's status,
   so drawn signatures, seals and the like that live here are kept; a new one is added, with a different code if a local-only contract already uses it. */
export function upsertContract(c: DContract) {
  db.set((d) => {
    const own = d.contracts.some((x) => x.apiId === c.apiId)
    if (own) return { ...d, contracts: d.contracts.map((x) => (x.apiId === c.apiId && x.status !== c.status ? withStatus(x, c.status, 'Server') : x)) }
    const taken = d.contracts.some((x) => x.code === c.code)
    return { ...d, contracts: [taken ? { ...c, code: `${c.code}-${c.apiId}` } : c, ...d.contracts] }
  })
}
