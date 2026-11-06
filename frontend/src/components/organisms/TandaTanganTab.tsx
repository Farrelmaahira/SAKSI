'use client'

import type { TabProps } from '@/interfaces/dash'
import { statusOrder } from '@/data/db'
import { villageById } from '@/lib/master/village-by-id'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import { sign } from '@/lib/db/sign'
import { applyMeterai } from '@/lib/db/apply-meterai'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import Panel from '@/components/molecules/Panel'
import Icon from '@/components/atoms/Icon'
import Btn from '@/components/atoms/Btn'

export default function TandaTanganTab({ c, session }: TabProps) {
  const r = session.role.role
  const approved = c.reviewDecision === 'setuju' || statusOrder.indexOf(c.status) >= statusOrder.indexOf('ditandatangani')
  const s = c.signatures
  const steps = [
    {
      key: 'desa',
      title: 'Tanda tangan Kepala Desa',
      who: `Pemerintah ${villageById(c.villageId)?.name}`,
      done: s.desa ? `${s.desa.by} · ${fmtDateTime(s.desa.at)}` : null,
      can: r === 'perangkat_desa' && approved && !s.desa,
      action: () => sign(c.code, 'desa', session),
      label: 'Tanda tangani',
      wait: approved ? null : 'Menunggu persetujuan pihak kedua',
    },
    {
      key: 'meterai',
      title: 'E-meterai Rp10.000',
      who: 'Dibubuhkan desa (simulasi)',
      done: s.meterai ? `No. seri ${s.meterai.serial} · ${fmtDateTime(s.meterai.at)}` : null,
      can: r === 'perangkat_desa' && Boolean(s.desa) && !s.meterai,
      action: () => applyMeterai(c.code, session),
      label: 'Bubuhkan e-meterai',
      wait: s.desa ? null : 'Setelah tanda tangan Kepala Desa',
    },
    {
      key: 'pihak',
      title: 'Tanda tangan pihak kedua',
      who: counterpartyById(c.counterpartyId)?.name ?? 'Pihak kedua',
      done: s.pihak ? `${s.pihak.by} · ${fmtDateTime(s.pihak.at)}` : null,
      can: r === 'pihak_kedua' && Boolean(s.desa && s.meterai) && !s.pihak,
      action: () => sign(c.code, 'pihak', session),
      label: 'Tanda tangani',
      wait: s.desa && s.meterai ? null : 'Setelah desa menandatangani dan e-meterai dibubuhkan',
    },
  ]
  return (
    <Panel title="Tanda tangan elektronik" desc="Urutan: Kepala Desa, e-meterai, lalu pihak kedua. Tanda tangan dan e-meterai di prototipe ini adalah simulasi.">
      <ol className="d-sign">
        {steps.map((x, i) => (
          <li key={x.key} className={x.done ? 'is-done' : x.can ? 'is-on' : ''}>
            <span className="d-sign-no">{x.done ? <Icon name="check" /> : i + 1}</span>
            <div>
              <strong>{x.title}</strong>
              <small>{x.who}</small>
              {x.done ? <p className="d-ok">{x.done}</p> : x.wait && <p className="d-muted">{x.wait}</p>}
            </div>
            {x.can && <Btn onClick={x.action}>{x.label}</Btn>}
          </li>
        ))}
      </ol>
      {s.desa && s.pihak && s.meterai && <p className="d-ok"><Icon name="check" /> Tanda tangan lengkap. Kontrak sah dan siap disegel.</p>}
    </Panel>
  )
}
