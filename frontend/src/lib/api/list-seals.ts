import type { ApiResult, SealItem } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /seals: seals of contracts in the account's scope. */
export const listSeals = (): Promise<ApiResult<SealItem[]>> => apiRequest<SealItem[]>('/seals')
