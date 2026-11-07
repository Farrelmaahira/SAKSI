import { USERS_KEY, seedUsers } from '@/data/auth'
import type { StoredUser } from '@/interfaces/auth'
import { createStore } from '@/lib/store/create-store'

export const users = createStore<StoredUser[]>(USERS_KEY, () => seedUsers)

/* Browsers that saved the user list before a demo account existed get that account added */
export function ensureSeedUsers() {
  const missing = seedUsers.filter((s) => !users.get().some((u) => u.id === s.id))
  if (missing.length) users.set((all) => [...all, ...missing])
}
