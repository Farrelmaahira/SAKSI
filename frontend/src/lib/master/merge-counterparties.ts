import type { CounterpartyResponse } from '@/lib/api/contracts'
import type { Counterparty } from '@/interfaces/master'
import { toCounterparty } from '@/lib/master/to-counterparty'

/* Backend rows come first; local seeds stay only when the backend has no row with the same id. */
export function mergeCounterparties(local: Counterparty[], api: CounterpartyResponse[]): Counterparty[] {
  const apiIds = new Set(api.map((c) => String(c.id)))
  return [...api.map(toCounterparty), ...local.filter((c) => !apiIds.has(c.id))]
}
