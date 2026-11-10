import type { AuditFilter } from '@/interfaces/dash'

/* audit_logs.aksi written by the backend (plan section 7.4) -> readable label and chip group */
export const auditActions: Record<string, { label: string; kind: Exclude<AuditFilter, 'semua'> }> = {
  'contract.create': { label: 'Membuat kontrak', kind: 'kontrak' },
  'contract.revise': { label: 'Merevisi kontrak', kind: 'kontrak' },
  'contract.audit': { label: 'Mengaudit kontrak', kind: 'kontrak' },
  'contract.publish': { label: 'Mempublikasikan kontrak', kind: 'kontrak' },
  'contract.review': { label: 'Meninjau kontrak', kind: 'kontrak' },
  'contract.sign': { label: 'Menandatangani kontrak', kind: 'kontrak' },
  'contract.seal': { label: 'Menyegel kontrak', kind: 'kontrak' },
  'contract.termin_set': { label: 'Mengatur jadwal termin', kind: 'kontrak' },
  'contract.spk_set': { label: 'Menerbitkan SPK', kind: 'kontrak' },
  'contract.progress': { label: 'Melaporkan progres', kind: 'kontrak' },
  'contract.termin_paid': { label: 'Membayar termin', kind: 'kontrak' },
  'contract.lhp_create': { label: 'Menyusun LHP', kind: 'kontrak' },
  'contract.lhp_publish': { label: 'Menerbitkan LHP', kind: 'kontrak' },
  'contract.oversight_assign': { label: 'Menugaskan pengawas', kind: 'kontrak' },
  'contract.report_action': { label: 'Menindaklanjuti laporan warga', kind: 'laporan' },
  'region_rule.create': { label: 'Menetapkan aturan wilayah', kind: 'akun' },
  'user.profile_update': { label: 'Memperbarui profil', kind: 'akun' },
  'user.password_change': { label: 'Mengubah kata sandi', kind: 'akun' },
  'user.password_reset': { label: 'Mengatur ulang kata sandi', kind: 'akun' },
}
