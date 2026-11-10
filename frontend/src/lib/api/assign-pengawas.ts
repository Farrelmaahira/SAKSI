import type { ApiResult, OversightAssignment } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /admin/oversight-assignments (admin_daerah). 409 = already assigned. */
export const assignPengawas = (body: { contractId: number; pengawasUserId: number; jenis: 'bpd' | 'inspektorat' }): Promise<ApiResult<OversightAssignment>> =>
  apiRequest<OversightAssignment>('/admin/oversight-assignments', { method: 'POST', body })
