import { seedCounterparties } from '@/data/master'
import type { Counterparty } from '@/interfaces/master'
import { createStore } from '@/lib/store/create-store'

export const counterpartyStore = createStore<Counterparty[]>('saksi:counterparties', () => seedCounterparties)
