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
    <div className="grid gap-20 [&>*]:min-w-0">
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] d-stats">
        <div className="bg-white rounded-[1.8rem] grid gap-6 grid-rows-[minmax(3.4rem,auto)_auto_1fr] min-w-0 py-16 px-18 [transition:box-shadow_0.25s,_transform_0.25s] [a&:hover]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [a&:hover]:[transform:translate(-0.2rem,_-0.2rem)] [&_strong]:text-[3.4rem] [&_strong]:font-[320] [&_strong]:tracking-[-0.03em] [&_strong]:leading-[1] [&_strong]:wrap-anywhere [&.tone-blue_strong]:text-blue [&.tone-red_strong]:text-red! [&_small]:[align-self:end] [&_small]:text-[1.25rem] [&_small]:text-dim max-lg:[&_strong[data-long]]:text-[2rem] max-lg:[&_strong[data-long]]:[overflow-wrap:normal] max-lg:[&_strong[data-long]]:whitespace-nowrap md:max-lg:[&_strong[data-long]]:text-[2.6rem] max-md:[.d-stats>&:last-child:nth-child(odd)]:[grid-column:span_2]">
          <div className="items-start flex text-[1.3rem] gap-10 justify-between leading-[1.3] text-dim">
            <span>Nilai kontrak</span>
          </div>
          <strong>{formatRp(valueOf(c))}</strong>
        </div>
        <div className={`bg-white rounded-[1.8rem] grid gap-6 grid-rows-[minmax(3.4rem,auto)_auto_1fr] min-w-0 py-16 px-18 [transition:box-shadow_0.25s,_transform_0.25s] [a&:hover]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [a&:hover]:[transform:translate(-0.2rem,_-0.2rem)] [&_strong]:text-[3.4rem] [&_strong]:font-[320] [&_strong]:tracking-[-0.03em] [&_strong]:leading-[1] [&_strong]:wrap-anywhere [&.tone-blue_strong]:text-blue [&.tone-red_strong]:text-red! [&_small]:[align-self:end] [&_small]:text-[1.25rem] [&_small]:text-dim max-lg:[&_strong[data-long]]:text-[2rem] max-lg:[&_strong[data-long]]:[overflow-wrap:normal] max-lg:[&_strong[data-long]]:whitespace-nowrap md:max-lg:[&_strong[data-long]]:text-[2.6rem] max-md:[.d-stats>&:last-child:nth-child(odd)]:[grid-column:span_2] ${ahead ? 'tone-red' : ''}`}>
          <div className="items-start flex text-[1.3rem] gap-10 justify-between leading-[1.3] text-dim">
            <span>Sudah dibayar</span>
          </div>
          <strong>{paidPct}%</strong>
          <small>{formatRp(paidOf(c))}</small>
        </div>
        <div className="bg-white rounded-[1.8rem] grid gap-6 grid-rows-[minmax(3.4rem,auto)_auto_1fr] min-w-0 py-16 px-18 [transition:box-shadow_0.25s,_transform_0.25s] [a&:hover]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [a&:hover]:[transform:translate(-0.2rem,_-0.2rem)] [&_strong]:text-[3.4rem] [&_strong]:font-[320] [&_strong]:tracking-[-0.03em] [&_strong]:leading-[1] [&_strong]:wrap-anywhere [&.tone-blue_strong]:text-blue [&.tone-red_strong]:text-red! [&_small]:[align-self:end] [&_small]:text-[1.25rem] [&_small]:text-dim max-lg:[&_strong[data-long]]:text-[2rem] max-lg:[&_strong[data-long]]:[overflow-wrap:normal] max-lg:[&_strong[data-long]]:whitespace-nowrap md:max-lg:[&_strong[data-long]]:text-[2.6rem] max-md:[.d-stats>&:last-child:nth-child(odd)]:[grid-column:span_2]">
          <div className="items-start flex text-[1.3rem] gap-10 justify-between leading-[1.3] text-dim">
            <span>Progres fisik</span>
          </div>
          <strong>{progressOf(c)}%</strong>
        </div>
      </div>
      {ahead && (
        <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
          <Icon name="alert" />
          Pembayaran {paidPct}% lebih tinggi dari progres {progressOf(c)}%. Pastikan pekerjaan sudah diverifikasi sebelum membayar termin berikutnya.
        </p>
      )}
      <Panel title="Jadwal termin">
        <div className="my-0 -mx-20 overflow-x-auto py-0 px-20 md:my-0 md:-mx-24 md:py-0 md:px-24">
          <table className="[border-collapse:collapse] text-[1.4rem] min-w-720 w-full [&_th]:border-b-[0.15rem] [&_th]:border-b-ink [&_th]:[border-bottom-style:solid] [&_th]:text-[1.2rem] [&_th]:font-[400] [&_th]:tracking-[0.04em] [&_th]:text-dim [&_th]:pt-0 [&_th]:pr-12 [&_th]:pb-10 [&_th]:pl-0 [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_td]:border-b-[0.1rem] [&_td]:border-b-[#ececea] [&_td]:[border-bottom-style:solid] [&_td]:pt-14 [&_td]:pr-12 [&_td]:pb-14 [&_td]:pl-0 [&_td]:align-middle [&_tbody_tr:hover_td]:bg-soft [&_td_a:not(.d-row-link):not(.d-step)]:text-blue [&_td_a:not(.d-row-link):not(.d-step)]:font-code [&_td_a:not(.d-row-link):not(.d-step)]:text-[1.25rem] max-md:min-w-0 max-md:[&_thead]:[clip-path:inset(50%)] max-md:[&_thead]:h-1 max-md:[&_thead]:overflow-hidden max-md:[&_thead]:absolute max-md:[&_thead]:w-1 max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block! max-md:[&_td]:block! max-md:[&_tr]:border-b-[0.1rem] max-md:[&_tr]:border-b-[#ececea] max-md:[&_tr]:[border-bottom-style:solid] max-md:[&_tr]:py-12 max-md:[&_tr]:px-0 max-md:[&_td]:border-0 max-md:[&_td]:border-none max-md:[&_td]:min-h-28 max-md:[&_td]:pt-4 max-md:[&_td]:pr-0 max-md:[&_td]:pb-4 max-md:[&_td]:pl-110 max-md:[&_td]:relative! max-md:[&_td]:text-left max-md:[&_td]:whitespace-normal max-md:[&_td:not([data-label])]:pl-0 max-md:[&_td[data-label]::before]:text-dim max-md:[&_td[data-label]::before]:content-[attr(data-label)] max-md:[&_td[data-label]::before]:text-[1.15rem] max-md:[&_td[data-label]::before]:left-0 max-md:[&_td[data-label]::before]:tracking-[0.04em] max-md:[&_td[data-label]::before]:leading-[2rem] max-md:[&_td[data-label]::before]:absolute max-md:[&_td[data-label]::before]:uppercase max-md:[&_td[data-label]::before]:top-6 max-md:[&_td[data-label]::before]:w-100 max-md:[&_tbody_tr:hover_td]:[background:none] d-table">
            <thead>
              <tr>
                <th>Termin</th>
                <th className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal">Persen</th>
                <th className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal">Jumlah</th>
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
                    <td className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal" data-label="Persen">{t.percent}%</td>
                    <td className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal" data-label="Jumlah">{formatRp(t.amount)}</td>
                    <td className={overdue ? '[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic' : ''} data-label="Rencana">{fmtDate(t.planDate)}</td>
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
