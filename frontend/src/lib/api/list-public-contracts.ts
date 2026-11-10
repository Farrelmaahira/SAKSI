import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import type { PublicContractSummary } from '@/lib/api/reports'

/* GET /public/contracts: published, running and finished contracts (a citizen only sees their own village). */
export const listPublicContracts = (search = ''): Promise<ApiResult<PublicContractSummary[]>> =>
  apiRequest<PublicContractSummary[]>(`/public/contracts${search ? `?search=${encodeURIComponent(search)}` : ''}`)
