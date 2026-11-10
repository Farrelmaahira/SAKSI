import type { ApiResult, ContractTermin } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /contracts/{id}/termin: SPK, payment terms and work progress of one contract. */
export const getContractTermin = (id: number): Promise<ApiResult<ContractTermin>> => apiRequest<ContractTermin>(`/contracts/${id}/termin`)
