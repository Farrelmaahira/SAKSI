import type { ApiResult, Pengawas } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /admin/pengawas: BPD and Inspektorat accounts in the admin's region. */
export const listPengawas = (jenis?: 'bpd' | 'inspektorat'): Promise<ApiResult<Pengawas[]>> => apiRequest<Pengawas[]>(`/admin/pengawas${jenis ? `?jenis=${jenis}` : ''}`)
