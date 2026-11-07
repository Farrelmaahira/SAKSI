import type { Result } from '@/interfaces/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { checkPassword } from './check-password'
import { hashPassword } from './hash-password'
import { markUsed } from './mark-used'
import { readToken } from './read-token'
import { updateUser } from './update-user'
import { users } from './users-store'

export async function resetPassword(token: string, password: string, confirm: string): Promise<Result> {
  const { t, error } = readToken(token, 'reset')
  if (!t) return { ok: false, field: 'token', error: error ?? 'Link tidak valid.' }
  const check = checkPassword(password, confirm)
  if (!check.ok) return check
  const u = users.get().find((x) => x.id === t.userId)
  if (!u) return { ok: false, field: 'token', error: 'Akun tidak ditemukan.' }
  updateUser(u.id, {
    passwordHash: await hashPassword(u.email, password),
    failedAttempts: 0,
    lockedUntil: undefined,
    status: u.status === 'dikunci' ? 'aktif' : u.status,
  })
  markUsed(token)
  addAudit({ actor: u.name, role: 'Sistem', action: 'Mengubah kata sandi' })
  return { ok: true }
}
