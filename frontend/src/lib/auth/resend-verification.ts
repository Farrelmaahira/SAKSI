import { findUser } from './find-user'
import { issueToken } from './issue-token'

export function resendVerification(email: string) {
  const u = findUser(email)
  return u && u.status === 'menunggu_verifikasi' ? issueToken(u.id, 'verifikasi', 24 * 60) : null
}
