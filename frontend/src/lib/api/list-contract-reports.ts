import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import type { CreatedReportResponse } from '@/lib/api/reports'

/* GET /contracts/{id}/reports: every citizen report on one contract, for village officials, BPD and Inspektorat. */
export const listContractReports = (id: number): Promise<ApiResult<CreatedReportResponse[]>> => apiRequest<CreatedReportResponse[]>(`/contracts/${id}/reports`)
