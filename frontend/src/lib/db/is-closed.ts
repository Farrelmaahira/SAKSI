import type { DReport } from '@/interfaces/db'

export const isClosed = (r: DReport) => r.flow === 'ditindaklanjuti' || r.flow === 'ditutup'
