import { useState } from 'react'
import { useConfirm } from '@/hooks/use-confirm'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { reportProgress } from '@/lib/api/report-progress'
import { validateProgress } from '@/lib/dash/validate-progress'
import { addProgress } from '@/lib/db/add-progress'
import { progressOf } from '@/lib/db/progress-of'

/* The "Catat progres" form: server contracts send percent, note, evidence links and an optional term; local ones keep a simulated photo count. */
export function useProgressForm(c: DContract, session: Session, onSaved: () => void) {
  const confirm = useConfirm()
  const last = progressOf(c)
  const [pct, setPct] = useState(Math.min(100, last + 10))
  const [note, setNote] = useState('')
  const [links, setLinks] = useState('')
  const [termId, setTermId] = useState('')
  const [photos, setPhotos] = useState(2)
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const checked = validateProgress({ pct, last, note, links: c.apiId ? links : undefined })
    if ('error' in checked) return setError(checked.error)
    if (pct === 100) {
      const ok = await confirm({ title: 'Tandai kontrak selesai?', text: 'Progres 100% menandai kontrak ini selesai. Setelah itu progres tidak bisa ditambah lagi.', confirmLabel: 'Ya, tandai selesai', art: 'document-ready_o5d5' })
      if (!ok) return
    }
    if (c.apiId) {
      setBusy(true)
      setServerError('')
      const res = await reportProgress(c.apiId, { persenSelesai: pct, catatan: note.trim(), termId: termId ? Number(termId) : undefined, buktiUrl: checked.buktiUrl })
      setBusy(false)
      if (!res.ok) return setServerError(res.error)
      setLinks('')
      setTermId('')
      onSaved()
    } else addProgress(c.code, { percent: pct, note: note.trim(), photos }, session)
    setNote('')
    setError('')
    setPct(Math.min(100, pct + 10))
  }

  return { pct, setPct, note, setNote, links, setLinks, termId, setTermId, photos, setPhotos: (n: number) => setPhotos(Math.max(0, n)), error, serverError, busy, save }
}
