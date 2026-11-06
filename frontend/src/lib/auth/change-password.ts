import { roleLabels } from '@/data/auth'
import type { Result } from '@/interfaces/auth'
import { addAudit } from '@/lib/audit/add-audit'
import { checkPassword } from './check-password'
import { getSession } from './get-session'
import { hashPassword } from './hash-password'
import { passwordMatches } from './password-matches'
import { regionOf } from './region-of'
import { updateUser } from './update-user'
import { users } from './users-store'

export async function changePassword(current: string, password: string, confirm: string): Promise<Result> {
  const s = getSession()
  const u = s && users.get().find((x) => x.id === s.userId)
  if (!s || !u) return { ok: false, error: 'Sesi berakhir. Silakan masuk lagi.' }
  if (!(await passwordMatches(u, current))) return { ok: false, field: 'password', error: 'Kata sandi saat ini salah.' }
  const check = checkPassword(password, confirm)
  if (!check.ok) return check
  updateUser(u.id, { passwordHash: await hashPassword(u.email, password) })
  addAudit({ actor: u.name, role: roleLabels[s.role.role], action: 'Mengubah kata sandi', villageId: s.role.villageId, regionId: regionOf(s.role) })
  return { ok: true }
}
