import type { ApiResult, ContractAudit } from '@/interfaces/api'
import type { Clause } from '@/interfaces/drafting'
import type { WizardPreviewPayload } from '@/lib/api/contracts'
import { apiRequest } from '@/lib/api/api-request'
import { fromApiClauses } from '@/lib/api/from-api-clauses'
import { toContractAudit } from '@/lib/api/to-contract-audit'

/* POST /contracts/wizard/preview: AI draft. 503 AI_UNAVAILABLE comes back as an error with code. */
export async function previewDraft(payload: WizardPreviewPayload): Promise<ApiResult<{ clauses: Clause[]; model: string; audit: ContractAudit | null }>> {
  const r = await apiRequest<{ clauses?: unknown; model?: unknown; integrityScore?: unknown; findings?: unknown }>('/contracts/wizard/preview', { method: 'POST', body: payload })
  if (!r.ok) return r
  const clauses = Array.isArray(r.data?.clauses) ? fromApiClauses(r.data.clauses) : []
  if (!clauses.length) return { ok: false, status: 200, error: 'Server belum mengirim pasal draf. Coba lagi, atau tulis pasal secara manual.' }
  // the AI's own audit of the draft (integrityScore + findings); null when an older backend does not send it
  const audit = toContractAudit({ skor: r.data.integrityScore, model: r.data.model, findings: r.data.findings })
  return { ok: true, data: { clauses, model: String(r.data.model ?? ''), audit } }
}
