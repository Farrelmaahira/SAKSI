'use client'


import Btn from '@/components/atoms/Btn'
import Callout from '@/components/atoms/Callout'
import TextButton from '@/components/atoms/TextButton'
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
}

/* Sends the draft to the second party, unless a critical audit finding is still open */
export default function SendReviewPanel({ c, session, critical, onFix }: Props) {
  const { send, busy, error } = useSendForReview(c, session)
  return (
    <Panel title="Kirim ke pihak kedua" desc="Setelah dikirim, pihak kedua bisa memberi komentar per pasal. Isi kontrak dikunci kecuali mereka meminta revisi.">
      {critical > 0 ? (
        <Callout tone="red" icon="alert">
          Masih ada {critical} temuan kritis.{' '}
          <TextButton tone="inherit" onClick={onFix}>
            Perbaiki di Audit AI
          </TextButton>
        </Callout>
      ) : (
        <>
          {error && <FormAlert>{error}</FormAlert>}
          <Btn icon="arrow" onClick={send} disabled={busy}>
            {busy ? 'Mengirim...' : `Kirim untuk ditinjau ${counterpartyById(c.counterpartyId)?.name ?? ''}`}
          </Btn>
        </>
      )}
    </Panel>
  )
}
