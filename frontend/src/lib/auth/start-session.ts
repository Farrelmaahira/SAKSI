import type { StoredUser, UserRole } from '@/interfaces/auth'
import { setSession } from './set-session'

export function startSession(u: StoredUser, role: UserRole) {
  setSession({ userId: u.id, name: u.name, email: u.email, role, roles: u.roles })
  if (role.role === 'warga') return
}
