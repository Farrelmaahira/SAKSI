import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import { draftClauses } from '@/lib/drafting/draft-clauses'
import { draftContext } from '@/lib/db/draft-context'
import { seedContracts } from '@/data/seed-contracts'
import { keyByTitle } from '@/data/db'
import { legal } from '@/data/drafting'

export function clausesFromPublic(code: string, t: TemplateKey, a: Answers, villageId: string, cpId: string): Clause[] {
  const library = draftClauses(t, a, draftContext(villageId, cpId))
  return (seedContracts.find((s) => s.code === code)?.clauses ?? []).map((c) => {
    const key = keyByTitle[c.title] ?? c.title.toLowerCase().replace(/[^a-z]+/g, '_')
    const lib = library.find((l) => l.key === key)
    return { key, title: c.title, text: c.text, plain: lib?.plain ?? 'Isi pasal kontrak.', legal: lib?.legal ?? legal.kebebasan }
  })
}
