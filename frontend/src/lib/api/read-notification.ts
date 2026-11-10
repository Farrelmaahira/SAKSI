import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /notifications/{id}/read (204). */
export const readNotification = (id: number): Promise<ApiResult<unknown>> => apiRequest(`/notifications/${id}/read`, { method: 'POST' })
