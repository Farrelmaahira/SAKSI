import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function decideReview(code: string, decision: 'setuju' | 'revisi', note: string, s: Session) {
  update(code, (c) => ({ ...c, reviewDecision: decision, reviewNote: note || undefined }))
  log(s, decision === 'setuju' ? 'Menyetujui draf kontrak' : 'Meminta revisi kontrak', find(code), note || undefined)
}
