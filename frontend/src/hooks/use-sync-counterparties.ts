import { useEffect } from 'react'
import { fetchCounterparties } from '@/lib/api/contracts'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { toCounterparty } from '@/lib/master/to-counterparty'

/* Replaces the local list with what the server lists, so a business the server no longer offers (or an old made-up row) cannot linger in this browser. An empty answer keeps the list as it is: it can also mean the request failed. */
export function useSyncCounterparties() {
  useEffect(() => {
    fetchCounterparties().then((api) => {
      if (api?.length) counterpartyStore.set(() => api.map(toCounterparty))
    })
  }, [])
}
