import type { Session } from '@/interfaces/auth'
import { find } from '@/lib/db/find'
import { isEditable } from '@/lib/db/is-editable'
import { latestVersion } from '@/lib/db/latest-version'
import { applyFinding } from '@/lib/drafting/apply-finding'
import { reaudit } from '@/lib/drafting/reaudit'
import { regionOfContract } from '@/lib/db/region-of-contract'
import { update } from '@/lib/db/update'
import { log } from '@/lib/db/log'

export function applySuggestion(code: string, findingId: string, s: Session) {
  const c = find(code)
  if (!c || !isEditable(c)) return
  const v = latestVersion(c)
  const next = applyFinding(c.template, v.answers, v.clauses, findingId)
  const audit = reaudit(c.template, next.answers, next.clauses, regionOfContract(c)!, v.audit)
  update(code, (x) => ({ ...x, versions: x.versions.map((ver) => (ver.no === v.no ? { ...ver, answers: next.answers, clauses: next.clauses, audit } : ver)) }))
  log(s, 'Menerapkan saran AI', c, v.audit.findings.find((f) => f.id === findingId)?.title)
}
