import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'
import type { PublicContractDetail } from '@/lib/api/reports'

/* GET /public/contracts/{id}: the redacted published text and its clause headings. */
export const getPublicContract = (id: number): Promise<ApiResult<PublicContractDetail>> => apiRequest<PublicContractDetail>(`/public/contracts/${id}`)
