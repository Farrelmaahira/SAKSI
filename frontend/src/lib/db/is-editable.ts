import type { DContract } from '@/interfaces/db'

export const isEditable = (c: DContract) => c.status === 'draf' || c.status === 'diaudit' || (c.status === 'ditinjau' && c.reviewDecision === 'revisi')
