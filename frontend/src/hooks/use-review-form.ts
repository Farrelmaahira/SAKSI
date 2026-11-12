import { useState } from 'react'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { addReview } from '@/lib/db/add-review'
import { decideReview } from '@/lib/db/decide-review'
import { latestVersion } from '@/lib/db/latest-version'

const MIN_TEXT = 5

/* What the second party types while reviewing: a comment on a clause, or the decision with its note. */
export function useReviewForm(c: DContract, session: Session) {
  const ver = latestVersion(c)
  const [clauseKey, setClauseKey] = useState(ver.clauses[0]?.key ?? '')
  const [text, setText] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [error, setError] = useState('')

  const comment = () => {
    if (text.trim().length < MIN_TEXT) return setError('Tulis komentar minimal 5 karakter.')
    addReview(c.code, clauseKey, text.trim(), session)
    setText('')
    setError('')
  }

  const decide = (d: 'setuju' | 'revisi') => {
    if (d === 'revisi' && decisionNote.trim().length < MIN_TEXT) return setError('Jelaskan apa yang perlu direvisi.')
    decideReview(c.code, d, decisionNote.trim())
    setDecisionNote('')
    setError('')
  }

  return { ver, clauseKey, setClauseKey, text, setText, decisionNote, setDecisionNote, error, comment, decide }
}
