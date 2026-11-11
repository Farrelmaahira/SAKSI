import type { DReport } from '@/interfaces/db'
import { isClosed } from '@/lib/db/is-closed'

/* Opened and answered at least once, but not closed yet. */
export const reportInProgress = (x: DReport) => !isClosed(x) && x.flow !== 'baru'
