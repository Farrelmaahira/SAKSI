import { readStore } from '@/lib/notifications/read-store'

export function useReadIds(userId: string) {
  return readStore.use()[userId] ?? []
}
