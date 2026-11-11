import type { Result } from '@/interfaces/auth'
import { getSession } from './get-session'
import { setSession } from './set-session'
import { updateUser } from './update-user'

export function updateName(name: string): Result {
  const s = getSession()
  const clean = name.trim().replace(/\s+/g, ' ')
  if (!s) return { ok: false, error: 'Sesi berakhir. Silakan masuk lagi.' }
  if (clean.length < 3) return { ok: false, field: 'name', error: 'Nama minimal 3 huruf.' }
  updateUser(s.userId, { name: clean })
  setSession({ ...s, name: clean })
  return { ok: true }
}
