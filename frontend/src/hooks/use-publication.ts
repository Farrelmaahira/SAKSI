import { useState } from 'react'
import { pubFields } from '@/data/db'
import type { Publication } from '@/interfaces/api'
import type { Session } from '@/interfaces/auth'
import type { DContract, PubField } from '@/interfaces/db'
import { publishContract as publishOnServer } from '@/lib/api/publish-contract'
import { publishError } from '@/lib/api/publish-error'
import { publishContract } from '@/lib/db/publish-contract'

/* Publishing a sealed contract to the citizen portal: which parts show, the server's privacy filter, and the outcome. */
export function usePublication(c: DContract, session: Session) {
  const [fields, setFields] = useState<PubField[]>(c.publication?.fields ?? [...pubFields])
  const [confirmed, setConfirmed] = useState(false)
  const [editing, setEditing] = useState(!c.publication)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ text: string; retry: boolean } | null>(null)
  const [published, setPublished] = useState<Publication | null>(null)

  const toggle = (f: PubField) => setFields(fields.includes(f) ? fields.filter((x) => x !== f) : [...fields, f])

  const finish = () => {
    publishContract(c.code, fields, session)
    setConfirmed(false)
    setEditing(false)
  }

  // a contract that is already published, or exists only on this device, only changes its visible parts
  const publish = async () => {
    if (!c.apiId || c.publication) return finish()
    setBusy(true)
    setError(null)
    const r = await publishOnServer(c.apiId)
    setBusy(false)
    if (!r.ok) return setError(publishError(r))
    setPublished(r.data)
    finish()
  }

  return { fields, toggle, confirmed, setConfirmed, editing, setEditing, busy, error, published, publish }
}
