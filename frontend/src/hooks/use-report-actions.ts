import { useState } from 'react'
import { reportActionApi } from '@/data/report-action-api'
import type { Session } from '@/interfaces/auth'
import type { ReportOption } from '@/interfaces/dash'
import type { DReport } from '@/interfaces/db'
import { addReportAction } from '@/lib/api/add-report-action'
import { optionsFor } from '@/lib/dash/options-for'
import { reportAction } from '@/lib/db/report-action'

const MIN_NOTE = 5

/* The note box and action buttons of a report: server reports post to the API, local demo ones change the local store. */
export function useReportActions(r: DReport, session: Session, onChanged?: () => void) {
  const [text, setText] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const options = optionsFor(session, r).filter((o) => !r.apiId || reportActionApi[o.kind])

  const run = async (o: ReportOption) => {
    const body = text.trim() || o.fallback || ''
    if (o.needsText && body.length < MIN_NOTE) return setHint('Tulis catatan singkat dulu, minimal 5 karakter.')
    if (r.apiId) {
      setBusy(true)
      setError('')
      const res = await addReportAction(r.apiId, { ...reportActionApi[o.kind]!, catatan: body })
      setBusy(false)
      if (!res.ok) return setError(res.error)
      onChanged?.()
    } else reportAction(r.id, o.kind, body, session)
    setText('')
    setHint(null)
  }

  return { text, setText, hint, busy, error, options, run }
}
