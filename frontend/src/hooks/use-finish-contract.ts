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
  /* the person confirmed the open critical findings */
  confirmCritical?: boolean
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
    // a draft the server refused stays on this device only: say why instead of opening it as if it were saved
    if (!saved.apiId) {
      setBusy(false)
      return setFailed({ code: saved.code, message: `Draf ${saved.code} baru tersimpan di perangkat ini, belum masuk ke server. ${saved.error ?? ''}`.trim() })
    }
    // sent only on the server's word: a draft the server never got has nothing to send
    const error = !send ? '' : await sendForReview(saved, i.session, i.confirmCritical)
    setBusy(false)
    if (error) return setFailed({ code: saved.code, message: `Draf ${saved.code} tersimpan, tetapi belum terkirim. ${error}` })
    router.push(`/dashboard/kontrak/${saved.code}`)
  }

  return { busy, failed, finish }
}
