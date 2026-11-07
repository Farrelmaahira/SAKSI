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
      <div className="d-stats d-stats-3">
        <Stat label="Kontrak berjalan" value={rows.length} icon="file" />
        <Stat label="Total dibayar" value={formatRp(rows.reduce((s, x) => s + paidOf(x.c), 0))} icon="wallet" tone="ink" />
        <Stat label="Pembayaran mendahului progres" value={flagged.length} icon="alert" tone={flagged.length ? 'red' : 'blue'} />
      </div>
      <Panel>
        {rows.length ? (
          <ul className="d-compare">
            {rows.map(({ c, paidPct, prog, gap }) => (
              <li key={c.code} className={gap > 10 ? 'is-flag' : ''}>
                <Link href={`/dashboard/kontrak/${c.code}?tab=termin`} className="d-compare-title">
                  <code>{c.code}</code>
                  <strong>{c.title}</strong>
                  <small>
                    {villageById(c.villageId)?.name} · {formatRp(valueOf(c))}
                  </small>
                </Link>
                <div className="d-compare-bars">
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
