import type { ApiResult, AuditReport } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /audit-reports/{id}/terbit (the inspektorat who wrote it). */
export const publishAuditReport = (id: number): Promise<ApiResult<AuditReport>> => apiRequest<AuditReport>(`/audit-reports/${id}/terbit`, { method: 'POST' })
