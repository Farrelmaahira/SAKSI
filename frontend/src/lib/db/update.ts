import type { DContract } from '@/interfaces/db'
import { db } from '@/lib/db/db'

export function update(code: string, fn: (c: DContract) => DContract) {
  db.set((d) => ({ ...d, contracts: d.contracts.map((c) => (c.code === code ? fn(c) : c)) }))
}
