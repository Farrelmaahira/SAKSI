import type { TerminLine } from '@/interfaces/dash'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import { formatRp } from '@/lib/contracts/format-rp'
import { daysUntil } from '@/lib/dates/days-until'
import Panel from '@/components/molecules/Panel'
import Link from 'next/link'
import { fmtDate } from '@/lib/dates/fmt-date'
import Badge from '@/components/atoms/Badge'
import Empty from '@/components/molecules/Empty'

export default function PihakTermin({ contracts }: TerminLine) {
  const rows = contracts.flatMap((c) => c.terms.map((t) => ({ c, t })))
  const paid = rows.filter((x) => x.t.paidDate)
  const pending = rows.filter((x) => !x.t.paidDate)
  return (
    <>
      <PageHead label="Termin" title="Termin pembayaran" desc="Jadwal pembayaran dari desa untuk kontrak yang sedang berjalan. Pembayaran ditandai oleh desa." />
      <div className="d-stats d-stats-3">
        <Stat label="Sudah diterima" value={formatRp(paid.reduce((s, x) => s + x.t.amount, 0))} icon="check" />
        <Stat label="Belum dibayar" value={formatRp(pending.reduce((s, x) => s + x.t.amount, 0))} icon="clock" tone="ink" />
        <Stat label="Lewat jatuh tempo" value={pending.filter((x) => daysUntil(x.t.planDate) < 0).length} icon="alert" tone={pending.some((x) => daysUntil(x.t.planDate) < 0) ? 'red' : 'blue'} />
      </div>
      <Panel>
        {rows.length ? (
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Kontrak</th>
                  <th>Termin</th>
                  <th className="num">Jumlah</th>
                  <th>Rencana</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ c, t }) => {
                  const late = !t.paidDate && daysUntil(t.planDate) < 0
                  return (
                    <tr key={`${c.code}-${t.no}`}>
                      <td>
                        <Link className="d-row-link" href={`/dashboard/kontrak/${c.code}?tab=termin`}>
                          <code>{c.code}</code>
                          <strong>{c.title}</strong>
                        </Link>
                      </td>
                      <td>
                        {t.label} · {t.percent}%
                      </td>
                      <td className="num">{formatRp(t.amount)}</td>
                      <td className={late ? 'is-red' : ''}>{fmtDate(t.planDate)}</td>
                      <td>{t.paidDate ? <Badge tone="done">Dibayar {fmtDate(t.paidDate)}</Badge> : <Badge tone={late ? 'red' : 'muted'}>{late ? 'Lewat jatuh tempo' : 'Menunggu'}</Badge>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Belum ada termin." text="Termin muncul setelah kontrak ditandatangani." />
        )}
      </Panel>
    </>
  )
}
