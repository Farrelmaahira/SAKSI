import type { LhpFinding } from '@/interfaces/api'

export type FindingDraft = Omit<LhpFinding, 'id'>

/* An empty finding to fill in. */
export const newFinding = (): FindingDraft => ({ objek: 'termin', temuan: '', tingkat: 'saran', rekomendasi: '' })
