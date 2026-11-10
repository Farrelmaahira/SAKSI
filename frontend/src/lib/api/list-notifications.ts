import type { ApiResult, NotificationPage } from '@/interfaces/api'
import { apiRequest } from '@/lib/api/api-request'

/* GET /notifications, newest first; pass the previous page's nextBefore to load older ones. */
export function listNotifications(opts: { unread?: boolean; limit?: number; before?: number | null } = {}): Promise<ApiResult<NotificationPage>> {
  const q = new URLSearchParams()
  if (opts.unread) q.set('unread', 'true')
  if (opts.limit) q.set('limit', String(opts.limit))
  if (opts.before) q.set('before', String(opts.before))
  return apiRequest<NotificationPage>(`/notifications${q.size ? `?${q}` : ''}`)
}
