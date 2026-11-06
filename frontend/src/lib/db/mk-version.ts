import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import type { Version } from '@/interfaces/db'
import { draftClauses } from '@/lib/drafting/draft-clauses'
import { draftContext } from '@/lib/db/draft-context'
import { villageById } from '@/lib/master/village-by-id'
import { reaudit } from '@/lib/drafting/reaudit'
import { applyFinding } from '@/lib/drafting/apply-finding'

export function mkVersion(t: TemplateKey, a: Answers, villageId: string, cpId: string, apply: string[], at: string, clauses?: Clause[]): Version {
  let cl = clauses ?? draftClauses(t, a, draftContext(villageId, cpId))
  let answers = a
  const regionId = villageById(villageId)!.regionId
  let audit = reaudit(t, answers, cl, regionId)
  for (const id of apply) {
    const next = applyFinding(t, answers, cl, id)
    answers = next.answers
    cl = next.clauses
    audit = reaudit(t, answers, cl, regionId, audit)
  }
  return { no: 1, at, answers, clauses: cl, audit: { ...audit, at } }
}
