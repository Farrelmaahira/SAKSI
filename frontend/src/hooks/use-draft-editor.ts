import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import type { Clause } from '@/interfaces/drafting'
import { saveClauses } from '@/lib/api/save-clauses'
import { clauseError } from '@/lib/drafting/clause-error'
import { latestVersion } from '@/lib/db/latest-version'
import { saveDraft } from '@/lib/db/save-draft'

/* Version being read and the edit session of a contract's clauses; `onSaved` runs after a successful save. */
export function useDraftEditor(c: DContract, session: Session, onSaved: () => void) {
  const latest = latestVersion(c)
  const [verNo, setVerNo] = useState(latest.no)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Clause[]>(latest.clauses)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const start = () => {
    setDraft(latest.clauses)
    setVerNo(latest.no)
    setError('')
    setEditing(true)
  }

  const change = (list: Clause[]) => {
    setDraft(list)
    setError('')
  }

  const save = async () => {
    const err = clauseError(draft)
    if (err) return setError(err)
    let serverNo: number | undefined
    if (c.apiId) {
      setSaving(true)
      const r = await saveClauses(c.apiId, draft)
      setSaving(false)
      if (!r.ok) return setError(`Perubahan belum tersimpan. ${r.error}`)
      serverNo = r.data.nomorVersi
    }
    const no = saveDraft(c.code, draft, session, note.trim() || undefined, serverNo)
    onSaved()
    setEditing(false)
    setNote('')
    setVerNo(no ?? latest.no)
  }

  const ver = c.versions.find((v) => v.no === verNo) ?? latest
  return { latest, ver, prev: c.versions.find((v) => v.no === ver.no - 1), setVerNo, editing, cancel: () => setEditing(false), draft, note, setNote, error, saving, start, change, save }
}
