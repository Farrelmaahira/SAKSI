import type { ApiResult, ContractTermin } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* PUT /contracts/{id}/termin (desa): percentages must total 100; the server computes each nominal. Dates YYYY-MM-DD. */
export const setTermin = (id: number, terms: { persen: number; jatuhTempo: string }[]): Promise<ApiResult<ContractTermin>> =>
  apiRequest<ContractTermin>(`/contracts/${id}/termin`, { method: 'PUT', body: { terms } })
