import type { ApiResult, DraftOptions } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import { fromApiClauses } from '@/lib/api/from-api-clauses'

/* Legal references and the mandatory clause template (clause_library) for one contract type. */
export async function fetchDraftOptions(jenis: string): Promise<ApiResult<DraftOptions>> {
  const r = await apiRequest<{ legalReferences?: unknown; clauseTemplate?: unknown; clauses?: unknown }>(`/contracts/options?jenis=${encodeURIComponent(jenis)}`)
  if (!r.ok) return r
  const refs = Array.isArray(r.data?.legalReferences)
    ? r.data.legalReferences
        .map((x) => (x ?? {}) as Record<string, unknown>)
        .filter((x) => Number(x.id) > 0)
        .map((x) => ({ id: Number(x.id), peraturan: String(x.peraturan ?? ''), nomorPasal: String(x.nomorPasal ?? ''), isi: String(x.isi ?? '') }))
    : null
  // backend sends the clause_library template as `clauses`; `clauseTemplate` is the planned name
  const rawTemplate = r.data?.clauseTemplate ?? r.data?.clauses
  const template = Array.isArray(rawTemplate)
    ? fromApiClauses(rawTemplate).map((c) => {
        const ref = refs?.find((x) => x.id === c.legalReferenceId)
        return ref ? { ...c, legal: `${ref.peraturan} ${ref.nomorPasal}`.trim() } : c
      })
    : null
  return { ok: true, data: { legalReferences: refs, clauseTemplate: template } }
}
