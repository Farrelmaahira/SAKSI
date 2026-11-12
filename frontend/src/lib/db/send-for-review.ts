import type { Session } from '@/interfaces/auth'
import { sendContract } from '@/lib/api/send-contract'
import { update } from '@/lib/db/update'
import { withStatus } from '@/lib/db/with-status'

/* Sends a contract to the second party. A contract the server knows is sent there first and the local status only follows on success;
   a local-only prototype contract (no apiId) has nothing to send to. Returns the error message, or '' when sent. */
export async function sendForReview(c: { code: string; apiId?: number }, s: Session, confirmCritical = false): Promise<string> {
  if (c.apiId) {
    const r = await sendContract(c.apiId, confirmCritical)
    if (!r.ok) return r.error
  }
  update(c.code, (x) => ({ ...withStatus(x, 'ditinjau', s.name), reviewDecision: undefined }))
  return ''
}
