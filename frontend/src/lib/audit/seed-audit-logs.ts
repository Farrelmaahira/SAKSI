import type { AuditLog } from '@/interfaces/audit'
import { stampFromNow } from '@/lib/dates/stamp-from-now'
import { uid } from '@/lib/dates/uid'

export const seedAuditLogs = (): AuditLog[] =>
  [
    { at: stampFromNow(-0.1), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Masuk', detail: 'Desa Sukamaju', villageId: 'sukamaju' },
    { at: stampFromNow(-0.8), actor: 'Rina Kartika', role: 'Pihak Kedua', action: 'Menyetujui draf kontrak', contractCode: 'SKS-2026-045', villageId: 'sukamaju' },
    { at: stampFromNow(-1.2), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Mengirim kontrak untuk ditinjau', contractCode: 'SKS-2026-038', villageId: 'sukamaju' },
    { at: stampFromNow(-2), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Mencatat progres 60%', contractCode: 'SKS-2026-014', villageId: 'sukamaju' },
    { at: stampFromNow(-4), actor: 'Nina Marlina', role: 'BPD', action: 'Meneruskan laporan ke Inspektorat', detail: 'LPR-2026-0091', contractCode: 'SKS-2026-019', villageId: 'cibodas' },
    { at: stampFromNow(-5), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Menyimpan draf kontrak', contractCode: 'SKS-2026-041', villageId: 'sukamaju' },
    { at: stampFromNow(-6), actor: 'Dodi Kurnia', role: 'BPD', action: 'Meneruskan laporan ke Inspektorat', detail: 'LPR-2026-0093', contractCode: 'SKS-2026-027', villageId: 'mekarsari' },
    { at: stampFromNow(-12), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Menandai termin 1 dibayar', contractCode: 'SKS-2026-014', villageId: 'sukamaju' },
    { at: stampFromNow(-20), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Mempublikasikan kontrak', contractCode: 'SKS-2026-014', villageId: 'sukamaju' },
    { at: stampFromNow(-20.1), actor: 'Hendra Wijaya', role: 'Perangkat Desa', action: 'Menyegel dokumen kontrak', contractCode: 'SKS-2026-014', villageId: 'sukamaju' },
  ].map((e) => ({ ...e, id: uid('log-') }))
