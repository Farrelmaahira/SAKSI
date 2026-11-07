import type { DContract } from '@/interfaces/db'

export const isPublic = (c: DContract) => Boolean(c.publication) && (c.status === 'dipublikasikan' || c.status === 'berjalan' || c.status === 'selesai')
