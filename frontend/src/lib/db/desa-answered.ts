import type { DReport } from '@/interfaces/db'

export const desaAnswered = (r: DReport) => {
  const lastClar = r.actions.map((a) => a.kind).lastIndexOf('klarifikasi')
  const lastAns = r.actions.map((a) => a.kind).lastIndexOf('tanggapan')
  return lastAns >= 0 && lastAns > lastClar
}
