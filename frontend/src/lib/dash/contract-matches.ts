import type { KontrakFilter } from '@/interfaces/dash'
import type { DContract } from '@/interfaces/db'
import { groupOf } from '@/lib/dash/group-of'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'

/* Does the contract belong under the chosen chip and contain the search text (code, title, party or village)? */
export function contractMatches(c: DContract, filter: KontrakFilter, query: string, needsMe: (c: DContract) => boolean): boolean {
  if (filter === 'tindakan' && !needsMe(c)) return false
  if (filter !== 'semua' && filter !== 'tindakan' && groupOf(c) !== filter) return false
  const t = query.trim().toLowerCase()
  return !t || [c.code, c.title, counterpartyById(c.counterpartyId)?.name, villageById(c.villageId)?.name].some((v) => v?.toLowerCase().includes(t))
}
