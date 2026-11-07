import { readStore } from '@/lib/notifications/read-store'

export function markRead(userId: string, ids: string[]) {
  readStore.set((all) => ({ ...all, [userId]: [...new Set([...(all[userId] ?? []), ...ids])].slice(-500) }))
}
