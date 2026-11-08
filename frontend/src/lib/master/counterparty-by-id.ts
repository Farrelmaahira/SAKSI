import { counterpartyStore } from './counterparty-store'

export const counterpartyById = (id?: string) => counterpartyStore.get().find((c) => c.id === id)
