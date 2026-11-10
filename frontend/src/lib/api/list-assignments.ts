import type { ApiResult, OversightAssignment } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /admin/oversight-assignments. */
export const listAssignments = (): Promise<ApiResult<OversightAssignment[]>> => apiRequest<OversightAssignment[]>('/admin/oversight-assignments')
