import { statusOrder } from '@/data/db'
import type { RoleKey } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'

export type SignKey = 'desa' | 'meterai' | 'pihak'

export interface SignStep {
  key: SignKey
  title: string
  who: string
  /* who signed and when, once done */
  done: string | null
  /* this role can do it now */
  can: boolean
  label: string
  /* why it cannot be done yet */
  wait: string | null
}

/* The three signing steps in order: village head, e-meterai, second party. */
export function signSteps(c: DContract, role: RoleKey): SignStep[] {
  const s = c.signatures
  const approved = c.reviewDecision === 'setuju' || statusOrder.indexOf(c.status) >= statusOrder.indexOf('ditandatangani')
  return [
    { key: 'desa', title: 'Tanda tangan Kepala Desa', who: `Pemerintah ${villageById(c.villageId)?.name}`, done: s.desa ? `${s.desa.by} · ${fmtDateTime(s.desa.at)}` : null, can: role === 'perangkat_desa' && approved && !s.desa, label: 'Tanda tangani', wait: approved ? null : 'Menunggu persetujuan pihak kedua' },
    { key: 'meterai', title: 'E-meterai Rp10.000', who: 'Dibubuhkan desa (simulasi)', done: s.meterai ? `No. seri ${s.meterai.serial} · ${fmtDateTime(s.meterai.at)}` : null, can: role === 'perangkat_desa' && Boolean(s.desa) && !s.meterai, label: 'Bubuhkan e-meterai', wait: s.desa ? null : 'Setelah tanda tangan Kepala Desa' },
    { key: 'pihak', title: 'Tanda tangan pihak kedua', who: counterpartyById(c.counterpartyId)?.name ?? 'Pihak kedua', done: s.pihak ? `${s.pihak.by} · ${fmtDateTime(s.pihak.at)}` : null, can: role === 'pihak_kedua' && approved && Boolean(s.desa && s.meterai) && !s.pihak, label: 'Tanda tangani', wait: s.desa && s.meterai ? null : 'Setelah desa menandatangani dan e-meterai dibubuhkan' },
  ]
}
