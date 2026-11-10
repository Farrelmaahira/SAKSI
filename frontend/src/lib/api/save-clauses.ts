import type { ApiResult } from '@/interfaces/api'
import type { Clause } from '@/interfaces/drafting'
import { apiRequest } from '@/lib/api/api-request'
import { toApiClauses } from '@/lib/api/to-api-clauses'

/* PUT /contracts/{id}: the backend stores a new version with sumber "manual" and returns its nomorVersi; 409 once signed. */
export async function saveClauses(id: number, clauses: Clause[]): Promise<ApiResult<{ nomorVersi?: number }>> {
  const r = await apiRequest<{ nomorVersi?: unknown }>(`/contracts/${id}`, { method: 'PUT', body: { sumber: 'manual', clauses: toApiClauses(clauses) } })
  if (!r.ok) return r
  return { ok: true, data: { nomorVersi: Number(r.data?.nomorVersi) || undefined } }
}
