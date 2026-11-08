import { fmtDate } from '@/lib/dates/fmt-date'

export const reportDate = (d: string) => (/^\d{4}-\d{2}-\d{2}/.test(d) ? fmtDate(d) : d)
