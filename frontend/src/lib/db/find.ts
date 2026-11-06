import { db } from '@/lib/db/db'

export const find = (code: string) => db.get().contracts.find((c) => c.code === code)
