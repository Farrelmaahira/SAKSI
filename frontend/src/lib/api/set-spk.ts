import type { ApiResult, ContractTermin } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* PUT /contracts/{id}/spk (desa). Dates YYYY-MM-DD. A published contract becomes berjalan. */
export const setSpk = (id: number, spk: { nomor: string; tanggal: string; mulai?: string; selesai?: string }): Promise<ApiResult<ContractTermin>> =>
  apiRequest<ContractTermin>(`/contracts/${id}/spk`, { method: 'PUT', body: spk })
