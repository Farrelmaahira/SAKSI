import type { ApiResult, AuditReport } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /audit-reports/{id}: one LHP with its findings. */
export const getAuditReport = (id: number): Promise<ApiResult<AuditReport>> => apiRequest<AuditReport>(`/audit-reports/${id}`)
