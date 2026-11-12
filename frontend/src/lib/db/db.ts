import { createStore } from '@/lib/store/create-store'
import type { Db } from '@/interfaces/db'

/* Contracts and reports of this browser: loaded from the server, never seeded with sample data. */
export const db = createStore<Db>('saksi:db-v2', () => ({ contracts: [], reports: [] }))
