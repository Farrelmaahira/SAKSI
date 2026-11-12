'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import { isLate } from '@/lib/db/is-late'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isClosed } from '@/lib/db/is-closed'
import PageHead from '@/components/molecules/PageHead'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { greeting } from '@/lib/dash/greeting'
import Stat from '@/components/molecules/Stat'
import StatGrid from '@/components/molecules/StatGrid'
import Panel from '@/components/molecules/Panel'
import Link from 'next/link'
import Btn from '@/components/atoms/Btn'
import Empty from '@/components/molecules/Empty'
import ContractMini from '@/components/molecules/ContractMini'
import ActivityFeed from '@/components/molecules/ActivityFeed'

export default function BpdHome() {
  const { session } = useDash()
  const d = db.use()
  const r = session.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const fresh = reports.filter((x) => x.flow === 'baru')
  const late = contracts.filter(isLate)
  const waitingDesa = reports.filter((x) => x.actions.some((a) => a.kind === 'klarifikasi') && !desaAnswered(x) && !isClosed(x))

  return (
    <>
      <PageHead label={`Beranda · BPD ${wilayahLabel(r)}`} title={`${greeting()}, ${session.name.split(' ')[0]}.`} desc="Awasi kontrak desa dan tindak lanjuti laporan warga. Semua data kontrak hanya bisa dibaca." />
      <StatGrid cols={4}>
        <Stat label="Kontrak di desa" value={contracts.length} icon="file" to="/dashboard/kontrak" />
        <Stat label="Laporan warga baru" value={fresh.length} icon="flag" tone={fresh.length ? 'red' : 'blue'} to="/dashboard/laporan" />
        <Stat label="Kontrak terlambat" value={late.length} icon="clock" tone={late.length ? 'red' : 'blue'} />
        <Stat label="Menunggu klarifikasi desa" value={waitingDesa.length} icon="alert" tone="ink" />
      </StatGrid>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Laporan warga baru" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/laporan">Buka laporan</Link>}>
          {fresh.length ? (
            <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
              {fresh.map((x) => (
                <li key={x.id}>
                  <div>
                    <strong>{x.category}</strong>
                    <small>
                      <code>{x.id}</code> · {x.text}
                    </small>
                  </div>
                  <Btn small variant="ghost" to="/dashboard/laporan">
                    Verifikasi
                  </Btn>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Tidak ada laporan baru." />
          )}
        </Panel>
        <Panel title="Kontrak terlambat">{late.length ? <div className="grid gap-10">{late.map((c) => <ContractMini key={c.code} c={c} />)}</div> : <Empty title="Tidak ada kontrak yang terlambat." />}</Panel>
      </div>
      <Panel title="Aktivitas di desa" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/jejak-audit">Jejak audit</Link>}>
        <ActivityFeed limit={6} />
      </Panel>
    </>
  )
}
