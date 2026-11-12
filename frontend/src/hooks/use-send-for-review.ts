import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { sendForReview } from '@/lib/db/send-for-review'

/* "Kirim untuk ditinjau" with its pending flag and the server's error message. */
export function useSendForReview(c: DContract, session: Session) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const send = async (confirmCritical = false) => {
    setBusy(true)
    setError('')
    setError(await sendForReview(c, session, confirmCritical))
    setBusy(false)
  }
  return { send, busy, error }
}
