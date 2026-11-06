import { fmtDate } from './fmt-date'

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'baru saja'
  if (min < 60) return `${min} menit lalu`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.round(h / 24)
  if (d < 30) return `${d} hari lalu`
  return fmtDate(iso)
}
