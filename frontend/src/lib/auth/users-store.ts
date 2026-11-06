import { USERS_KEY, seedUsers } from '@/data/auth'
import type { StoredUser } from '@/interfaces/auth'
import { createStore } from '@/lib/store/create-store'

export const users = createStore<StoredUser[]>(USERS_KEY, () => seedUsers)
