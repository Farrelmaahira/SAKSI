import { fetchCounterparties } from '@/lib/api/contracts'

/* The id of the business that belongs to this user account (a second party's own usaha), or undefined when the server lists none for them. */
export async function ownCounterpartyId(userId: number): Promise<string | undefined> {
  const mine = (await fetchCounterparties()).find((c) => c.userId === userId)
  return mine ? String(mine.id) : undefined
}
