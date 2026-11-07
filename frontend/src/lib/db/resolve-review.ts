import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function resolveReview(code: string, id: string, s: Session) {
  update(code, (c) => ({ ...c, reviews: c.reviews.map((r) => (r.id === id ? { ...r, resolved: true } : r)) }))
  log(s, 'Menandai komentar selesai', find(code))
}
