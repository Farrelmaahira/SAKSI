import type { Db } from '@/interfaces/db'
import { allReports } from '@/lib/db/all-reports'

/* A citizen's own reports, newest first */
export const myReports = (d: Db, email: string) => allReports(d).filter((r) => r.owner === email)
