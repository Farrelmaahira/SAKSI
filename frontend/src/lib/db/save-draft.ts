import type { Clause } from '@/interfaces/drafting'
import type { Session } from '@/interfaces/auth'
import { find } from '@/lib/db/find'
import { isEditable } from '@/lib/db/is-editable'
import { latestVersion } from '@/lib/db/latest-version'
import { regionOfContract } from '@/lib/db/region-of-contract'
import { reaudit } from '@/lib/drafting/reaudit'
import { update } from '@/lib/db/update'
import { nowIso } from '@/lib/dates/now-iso'
import { log } from '@/lib/db/log'

/* Edit clause text while the contract is still editable. During a revision, saving creates a new version. */
export function saveDraft(code: string, clauses: Clause[], s: Session, note?: string) {
  const c = find(code)
  if (!c || !isEditable(c)) return
  const prev = latestVersion(c)
  const regionId = regionOfContract(c)!
  const audit = reaudit(c.template, prev.answers, clauses, regionId, prev.audit)
  if (c.status === 'ditinjau' && c.reviewDecision === 'revisi') {
    update(code, (x) => ({
      ...x,
      reviewDecision: undefined,
      reviewNote: undefined,
      versions: [...x.versions, { no: prev.no + 1, at: nowIso(), answers: prev.answers, clauses, audit, note }],
    }))
    log(s, `Mengirim versi ${prev.no + 1} untuk ditinjau ulang`, c)
  } else {
    update(code, (x) => ({ ...x, versions: x.versions.map((v) => (v.no === prev.no ? { ...v, clauses, audit } : v)) }))
    log(s, 'Mengubah isi draf', c)
  }
}
