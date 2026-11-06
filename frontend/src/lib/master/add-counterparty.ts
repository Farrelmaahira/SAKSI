import type { Counterparty } from '@/interfaces/master'
import { uid } from '@/lib/dates/uid'
import { counterpartyStore } from './counterparty-store'

export function addCounterparty(c: Omit<Counterparty, 'id'>): Counterparty {
  const created = { ...c, id: uid('cp-') }
  counterpartyStore.set((list) => [...list, created])
  return created
}
