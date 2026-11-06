import { addAudit } from '@/lib/audit/add-audit'
import { findUser } from './find-user'
import { issueToken } from './issue-token'

export function requestPasswordReset(email: string): { token: string | null } {
  const u = findUser(email)
  if (!u) return { token: null }
  addAudit({ actor: u.name, role: 'Sistem', action: 'Meminta atur ulang kata sandi' })
  return { token: issueToken(u.id, 'reset', 30) }
}
