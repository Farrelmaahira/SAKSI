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
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] d-stats">
        <Stat label="Sudah diterima" value={formatRp(paid.reduce((s, x) => s + x.t.amount, 0))} icon="check" />
        <Stat label="Belum dibayar" value={formatRp(pending.reduce((s, x) => s + x.t.amount, 0))} icon="clock" tone="ink" />
        <Stat label="Lewat jatuh tempo" value={pending.filter((x) => daysUntil(x.t.planDate) < 0).length} icon="alert" tone={pending.some((x) => daysUntil(x.t.planDate) < 0) ? 'red' : 'blue'} />
      </div>
      <Panel>
        {rows.length ? (
          <div className="my-0 -mx-20 overflow-x-auto py-0 px-20 md:my-0 md:-mx-24 md:py-0 md:px-24">
            <table className="[border-collapse:collapse] text-[1.4rem] min-w-720 w-full [&_th]:border-b-[0.15rem] [&_th]:border-b-ink [&_th]:[border-bottom-style:solid] [&_th]:text-[1.2rem] [&_th]:font-[400] [&_th]:tracking-[0.04em] [&_th]:text-dim [&_th]:pt-0 [&_th]:pr-12 [&_th]:pb-10 [&_th]:pl-0 [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_td]:border-b-[0.1rem] [&_td]:border-b-[#ececea] [&_td]:[border-bottom-style:solid] [&_td]:pt-14 [&_td]:pr-12 [&_td]:pb-14 [&_td]:pl-0 [&_td]:align-middle [&_tbody_tr:hover_td]:bg-soft [&_td_a:not(.d-row-link):not(.d-step)]:text-blue [&_td_a:not(.d-row-link):not(.d-step)]:font-code [&_td_a:not(.d-row-link):not(.d-step)]:text-[1.25rem] max-md:min-w-0 max-md:[&_thead]:[clip-path:inset(50%)] max-md:[&_thead]:h-1 max-md:[&_thead]:overflow-hidden max-md:[&_thead]:absolute max-md:[&_thead]:w-1 max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block! max-md:[&_td]:block! max-md:[&_tr]:border-b-[0.1rem] max-md:[&_tr]:border-b-[#ececea] max-md:[&_tr]:[border-bottom-style:solid] max-md:[&_tr]:py-12 max-md:[&_tr]:px-0 max-md:[&_td]:border-0 max-md:[&_td]:border-none max-md:[&_td]:min-h-28 max-md:[&_td]:pt-4 max-md:[&_td]:pr-0 max-md:[&_td]:pb-4 max-md:[&_td]:pl-110 max-md:[&_td]:relative! max-md:[&_td]:text-left max-md:[&_td]:whitespace-normal max-md:[&_td:not([data-label])]:pl-0 max-md:[&_td[data-label]::before]:text-dim max-md:[&_td[data-label]::before]:content-[attr(data-label)] max-md:[&_td[data-label]::before]:text-[1.15rem] max-md:[&_td[data-label]::before]:left-0 max-md:[&_td[data-label]::before]:tracking-[0.04em] max-md:[&_td[data-label]::before]:leading-[2rem] max-md:[&_td[data-label]::before]:absolute max-md:[&_td[data-label]::before]:uppercase max-md:[&_td[data-label]::before]:top-6 max-md:[&_td[data-label]::before]:w-100 max-md:[&_tbody_tr:hover_td]:[background:none] d-table">
              <thead>
                <tr>
                  <th>Kontrak</th>
                  <th>Termin</th>
                  <th className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal">Jumlah</th>
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
                        <Link className="grid gap-2 min-w-220 [&_code]:text-[1.2rem] [&_code]:text-dim [&_strong]:font-[420] [&_strong]:[transition:color_0.2s] [&:hover_strong]:text-blue [&_small]:text-[1.25rem]! [&_small]:text-dim! max-md:min-w-0 d-row-link" href={`/dashboard/kontrak/${c.code}?tab=termin`}>
                          <code>{c.code}</code>
                          <strong>{c.title}</strong>
                        </Link>
                      </td>
                      <td data-label="Termin">
                        {t.label} · {t.percent}%
                      </td>
                      <td className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal" data-label="Jumlah">{formatRp(t.amount)}</td>
                      <td className={late ? '[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic' : ''} data-label="Rencana">{fmtDate(t.planDate)}</td>
                      <td data-label="Status">{t.paidDate ? <Badge tone="done">Dibayar {fmtDate(t.paidDate)}</Badge> : <Badge tone={late ? 'red' : 'muted'}>{late ? 'Lewat jatuh tempo' : 'Menunggu'}</Badge>}</td>
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
