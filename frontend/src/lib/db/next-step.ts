import type { DContract } from '@/interfaces/db'
import type { RoleKey } from '@/interfaces/auth'
import { openCritical } from '@/lib/db/open-critical'
import { daysUntil } from '@/lib/dates/days-until'
import { fmtDate } from '@/lib/dates/fmt-date'

/* What should happen next, in plain words. Used on the overview tab and in "perlu tindakan" lists. */
export function nextStep(c: DContract): { tab: string; text: string; who: RoleKey } | null {
  if (c.status === 'draf' || c.status === 'diaudit')
    return openCritical(c) ? { tab: 'audit', text: 'Perbaiki temuan kritis dari audit AI', who: 'perangkat_desa' } : { tab: 'ringkasan', text: 'Kirim draf ke pihak kedua untuk ditinjau', who: 'perangkat_desa' }
  if (c.status === 'ditinjau') {
    if (c.reviewDecision === 'revisi') return { tab: 'draf', text: 'Pihak kedua meminta revisi. Perbarui pasal lalu kirim versi baru', who: 'perangkat_desa' }
    if (c.reviewDecision !== 'setuju') return { tab: 'peninjauan', text: 'Menunggu tinjauan pihak kedua', who: 'pihak_kedua' }
    if (!c.signatures.desa || !c.signatures.meterai) return { tab: 'tanda-tangan', text: 'Tanda tangani kontrak dan bubuhkan e-meterai', who: 'perangkat_desa' }
    return { tab: 'tanda-tangan', text: 'Menunggu tanda tangan pihak kedua', who: 'pihak_kedua' }
  }
  if (c.status === 'ditandatangani')
    return !c.seals.length ? { tab: 'segel', text: 'Segel dokumen dengan hash SHA-256', who: 'perangkat_desa' } : { tab: 'publikasi', text: 'Publikasikan kontrak ke portal warga', who: 'perangkat_desa' }
  if (c.status === 'dipublikasikan') return { tab: 'spk', text: 'Terbitkan SPK supaya pekerjaan bisa dimulai', who: 'perangkat_desa' }
  if (c.status === 'berjalan') {
    const due = c.terms.find((t) => !t.paidDate && daysUntil(t.planDate) <= 7)
    if (due) return { tab: 'termin', text: `${due.label} jatuh tempo ${fmtDate(due.planDate)}`, who: 'perangkat_desa' }
    return { tab: 'progres', text: 'Perbarui progres pekerjaan secara berkala', who: 'perangkat_desa' }
  }
  return null
}
