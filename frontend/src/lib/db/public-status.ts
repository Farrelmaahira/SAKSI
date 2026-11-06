import type { DReport } from '@/interfaces/db'
import type { ReportStatus } from '@/interfaces/contract'
import { isClosed } from '@/lib/db/is-closed'

export const publicStatus = (r: DReport): ReportStatus => (isClosed(r) ? 2 : r.flow === 'baru' && !r.actions.length ? 0 : 1)
