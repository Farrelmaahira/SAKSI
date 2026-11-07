import type { Answers, Audit, Clause, TemplateKey } from '@/interfaces/drafting'
import { auditDraft } from '@/lib/drafting/audit-draft'
import { scoreOf } from '@/lib/drafting/score-of'

/* Re-audit while keeping a record of findings that were fixed */
export function reaudit(t: TemplateKey, a: Answers, clauses: Clause[], regionId: string, prev?: Audit): Audit {
  const fresh = auditDraft(t, a, clauses, regionId)
  const fixed = (prev?.findings ?? []).filter((f) => !f.applied && !fresh.findings.some((n) => n.id === f.id)).map((f) => ({ ...f, applied: true }))
  const keep = (prev?.findings ?? []).filter((f) => f.applied && !fresh.findings.some((n) => n.id === f.id))
  const findings = [...fresh.findings, ...fixed, ...keep]
  return { at: fresh.at, score: scoreOf(findings), findings }
}
