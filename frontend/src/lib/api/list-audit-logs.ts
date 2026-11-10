import type { ApiResult, AuditLogPage } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

interface Filter { contractId?: number; actorId?: number; from?: string; to?: string; limit?: number; before?: number | null }

/* GET /audit-logs, newest first. from/to are YYYY-MM-DD (to is inclusive). */
export function listAuditLogs(f: Filter = {}): Promise<ApiResult<AuditLogPage>> {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(f)) if (v) q.set(k, String(v))
  return apiRequest<AuditLogPage>(`/audit-logs${q.size ? `?${q}` : ''}`)
}
