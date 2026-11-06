import type { ActionKind, ReportFlow } from '@/interfaces/db'

export const nextFlow = (flow: ReportFlow, kind: ActionKind): ReportFlow =>
  kind === 'verifikasi' ? 'diverifikasi' : kind === 'eskalasi' ? 'diteruskan' : kind === 'selesai' || kind === 'tindak_lanjut' ? 'ditindaklanjuti' : kind === 'tutup' ? 'ditutup' : flow
