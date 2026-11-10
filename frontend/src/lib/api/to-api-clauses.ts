import type { ApiClause } from '@/interfaces/api'
import type { Clause } from '@/interfaces/drafting'

/* Local clauses -> backend shape; urutan follows the list order (1-based). */
export const toApiClauses = (clauses: Clause[]): ApiClause[] =>
  clauses.map((c, i) => ({ kodePasal: c.key, judul: c.title, isi: c.text, urutan: i + 1, legalReferenceId: c.legalReferenceId ?? 0 }))
