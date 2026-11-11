import type { Clause } from '@/interfaces/drafting'
import type { Session } from '@/interfaces/auth'
import { find } from '@/lib/db/find'
import { isEditable } from '@/lib/db/is-editable'
import { latestVersion } from '@/lib/db/latest-version'
import { regionOfContract } from '@/lib/db/region-of-contract'
import { reaudit } from '@/lib/drafting/reaudit'
import { update } from '@/lib/db/update'
import { unsign } from '@/lib/db/unsign'
import { nowIso } from '@/lib/dates/now-iso'

/* Edit clauses while the contract is still editable. A revision, or a server that created a new version
   (serverNo from PUT /contracts/{id}), adds a version; otherwise the latest one is edited in place. Returns the version number. */
export function saveDraft(code: string, clauses: Clause[], s: Session, note?: string, serverNo?: number) {
  const c = find(code)
  if (!c || !isEditable(c)) return
  const prev = latestVersion(c)
  const regionId = regionOfContract(c)!
  const audit = reaudit(c.template, prev.answers, clauses, regionId, prev.audit)
  const revising = c.status === 'ditinjau' && c.reviewDecision === 'revisi'
  // never reuse or go below an existing local number, even if an older local-only save put us ahead of the server
  const no = Math.max(serverNo ?? 0, revising ? prev.no + 1 : prev.no)
  update(code, (x) =>
    unsign({
      ...x,
      ...(revising && { reviewDecision: undefined, reviewNote: undefined }),
      versions:
        no === prev.no
          ? x.versions.map((v) => (v.no === prev.no ? { ...v, clauses, audit, source: 'manual' as const } : v))
          : [...x.versions, { no, at: nowIso(), answers: prev.answers, clauses, audit, note, source: 'manual' as const }],
    }),
  )
  return no
}
