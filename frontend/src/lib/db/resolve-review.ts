import { update } from '@/lib/db/update'

export function resolveReview(code: string, id: string) {
  update(code, (c) => ({ ...c, reviews: c.reviews.map((r) => (r.id === id ? { ...r, resolved: true } : r)) }))
}
