import { markRead } from '@/lib/notifications/mark-read'
import { notifStore } from '@/lib/notifications/notif-store'

/* "n:<id>" rows are server notifications (POST /notifications/{id}/read); the rest are to-dos derived on this device. */
export function markAnyRead(userId: string, id: string) {
  if (id.startsWith('n:')) notifStore.read(Number(id.slice(2)))
  else markRead(userId, [id])
}
