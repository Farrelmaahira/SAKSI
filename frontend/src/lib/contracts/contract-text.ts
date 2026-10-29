import type { Contract } from '@/interfaces/contract'
import { formatRp } from './format-rp'

/* Canonical text that gets hashed. Any change to it changes the fingerprint. */
export function contractText(c: Contract) {
  return [
    `SAKSI ${c.code}`,
    `Jenis: ${c.type}`,
    `Judul: ${c.title}`,
    `Pihak pertama: ${c.first}`,
    `Pihak kedua: ${c.second}`,
    `Nilai: ${formatRp(c.value)}${c.valueNote ? ` ${c.valueNote}` : ''}`,
    `Jangka waktu: ${c.duration}`,
    ...c.clauses.map((cl, i) => `Pasal ${i + 1}. ${cl.title}: ${cl.text}`),
  ].join('\n')
}
