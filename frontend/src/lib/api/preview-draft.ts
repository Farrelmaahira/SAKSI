import type { ApiResult } from '@/interfaces/api'
import type { Clause } from '@/interfaces/drafting'
import type { WizardPreviewPayload } from '@/lib/api/contracts'
import { apiRequest } from '@/lib/api/api-request'
import { fromApiClauses } from '@/lib/api/from-api-clauses'

/* POST /contracts/wizard/preview: AI draft. 503 AI_UNAVAILABLE comes back as an error with code. */
export async function previewDraft(payload: WizardPreviewPayload): Promise<ApiResult<{ clauses: Clause[]; model: string }>> {
  const r = await apiRequest<{ clauses?: unknown; model?: unknown }>('/contracts/wizard/preview', { method: 'POST', body: payload })
  if (!r.ok) return r
  const clauses = Array.isArray(r.data?.clauses) ? fromApiClauses(r.data.clauses) : []
  if (!clauses.length) return { ok: false, status: 200, error: 'Server belum mengirim pasal draf. Coba lagi, atau tulis pasal secara manual.' }
  return { ok: true, data: { clauses, model: String(r.data.model ?? '') } }
}
