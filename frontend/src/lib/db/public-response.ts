import type { DReport } from '@/interfaces/db'

export const publicResponse = (r: DReport) => [...r.actions].reverse().find((a) => a.kind !== 'klarifikasi' && a.kind !== 'verifikasi' && a.kind !== 'eskalasi')?.text
