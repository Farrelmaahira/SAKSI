import type { ApiResult, AuditReport } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /audit-reports (LHP list, without findings), newest first. */
export function listAuditReports(f: { contractId?: number; status?: 'draf' | 'terbit' } = {}): Promise<ApiResult<AuditReport[]>> {
  const q = new URLSearchParams()
  if (f.contractId) q.set('contractId', String(f.contractId))
  if (f.status) q.set('status', f.status)
  return apiRequest<AuditReport[]>(`/audit-reports${q.size ? `?${q}` : ''}`)
}
