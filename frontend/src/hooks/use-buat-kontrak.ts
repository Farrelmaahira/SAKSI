import { useMemo, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { useContractDraft } from '@/hooks/use-contract-draft'
import { useFinishContract } from '@/hooks/use-finish-contract'
import { useLetterSigning } from '@/hooks/use-letter-signing'
import { useSyncCounterparties } from '@/hooks/use-sync-counterparties'
import type { Answers, TemplateKey } from '@/interfaces/drafting'
import { templates } from '@/data/drafting'
import { emptyAnswers } from '@/lib/dash/empty-answers'
import { clauseError } from '@/lib/drafting/clause-error'
import { PARTY_NOT_ON_SERVER, partyApiId } from '@/lib/drafting/party-api-id'
import { validateAnswers } from '@/lib/drafting/validate-answers'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { villageById } from '@/lib/master/village-by-id'

const DRAFT_STEP = 3
const REVIEW_STEP = 4

/* All state and actions of the "Buat kontrak" wizard; the components only render it. */
export function useBuatKontrak() {
  const { session } = useDash()
  const parties = counterpartyStore.use()
  useSyncCounterparties()
  const [step, setStep] = useState(0)
  const [template, setTemplate] = useState<TemplateKey | null>(null)
  const [partyId, setPartyId] = useState('')
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [valueText, setValueText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const role = session.role
  const regionId = villageById(role.villageId)?.regionId ?? ''
  const t = template ? templates[template] : null
  // only parties the server knows (the demo accounts' businesses): local sample parties cannot receive a contract
  const choices = useMemo(() => (t ? parties.filter((p) => partyApiId(p.id) !== null && t.partyTypes.includes(p.type)) : []), [parties, t])
  const draft = useContractDraft({ template, answers, partyId, regionId, villageId: role.villageId, onAnswers: setAnswers })
  const letter = useLetterSigning(session.name)
  const [confirmCritical, setConfirmCritical] = useState(false)
  const fin = useFinishContract({ template, answers, partyId, clauses: draft.clauses, audit: draft.audit, signatures: letter.signatures, source: draft.source, session, confirmCritical })

  const pickTemplate = (k: TemplateKey) => {
    setTemplate(k)
    setPartyId('')
    setAnswers((a) => ({ ...a, method: k === 'pengadaan' ? a.method : 'Penunjukan langsung' }))
  }

  const setAnswer = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }))
  const setValue = (raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ''), 10) || 0
    setValueText(n ? n.toLocaleString('id-ID') : '')
    setAnswer({ value: n })
  }

  const answersValid = () => {
    const e = validateAnswers(answers)
    setErrors(e)
    return !Object.keys(e).length
  }

  const writeManual = async () => {
    if (step === 2 && !answersValid()) return
    await draft.writeManual()
    setErrors({})
    setStep(DRAFT_STEP)
  }

  const next = () => {
    if (step === 0 && !template) return setErrors({ step: 'Pilih salah satu jenis kontrak.' })
    if (step === 1 && !partyId) return setErrors({ step: 'Pilih pihak kedua.' })
    if (step === 1 && partyApiId(partyId) === null) return setErrors({ step: PARTY_NOT_ON_SERVER })
    if (step === 2) {
      if (!answersValid()) return
      void draft.draftWithAI()
    }
    const err = step === DRAFT_STEP && draft.mode === 'manual' ? clauseError(draft.clauses) : ''
    if (err) return setErrors({ step: err })
    setErrors({})
    if (step === DRAFT_STEP) letter.stampDate()
    setStep((s) => s + 1)
  }

  return {
    session, role, regionId, step, back: () => setStep((s) => s - 1), template, t, choices, partyId, setPartyId,
    party: parties.find((p) => p.id === partyId), answers, setAnswer, valueText, setValue, errors, fin, confirmCritical, setConfirmCritical,
    draft, letter, pickTemplate, writeManual, next, reviewing: step === REVIEW_STEP,
  }
}
