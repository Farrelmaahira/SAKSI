import type { SealedContract } from '@/interfaces/contract'

/* Contracts of the given village first; the rest keep their order. */
export const homeFirst = (list: SealedContract[], home: string): SealedContract[] =>
  [...list].sort((a, b) => Number(b.village.includes(home)) - Number(a.village.includes(home)))
