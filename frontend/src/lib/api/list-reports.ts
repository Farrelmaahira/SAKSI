import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import type { CreatedReportResponse } from '@/lib/api/reports'

/* GET /reports: scoped by role on the server (a citizen gets only their own reports). */
export const listReports = (contractId?: number): Promise<ApiResult<CreatedReportResponse[]>> =>
  apiRequest<CreatedReportResponse[]>(`/reports${contractId ? `?contractId=${contractId}` : ''}`)
