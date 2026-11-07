import type { Session } from '@/interfaces/auth'
import { update } from '@/lib/db/update'
import { withStatus } from '@/lib/db/with-status'
import { log } from '@/lib/db/log'
import { find } from '@/lib/db/find'

export function sendForReview(code: string, s: Session) {
  update(code, (c) => ({ ...withStatus(c, 'ditinjau', s.name), reviewDecision: undefined }))
  log(s, 'Mengirim kontrak untuk ditinjau pihak kedua', find(code))
}
