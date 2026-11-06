import { fmtDate } from './fmt-date'

export function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return `${fmtDate(iso)}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}
