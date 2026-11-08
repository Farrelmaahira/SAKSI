import type { TerminLine } from '@/interfaces/dash'
import { paidOf } from '@/lib/db/paid-of'
import { valueOf } from '@/lib/db/value-of'
import { progressOf } from '@/lib/db/progress-of'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import { formatRp } from '@/lib/contracts/format-rp'
import Panel from '@/components/molecules/Panel'
import Link from 'next/link'
import { villageById } from '@/lib/master/village-by-id'
import Bar from '@/components/atoms/Bar'
import Badge from '@/components/atoms/Badge'
import Empty from '@/components/molecules/Empty'

export default function InspTermin({ contracts }: TerminLine) {
  const rows = contracts
    .map((c) => {
      const paidPct = Math.round((paidOf(c) / Math.max(1, valueOf(c))) * 100)
      return { c, paidPct, prog: progressOf(c), gap: paidPct - progressOf(c) }
    })
    .sort((a, b) => b.gap - a.gap)
  const flagged = rows.filter((x) => x.gap > 10)
  return (
    <>
      <PageHead label="Termin vs realisasi" title="Termin dibanding progres fisik" desc="Pembayaran yang jauh mendahului progres pekerjaan perlu diperiksa. Batas perhatian: selisih lebih dari 10 poin." />
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] d-stats">
        <Stat label="Kontrak berjalan" value={rows.length} icon="file" />
        <Stat label="Total dibayar" value={formatRp(rows.reduce((s, x) => s + paidOf(x.c), 0))} icon="wallet" tone="ink" />
        <Stat label="Pembayaran mendahului progres" value={flagged.length} icon="alert" tone={flagged.length ? 'red' : 'blue'} />
      </div>
      <Panel>
        {rows.length ? (
          <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:grid [&_li]:gap-12 [&_li]:py-16 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 md:[&_li]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:[&_li]:gap-24 d-compare">
            {rows.map(({ c, paidPct, prog, gap }) => (
              <li key={c.code} className={gap > 10 ? 'is-flag' : ''}>
                <Link href={`/dashboard/kontrak/${c.code}?tab=termin`} className="grid gap-2 [&_code]:text-[1.2rem] [&_code]:text-dim [&_strong]:font-[420] [&:hover_strong]:text-blue [&_small]:text-[1.25rem]! [&_small]:text-dim!">
                  <code>{c.code}</code>
                  <strong>{c.title}</strong>
                  <small>
                    {villageById(c.villageId)?.name} · {formatRp(valueOf(c))}
                  </small>
                </Link>
                <div className="grid gap-6 [&_div]:items-center [&_div]:grid [&_div]:text-[1.25rem] [&_div]:gap-10 [&_div]:grid-cols-[6.4rem_1fr_4rem] [&_b]:font-[450] [&_b]:text-right">
                  <div>
                    <span>Dibayar</span>
                    <Bar value={paidPct} tone={gap > 10 ? 'red' : 'blue'} />
                    <b>{paidPct}%</b>
                  </div>
                  <div>
                    <span>Progres</span>
                    <Bar value={prog} />
                    <b>{prog}%</b>
                  </div>
                </div>
                {gap > 10 ? <Badge tone="red">Selisih {gap} poin</Badge> : <Badge tone="done">Wajar</Badge>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Belum ada kontrak berjalan di wilayah ini." />
        )}
      </Panel>
    </>
  )
}
