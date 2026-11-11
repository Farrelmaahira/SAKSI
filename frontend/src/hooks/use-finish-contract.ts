import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@/interfaces/auth'
import type { ContractSignatures } from '@/interfaces/db'
import type { Answers, Audit, Clause, ClauseSource, TemplateKey } from '@/interfaces/drafting'
import { PARTY_NOT_ON_SERVER, partyApiId } from '@/lib/drafting/party-api-id'
import { saveWizardContract } from '@/lib/drafting/save-wizard-contract'
import { sendForReview } from '@/lib/db/send-for-review'

interface Input {
  template: TemplateKey | null
  answers: Answers
  partyId: string
  clauses: Clause[]
  audit: Audit | null
  signatures?: ContractSignatures
  source: ClauseSource
  session: Session
}

/* Saves the wizard contract and, when asked, sends it to the second party. If the send fails the draft stays saved and `failed` says why. */
export function useFinishContract(i: Input) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<{ code: string; message: string } | null>(null)

  const finish = async (send: boolean) => {
    const party = partyApiId(i.partyId)
    if (!i.template || !i.audit || busy) return
    if (party === null) return setFailed({ code: '', message: PARTY_NOT_ON_SERVER })
    setBusy(true)
    const saved = await saveWizardContract({ template: i.template, answers: i.answers, partyId: i.partyId, party, clauses: i.clauses, audit: i.audit, signatures: i.signatures, source: i.source }, i.session)
    // sent only on the server's word: a draft the server never got has nothing to send
    const error = !send ? '' : saved.apiId ? await sendForReview(saved, i.session) : 'Draf tersimpan di perangkat ini tetapi belum sampai ke server, jadi belum bisa dikirim.'
    setBusy(false)
    if (error) return setFailed({ code: saved.code, message: `Draf ${saved.code} tersimpan, tetapi belum terkirim. ${error}` })
    router.push(`/dashboard/kontrak/${saved.code}`)
  }

  return { busy, failed, finish }
}
