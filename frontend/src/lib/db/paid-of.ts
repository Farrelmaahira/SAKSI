import type { DContract } from '@/interfaces/db'

export const paidOf = (c: DContract) => c.terms.filter((t) => t.paidDate).reduce((s, t) => s + t.amount, 0)
