import type { DContract } from '@/interfaces/db'
import { progressOf } from '@/lib/db/progress-of'
import { fmtDate } from '@/lib/dates/fmt-date'
import { deadlineOf } from '@/lib/db/deadline-of'

/* ---------- Public portal bridge ---------- */

export function milestonesOf(c: DContract) {
  const p = progressOf(c)
  const last = c.progress[c.progress.length - 1]
  return [
    { label: 'Kontrak disahkan dan dipublikasikan', date: fmtDate(c.publication?.at), status: 'done' as const },
    { label: 'SPK terbit, pekerjaan dimulai', date: c.spk ? fmtDate(c.spk.start) : 'Menunggu', status: c.spk ? ('done' as const) : ('current' as const) },
    {
      label: 'Pekerjaan berjalan',
      date: last ? fmtDate(last.at) : 'Belum dimulai',
      status: p >= 100 ? ('done' as const) : c.spk ? ('current' as const) : ('pending' as const),
      note: last ? `${p}% · ${last.note}` : undefined,
    },
    { label: 'Serah terima dan berita acara', date: `Target ${fmtDate(deadlineOf(c))}`, status: c.status === 'selesai' ? ('done' as const) : ('pending' as const) },
  ]
}
