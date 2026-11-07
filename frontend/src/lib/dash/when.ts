import { fmtDate } from '@/lib/dates/fmt-date'
import { timeAgo } from '@/lib/dates/time-ago'

export const when = (iso: string) => (new Date(iso).getTime() > Date.now() ? fmtDate(iso) : timeAgo(iso))
