import type { Answers, Audit, Clause, TemplateKey } from '@/interfaces/drafting'
import type { Session } from '@/interfaces/auth'
import { db } from '@/lib/db/db'
import { nowIso } from '@/lib/dates/now-iso'
import type { ContractSignatures, DContract } from '@/interfaces/db'
import { titleFor } from '@/lib/db/title-for'
import { mkTerms } from '@/lib/db/mk-terms'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { withStatus } from '@/lib/db/with-status'
import { log } from '@/lib/db/log'

export function createContract(
  input: { template: TemplateKey; answers: Answers; counterpartyId: string; clauses: Clause[]; audit: Audit; send: boolean; signatures?: ContractSignatures },
  s: Session,
) {
  const nums = db.get().contracts.map((c) => parseInt(c.code.slice(-3), 10)).filter((n) => !Number.isNaN(n))
  const code = `SKS-2026-${String(Math.max(45, ...nums) + 1).padStart(3, '0')}`
  const at = nowIso()
  let c: DContract = {
    code,
    villageId: s.role.villageId!,
    template: input.template,
    title: titleFor(input.template, input.answers.work),
    counterpartyId: input.counterpartyId,
    status: 'draf',
    createdAt: at,
    versions: [{ no: 1, at, answers: input.answers, clauses: input.clauses, audit: input.audit }],
    reviews: [],
    signatures: input.signatures ?? {},
    seals: [],
    terms: mkTerms(input.answers, daysFromNow(0)),
    progress: [],
    history: [{ status: 'draf', at, by: s.name }],
    selfReport: true,
  }
  c = withStatus(c, 'diaudit', s.name)
  if (input.send) c = withStatus(c, 'ditinjau', s.name)
  db.set((d) => ({ ...d, contracts: [c, ...d.contracts] }))
  log(s, input.send ? 'Membuat kontrak dan mengirim untuk ditinjau' : 'Menyimpan draf kontrak', c)
  return code
}
