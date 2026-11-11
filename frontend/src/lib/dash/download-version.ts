import type { DContract, Version } from '@/interfaces/db'
import { downloadTxt } from '@/lib/dash/download-txt'

/* Saves one contract version as a text file; the prototype has no real PDF, so the name says so. */
export function downloadVersion(c: DContract, ver: Version) {
  const lines = [
    `SIMULASI PDF · ${c.code} · Versi ${ver.no}`,
    c.title,
    '',
    ...ver.clauses.map((cl, i) => `Pasal ${i + 1}. ${cl.title}\n${cl.text}\n`),
    '',
    'Dokumen ini dibuat oleh prototipe SAKSI dan bukan dokumen resmi.',
  ]
  downloadTxt(`${c.code}-v${ver.no}-simulasi-pdf.txt`, lines.join('\n'))
}
