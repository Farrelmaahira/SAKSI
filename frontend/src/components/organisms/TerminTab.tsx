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
import { useConfirm } from '@/hooks/use-confirm'

export default function TerminTab({ c, session }: TabProps) {
  const confirm = useConfirm()
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
                    <td className="num" data-label="Persen">{t.percent}%</td>
                    <td className="num" data-label="Jumlah">{formatRp(t.amount)}</td>
                    <td className={overdue ? 'is-red' : ''} data-label="Rencana">{fmtDate(t.planDate)}</td>
                    <td data-label="Status">
                      {t.paidDate ? (
                        <Badge tone="done">Dibayar {fmtDate(t.paidDate)}</Badge>
                      ) : canPay ? (
                        <Btn
                          small
                          variant={overdue ? 'primary' : 'ghost'}
                          onClick={async () => {
                            const ok = await confirm({
                              title: `Tandai ${t.label.toLowerCase()} sudah dibayar?`,
                              text: `Pembayaran sebesar ${formatRp(t.amount)} akan dicatat sebagai sudah dibayar dan tampil di riwayat kontrak.`,
                              confirmLabel: 'Ya, sudah dibayar',
                              art: 'all-checked_d3u6',
                            })
                            if (ok) markPaid(c.code, t.no, session)
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
