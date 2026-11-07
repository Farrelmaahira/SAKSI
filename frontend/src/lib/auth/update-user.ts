import type { StoredUser } from '@/interfaces/auth'
import { users } from './users-store'

export const updateUser = (id: string, patch: Partial<StoredUser>) => users.set((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)))
