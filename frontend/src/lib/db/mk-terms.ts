import type { Answers } from '@/interfaces/drafting'
import type { Term } from '@/interfaces/db'

export function mkTerms(a: Answers, startIso: string): Term[] {
  const n = a.scheme === 'Termin' ? Math.max(1, a.terms) : 1
  const base = Math.floor(100 / n)
  const start = new Date(startIso).getTime()
  const end = new Date(a.deadline).getTime()
  return Array.from({ length: n }, (_, i) => {
    const percent = i === n - 1 ? 100 - base * (n - 1) : base
    return {
      no: i + 1,
      label: n === 1 ? 'Pembayaran penuh' : `Termin ${i + 1}`,
      percent,
      amount: Math.round((a.value * percent) / 100),
      planDate: new Date(start + ((end - start) * (i + 1)) / n).toISOString().slice(0, 10),
    }
  })
}
