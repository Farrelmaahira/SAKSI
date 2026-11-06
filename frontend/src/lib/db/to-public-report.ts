import type { DReport } from '@/interfaces/db'
import type { Report } from '@/interfaces/contract'
import { reportDate } from '@/lib/db/report-date'
import { publicStatus } from '@/lib/db/public-status'
import { publicResponse } from '@/lib/db/public-response'

export const toPublicReport = (r: DReport): Report => ({
  id: r.id,
  category: r.category,
  clause: r.clause,
  text: r.text,
  location: r.location,
  date: reportDate(r.date),
  status: publicStatus(r),
  reporter: r.reporter,
  response: publicResponse(r),
  photos: r.photos,
})
