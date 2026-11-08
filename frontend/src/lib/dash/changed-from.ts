import type { Clause } from '@/interfaces/drafting'

export const changedFrom = (prev: Clause[] | undefined, cl: Clause) => {
  if (!prev) return false
  const p = prev.find((x) => x.key === cl.key)
  return !p || p.text !== cl.text
}
