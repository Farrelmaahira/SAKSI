import { DAY_MS } from '@/data/time'

/* Whole days from today until the date (negative when it has passed) */
export function daysUntil(iso: string) {
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime()
  return Math.round((new Date(iso.slice(0, 10)).getTime() - today) / DAY_MS)
}
