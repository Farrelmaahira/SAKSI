import type { ApiResult } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* POST /notifications/read-all. */
export const readAllNotifications = (): Promise<ApiResult<{ updated: number }>> => apiRequest<{ updated: number }>('/notifications/read-all', { method: 'POST' })
