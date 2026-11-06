import type { Session } from '@/interfaces/auth'
import type { DReport } from '@/interfaces/db'
import type { ReportOption } from '@/interfaces/dash'
import { isClosed } from '@/lib/db/is-closed'

/* Which actions each role can take on a report at its current stage */

export function optionsFor(s: Session, r: DReport): ReportOption[] {
  if (isClosed(r)) return []
  if (s.role.role === 'perangkat_desa') return [{ kind: 'tanggapan', label: 'Kirim tanggapan', variant: 'primary', needsText: true }]
  if (s.role.role === 'bpd') {
    if (r.flow === 'diteruskan') return []
    const list: ReportOption[] = []
    if (r.flow === 'baru') list.push({ kind: 'verifikasi', label: 'Verifikasi', variant: 'primary', needsText: false, fallback: 'Laporan sudah dicek dan sesuai kondisi lapangan.' })
    list.push(
      { kind: 'klarifikasi', label: 'Minta klarifikasi desa', variant: 'ghost', needsText: true },
      { kind: 'eskalasi', label: 'Teruskan ke Inspektorat', variant: 'dark', needsText: true },
      { kind: 'selesai', label: 'Tandai selesai', variant: 'ghost', needsText: true },
    )
    return list
  }
  if (s.role.role === 'inspektorat' && r.flow === 'diteruskan')
    return [
      { kind: 'tindak_lanjut', label: 'Tindak lanjuti', variant: 'primary', needsText: true },
      { kind: 'tutup', label: 'Tutup laporan', variant: 'ghost', needsText: true },
    ]
  return []
}
