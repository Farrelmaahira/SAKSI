import type { DContract } from '@/interfaces/db'
import { paidOf } from '@/lib/db/paid-of'
import { progressOf } from '@/lib/db/progress-of'
import { valueOf } from '@/lib/db/value-of'

/* How much is paid against how much work is done; paying more than 10 points ahead of the work is flagged. */
export function paymentSummary(c: DContract) {
  const paidPct = Math.round((paidOf(c) / Math.max(1, valueOf(c))) * 100)
  const progress = progressOf(c)
  return { paidPct, progress, ahead: paidPct - progress > 10 }
}
