import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import { updateMe } from '@/lib/api/update-me'
import { apiUserId } from '@/lib/auth/api-user-id'
import { updateName } from '@/lib/auth/update-name'

export interface FormMessage {
  ok: boolean
  text: string
}

/* Changing the display name: server accounts save to PUT /auth/me first, and the local session follows a confirmed save. */
export function useProfileName(session: Session) {
  const [name, setName] = useState(session.name)
  const [msg, setMsg] = useState<FormMessage | null>(null)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (apiUserId(session.userId) > 0) {
      const clean = name.trim().replace(/\s+/g, ' ')
      if (clean.length < 3) return setMsg({ ok: false, text: 'Nama minimal 3 huruf.' })
      setBusy(true)
      const res = await updateMe({ nama: clean })
      setBusy(false)
      if (!res.ok) return setMsg({ ok: false, text: res.error })
    }
    const r = updateName(name)
    setMsg(r.ok ? { ok: true, text: 'Nama tersimpan.' } : { ok: false, text: r.error })
  }

  return { name, setName, msg, busy, save, unchanged: name.trim() === session.name }
}
