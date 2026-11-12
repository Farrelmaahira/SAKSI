import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { DContract, Spk } from '@/interfaces/db'
import { setSpk } from '@/lib/api/set-spk'
import { validateSpk } from '@/lib/dash/validate-spk'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { deadlineOf } from '@/lib/db/deadline-of'
import { saveSpk } from '@/lib/db/save-spk'

/* The SPK form: a suggested number and dates for a new SPK, or the current one for a change. */
export function useSpkForm(c: DContract, session: Session, reload: () => void) {
  const [form, setForm] = useState<Spk>(c.spk ?? { number: `SPK/${c.code.slice(-3)}/${new Date().getFullYear()}`, date: daysFromNow(0), start: daysFromNow(1), end: deadlineOf(c) })
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const problem = validateSpk(form)
    if (problem) return setError(problem)
    if (c.apiId) {
      setBusy(true)
      setServerError('')
      const r = await setSpk(c.apiId, { nomor: form.number.trim(), tanggal: form.date, mulai: form.start, selesai: form.end })
      setBusy(false)
      if (!r.ok) return setServerError(r.error)
      reload()
    } else saveSpk(c.code, { ...form, number: form.number.trim() }, session)
    setEditing(false)
    setError('')
  }

  const edit = () => {
    if (c.spk) setForm(c.spk)
    setEditing(true)
  }

  return { form, set: (patch: Partial<Spk>) => setForm((f) => ({ ...f, ...patch })), editing, edit, cancel: () => setEditing(false), error, serverError, busy, save }
}
