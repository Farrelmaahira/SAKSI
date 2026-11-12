import type { Counterparty } from '@/interfaces/master'
import { createStore } from '@/lib/store/create-store'

/* Second parties known to this browser: only the ones the server lists (see useSyncCounterparties), no sample parties. */
export const counterpartyStore = createStore<Counterparty[]>('saksi:counterparties-v2', () => [])
