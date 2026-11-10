'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { notifStore } from '@/lib/notifications/notif-store'

/* Server notifications of the signed-in account (loaded once, shared by every caller). */
export function useNotifications(userId: string) {
  const state = useSyncExternalStore(notifStore.subscribe, notifStore.get, notifStore.getServer)
  useEffect(() => {
    notifStore.load(userId)
  }, [userId])
  return state
}
