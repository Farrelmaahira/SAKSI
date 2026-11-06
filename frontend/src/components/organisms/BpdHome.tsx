'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import { isLate } from '@/lib/db/is-late'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isClosed } from '@/lib/db/is-closed'
import PageHead from '@/components/molecules/PageHead'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { greeting } from '@/lib/dash/greeting'
import Stat from '@/components/molecules/Stat'
import Panel from '@/components/molecules/Panel'
import Link from 'next/link'
import Btn from '@/components/atoms/Btn'
import Empty from '@/components/molecules/Empty'
import ContractMini from '@/components/molecules/ContractMini'
import Activity from '@/components/molecules/Activity'
import { scopeLogs } from '@/lib/db/scope-logs'

export default function BpdHome() {
  const { session } = useDash()
  const d = db.use()
  const logs = auditStore.use()
  const r = session.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const fresh = reports.filter((x) => x.flow === 'baru')
  const late = contracts.filter(isLate)
  const waitingDesa = reports.filter((x) => x.actions.some((a) => a.kind === 'klarifikasi') && !desaAnswered(x) && !isClosed(x))

  return (
    <>
      <PageHead label={`Beranda · BPD ${wilayahLabel(r)}`} title={`${greeting()}, ${session.name.split(' ')[0]}.`} desc="Awasi kontrak desa dan tindak lanjuti laporan warga. Semua data kontrak hanya bisa dibaca." />
      <div className="d-stats d-stats-4">
        <Stat label="Kontrak di desa" value={contracts.length} icon="file" to="/dashboard/kontrak" />
        <Stat label="Laporan warga baru" value={fresh.length} icon="flag" tone={fresh.length ? 'red' : 'blue'} to="/dashboard/laporan" />
        <Stat label="Kontrak terlambat" value={late.length} icon="clock" tone={late.length ? 'red' : 'blue'} />
        <Stat label="Menunggu klarifikasi desa" value={waitingDesa.length} icon="alert" tone="ink" />
      </div>
      <div className="d-grid-2">
        <Panel title="Laporan warga baru" action={<Link className="d-link" href="/dashboard/laporan">Buka laporan</Link>}>
          {fresh.length ? (
            <ul className="d-list">
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
        <Panel title="Kontrak terlambat">{late.length ? <div className="d-minis">{late.map((c) => <ContractMini key={c.code} c={c} />)}</div> : <Empty title="Tidak ada kontrak yang terlambat." />}</Panel>
      </div>
      <Panel title="Aktivitas di desa" action={<Link className="d-link" href="/dashboard/jejak-audit">Jejak audit</Link>}>
        <Activity logs={scopeLogs(logs, r, d).slice(0, 6)} />
      </Panel>
    </>
  )
}
