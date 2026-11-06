import { stampFromNow } from '@/lib/dates/stamp-from-now'

export const signed = (desa: string, pihak: string, d: number, serial: string) => ({
  desa: { by: desa, at: stampFromNow(d) },
  pihak: { by: pihak, at: stampFromNow(d) },
  meterai: { serial, at: stampFromNow(d) },
})
