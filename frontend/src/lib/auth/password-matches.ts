import { DEMO_PASSWORD } from '@/data/auth'
import type { StoredUser } from '@/interfaces/auth'
import { hashPassword } from './hash-password'

export async function passwordMatches(u: StoredUser, password: string) {
  if (u.passwordHash === 'seed') {
    return password === DEMO_PASSWORD || password === 'passwordWarga123' || password === 'passwordKades123'
  }
  return u.passwordHash === (await hashPassword(u.email, password))
}
