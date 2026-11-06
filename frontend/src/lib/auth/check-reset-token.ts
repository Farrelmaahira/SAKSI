import type { VerifyEmailResult } from '@/interfaces/auth'
import { readToken } from './read-token'
import { users } from './users-store'

export function checkResetToken(token: string): VerifyEmailResult {
  const { t, error } = readToken(token, 'reset')
  if (!t) return { ok: false, field: 'token', error: error ?? 'Link tidak valid.' }
  const u = users.get().find((x) => x.id === t.userId)
  return u ? { ok: true, email: u.email } : { ok: false, field: 'token', error: 'Akun tidak ditemukan.' }
}
