import { DAY_MS } from '@/data/time'

/* ISO date (YYYY-MM-DD) relative to today, used so the demo data always looks current */
export function daysFromNow(n: number) {
  const d = new Date(Date.now() + n * DAY_MS)
  return d.toISOString().slice(0, 10)
}
