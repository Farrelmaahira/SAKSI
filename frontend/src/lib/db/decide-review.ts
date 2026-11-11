import { update } from '@/lib/db/update'

export function decideReview(code: string, decision: 'setuju' | 'revisi', note: string) {
  update(code, (c) => ({ ...c, reviewDecision: decision, reviewNote: note || undefined }))
}
