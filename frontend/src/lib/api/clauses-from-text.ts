import type { Clause } from '@/interfaces/contract'

const HEADING = /^pasal\s+\d+\s*[.:\-–]?\s*/i

/* Splits a published contract text on its "Pasal N ..." heading lines (the same rule the backend uses for klausulList). */
export function clausesFromText(text: string): Clause[] {
  const out: Clause[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (HEADING.test(line)) out.push({ title: line.replace(HEADING, '') || line, text: '' })
    else if (line && out.length) out[out.length - 1].text = `${out[out.length - 1].text} ${line}`.trim()
  }
  // no headings: show the whole text as one block instead of inventing clauses
  return out.length || !text.trim() ? out : [{ title: 'Isi kontrak', text: text.trim() }]
}
