import { counterpartyStore } from './counterparty-store'

export const counterpartyById = (id?: string | number) => {
  if (id === undefined || id === null || id === '') return undefined
  const strId = String(id)
  return counterpartyStore.get().find((c) => String(c.id) === strId)
}
