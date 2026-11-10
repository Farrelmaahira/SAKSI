import { useEffect } from 'react'
import { fetchCounterparties } from '@/lib/api/contracts'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { mergeCounterparties } from '@/lib/master/merge-counterparties'

/* Pulls the backend counterparties into the local store once on mount. */
export function useSyncCounterparties() {
  useEffect(() => {
    fetchCounterparties().then((api) => {
      if (api?.length) counterpartyStore.set((list) => mergeCounterparties(list, api))
    })
  }, [])
}
