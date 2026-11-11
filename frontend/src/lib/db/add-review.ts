import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { uid } from '@/lib/dates/uid'
import { latestVersion } from '@/lib/db/latest-version'
import { nowIso } from '@/lib/dates/now-iso'

export function addReview(code: string, clauseKey: string, text: string, s: Session) {
  update(code, (c) => ({
    ...c,
    reviews: [...c.reviews, { id: uid('rv-'), versionNo: latestVersion(c).no, clauseKey, author: s.name, role: s.role.role, text, at: nowIso(), replies: [] }],
  }))
}
