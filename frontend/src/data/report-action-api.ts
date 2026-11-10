import type { ActionKind } from '@/interfaces/db'

type Body = { tindakan: 'klarifikasi' | 'eskalasi' | 'selesai'; status?: string; diteruskanKeRole?: 'bpd' | 'inspektorat' }

/* Dashboard report buttons -> POST /reports/{id}/actions body (status rules in plan section 7.11) */
export const reportActionApi: Partial<Record<ActionKind, Body>> = {
  tanggapan: { tindakan: 'klarifikasi' },
  verifikasi: { tindakan: 'klarifikasi', status: 'diverifikasi' },
  klarifikasi: { tindakan: 'klarifikasi' },
  eskalasi: { tindakan: 'eskalasi', diteruskanKeRole: 'inspektorat' },
  selesai: { tindakan: 'selesai' },
  tindak_lanjut: { tindakan: 'klarifikasi', status: 'ditindaklanjuti' },
  tutup: { tindakan: 'selesai' },
}
