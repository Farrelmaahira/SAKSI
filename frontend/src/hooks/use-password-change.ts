import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import { changePassword as changePasswordApi } from '@/lib/api/change-password'
import { apiUserId } from '@/lib/auth/api-user-id'
import { changePassword } from '@/lib/auth/change-password'
import { checkPassword } from '@/lib/auth/check-password'
import type { FormMessage } from '@/hooks/use-profile-name'

const BLANK = { current: '', next: '', confirm: '' }

/* Changing the password: server accounts use POST /auth/password/change, others the local check. */
export function usePasswordChange(session: Session) {
  const [pw, setPw] = useState(BLANK)
  const [msg, setMsg] = useState<FormMessage | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    let r: { ok: true } | { ok: false; error: string }
    if (apiUserId(session.userId) > 0) {
      const check = checkPassword(pw.next, pw.confirm)
      const res = check.ok ? await changePasswordApi(pw.current, pw.next) : null
      r = !check.ok ? check : res!.ok ? { ok: true } : { ok: false, error: res!.code === 'WRONG_PASSWORD' ? 'Kata sandi saat ini salah.' : res!.error }
    } else r = await changePassword(pw.current, pw.next, pw.confirm)
    setBusy(false)
    if (r.ok) setPw(BLANK)
    setMsg(r.ok ? { ok: true, text: 'Kata sandi diperbarui.' } : { ok: false, text: r.error })
  }

  return { pw, set: (patch: Partial<typeof BLANK>) => setPw((p) => ({ ...p, ...patch })), msg, busy, save }
}
