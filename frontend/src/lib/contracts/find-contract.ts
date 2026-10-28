import type { SealedContract } from '@/interfaces/contract'

/* Matches a contract code, a full or partial hash, or the shortened "abc…xyz" form. */
export function findContract(list: SealedContract[], raw: string) {
  const q = raw.trim().toLowerCase()
  if (!q) return undefined
  const byCode = list.find((c) => c.code.toLowerCase() === q)
  if (byCode) return byCode
  if (q.includes('…')) {
    const [head, tail] = q.split('…')
    return list.find((c) => c.hash.startsWith(head) && c.hash.endsWith(tail))
  }
  return q.length >= 6 ? list.find((c) => c.hash.startsWith(q)) : undefined
}
