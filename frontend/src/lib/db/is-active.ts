import type { DContract } from '@/interfaces/db'

export const isActive = (c: DContract) => c.status === 'ditandatangani' || c.status === 'dipublikasikan' || c.status === 'berjalan'
