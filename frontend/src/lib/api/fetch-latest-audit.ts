import type { ApiResult, ContractAudit } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import { toContractAudit } from '@/lib/api/to-contract-audit'

/* GET /contracts/{id}/audit/latest. 404 = no audit yet, returned as ok with null (not an error). */
export async function fetchLatestAudit(id: number): Promise<ApiResult<ContractAudit | null>> {
  const r = await apiRequest<unknown>(`/contracts/${id}/audit/latest`)
  if (!r.ok) return r.status === 404 ? { ok: true, data: null } : r
  const audit = toContractAudit(r.data)
  return audit ? { ok: true, data: audit } : { ok: false, status: 200, error: 'Hasil audit terakhir dari server tidak lengkap.' }
}
