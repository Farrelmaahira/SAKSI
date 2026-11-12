'use client'


import { useState } from 'react'
import Btn from '@/components/atoms/Btn'
import Callout from '@/components/atoms/Callout'
import TextButton from '@/components/atoms/TextButton'
import ConfirmCritical from '@/components/molecules/ConfirmCritical'
import Panel from '@/components/molecules/Panel'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import FormAlert from '@/components/atoms/FormAlert'
import { useSendForReview } from '@/hooks/use-send-for-review'
import { counterpartyById } from '@/lib/master/counterparty-by-id'

interface Props {
  c: DContract
  session: Session
  critical: number
  onFix: () => void
  fixLabel?: string
}

/* Sends the draft to the second party; with a critical audit finding open the person must confirm having read it */
export default function SendReviewPanel({ c, session, critical, onFix, fixLabel = 'Perbaiki di Audit AI' }: Props) {
  const { send, busy, error } = useSendForReview(c, session)
  const [confirmed, setConfirmed] = useState(false)
  return (
    <Panel title="Kirim ke pihak kedua" desc="Setelah dikirim, pihak kedua bisa memberi komentar per pasal. Isi kontrak dikunci kecuali mereka meminta revisi.">
      {critical > 0 && (
        <Callout tone="red" icon="alert">
          Masih ada {critical} temuan kritis.{' '}
          <TextButton tone="inherit" onClick={onFix}>
            {fixLabel}
          </TextButton>
        </Callout>
      )}
      {critical > 0 && <ConfirmCritical count={critical} checked={confirmed} onChange={setConfirmed} />}
      {error && <FormAlert>{error}</FormAlert>}
      <Btn icon="arrow" onClick={() => send(confirmed)} disabled={busy || (critical > 0 && !confirmed)}>
        {busy ? 'Mengirim...' : `Kirim untuk ditinjau ${counterpartyById(c.counterpartyId)?.name ?? ''}`}
      </Btn>
    </Panel>
  )
}
