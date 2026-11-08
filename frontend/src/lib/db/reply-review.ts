import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { nowIso } from '@/lib/dates/now-iso'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function replyReview(code: string, id: string, text: string, s: Session) {
  update(code, (c) => ({ ...c, reviews: c.reviews.map((r) => (r.id === id ? { ...r, replies: [...r.replies, { author: s.name, role: s.role.role, text, at: nowIso() }] } : r)) }))
  log(s, 'Membalas komentar pasal', find(code))
}
