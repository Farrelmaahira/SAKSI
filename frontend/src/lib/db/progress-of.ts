import type { DContract } from '@/interfaces/db'

export const progressOf = (c: DContract) => (c.progress.length ? c.progress[c.progress.length - 1].percent : 0)
