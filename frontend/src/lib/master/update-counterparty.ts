import type { Counterparty } from '@/interfaces/master'
import { counterpartyStore } from './counterparty-store'

export function updateCounterparty(id: string, patch: Partial<Counterparty>) {
  counterpartyStore.set((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
}
