import { DAY_MS } from '@/data/time'

/* ISO timestamp relative to now, in days (fractions allowed) */
export const stampFromNow = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString()
