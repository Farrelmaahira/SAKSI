'use client'

import type { TabProps } from '@/interfaces/dash'
import { paidOf } from '@/lib/db/paid-of'
import { valueOf } from '@/lib/db/value-of'
import { progressOf } from '@/lib/db/progress-of'
import { formatRp } from '@/lib/contracts/format-rp'
import Icon from '@/components/atoms/Icon'
import Panel from '@/components/molecules/Panel'
import { daysUntil } from '@/lib/dates/days-until'
import { isActive } from '@/lib/db/is-active'
import { fmtDate } from '@/lib/dates/fmt-date'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import { markPaid } from '@/lib/db/mark-paid'
import Locked from '@/components/atoms/Locked'

export default function TerminTab({ c, session }: TabProps) {
  const isDesa = session.role.role === 'perangkat_desa'
  const canPay = isDesa && (c.status === 'berjalan' || c.status === 'selesai')
  const paidPct = Math.round((paidOf(c) / Math.max(1, valueOf(c))) * 100)
  const ahead = paidPct - progressOf(c) > 10
  return (
    <div className="d-stack">
      <div className="d-stats d-stats-3">
        <div className="d-stat">
          <div className="d-stat-top">
            <span>Nilai kontrak</span>
          </div>
          <strong>{formatRp(valueOf(c))}</strong>
        </div>
        <div className={`d-stat ${ahead ? 'tone-red' : ''}`}>
          <div className="d-stat-top">
            <span>Sudah dibayar</span>
          </div>
          <strong>{paidPct}%</strong>
          <small>{formatRp(paidOf(c))}</small>
        </div>
        <div className="d-stat">
          <div className="d-stat-top">
            <span>Progres fisik</span>
          </div>
          <strong>{progressOf(c)}%</strong>
        </div>
      </div>
      {ahead && (
        <p className="d-callout">
          <Icon name="alert" />
          Pembayaran {paidPct}% lebih tinggi dari progres {progressOf(c)}%. Pastikan pekerjaan sudah diverifikasi sebelum membayar termin berikutnya.
        </p>
      )}
      <Panel title="Jadwal termin">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Termin</th>
                <th className="num">Persen</th>
                <th className="num">Jumlah</th>
                <th>Rencana</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {c.terms.map((t) => {
                const overdue = !t.paidDate && daysUntil(t.planDate) < 0 && isActive(c)
                return (
                  <tr key={t.no}>
                    <td>
                      <strong>{t.label}</strong>
                    </td>
                    <td className="num">{t.percent}%</td>
                    <td className="num">{formatRp(t.amount)}</td>
                    <td className={overdue ? 'is-red' : ''}>{fmtDate(t.planDate)}</td>
                    <td>
                      {t.paidDate ? (
                        <Badge tone="done">Dibayar {fmtDate(t.paidDate)}</Badge>
                      ) : canPay ? (
                        <Btn
                          small
                          variant={overdue ? 'primary' : 'ghost'}
                          onClick={() => {
                            if (window.confirm(`Tandai ${t.label.toLowerCase()} sebesar ${formatRp(t.amount)} sudah dibayar?`)) markPaid(c.code, t.no, session)
                          }}
                        >
                          Tandai dibayar
                        </Btn>
                      ) : (
                        <Badge tone={overdue ? 'red' : 'muted'}>{overdue ? 'Lewat jatuh tempo' : 'Belum dibayar'}</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {isDesa && !canPay && <Locked text="Termin bisa dibayar setelah SPK terbit dan kontrak berjalan." />}
      </Panel>
    </div>
  )
}
