import type { Session } from '@/interfaces/auth'
import type { ContractSignatures } from '@/interfaces/db'
import type { Answers, Audit, Clause, ClauseSource, TemplateKey } from '@/interfaces/drafting'
import { createContractAPI } from '@/lib/api/contracts'
import { toApiClauses } from '@/lib/api/to-api-clauses'
import { createContract } from '@/lib/db/create-contract'
import { update } from '@/lib/db/update'
import { wizardPayload } from '@/lib/drafting/wizard-payload'

interface Input {
  template: TemplateKey
  answers: Answers
  partyId: string
  /* backend counterparty id */
  party: number
  clauses: Clause[]
  audit: Audit
  signatures?: ContractSignatures
  source: ClauseSource
}

/* Saves the wizard contract as a draft locally (instant UI) and on the backend; returns the local code and the server id (absent when the server did not take it). */
export async function saveWizardContract(i: Input, session: Session): Promise<{ code: string; apiId?: number }> {
  const code = createContract({ template: i.template, answers: i.answers, counterpartyId: i.partyId, clauses: i.clauses, audit: i.audit, send: false, signatures: i.signatures, source: i.source }, session)
  const saved = await createContractAPI({
    ...wizardPayload(i.template, i.answers, i.party),
    jawabanForm: { ...i.answers, clauses: i.clauses.map((c) => ({ key: c.key, title: c.title, text: c.text })) },
    drafTeksOverride: i.clauses.map((c) => `[${c.title}]\n${c.text}`).join('\n\n'),
    sumber: i.source,
    clauses: toApiClauses(i.clauses),
  })
  // the server numbers versions; keep the local copy on the same number
  if (saved?.id) update(code, (x) => ({ ...x, apiId: saved.id, versions: x.versions.map((v) => ({ ...v, no: Number(saved.nomorVersi) || v.no })) }))
  return { code, apiId: saved?.id }
}
