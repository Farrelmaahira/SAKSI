'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import { villages } from '@/data/master'
import { riskOf } from '@/lib/db/risk-of'
import { scopeAllReports } from '@/lib/dash/scope-all-reports'
import PageHead from '@/components/molecules/PageHead'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { greeting } from '@/lib/dash/greeting'
import Stat from '@/components/molecules/Stat'
import Panel from '@/components/molecules/Panel'
import Link from 'next/link'
import { villageById } from '@/lib/master/village-by-id'
import Badge from '@/components/atoms/Badge'
import Empty from '@/components/molecules/Empty'
import { isClosed } from '@/lib/db/is-closed'
import { rpShort } from '@/lib/dash/rp-short'
import { valueOf } from '@/lib/db/value-of'
import { isLate } from '@/lib/db/is-late'

export default function InspHome() {
  const { session } = useDash()
  const d = db.use()
  const r = session.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const regionVillages = villages.filter((v) => v.regionId === r.regionId)
  const openEsc = reports.filter((x) => x.flow === 'diteruskan')
  const risky = contracts.map((c) => ({ c, ...riskOf(c, scopeAllReports(d, c.villageId)) })).sort((a, b) => b.score - a.score)

  return (
    <>
      <PageHead label={`Beranda · Inspektorat ${wilayahLabel(r)}`} title={`${greeting()}, ${session.name.split(' ')[0]}.`} desc="Pantau risiko kontrak lintas desa dan tindak lanjuti laporan yang diteruskan BPD." />
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] d-stats">
        <Stat label="Desa dipantau" value={regionVillages.length} icon="map" />
        <Stat label="Kontrak diawasi" value={contracts.length} icon="eye" to="/dashboard/kontrak" />
        <Stat label="Laporan eskalasi terbuka" value={openEsc.length} icon="flag" tone={openEsc.length ? 'red' : 'blue'} to="/dashboard/laporan" />
        <Stat label="Kontrak risiko tinggi" value={risky.filter((x) => x.score >= 3).length} icon="alert" tone="ink" />
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <Panel title="Kontrak dengan risiko tertinggi" desc="Skor dari keterlambatan, laporan terbuka, selisih termin dan progres, serta jumlah versi.">
          {risky.length ? (
            <ul className="grid gap-6 list-none list-outside [&_a]:items-start [&_a]:border-[0.15rem] [&_a]:border-[#ececea] [&_a]:border-solid [&_a]:rounded-[1.4rem] [&_a]:grid [&_a]:gap-14 [&_a]:grid-cols-[auto_minmax(0,1fr)] [&_a]:py-12 [&_a]:px-14 [&_a]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_a:hover]:border-ink [&_a:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]">
              {risky.slice(0, 5).map(({ c, score, reasons }) => (
                <li key={c.code}>
                  <Link href={`/dashboard/kontrak/${c.code}`}>
                    <span className={`items-center bg-gray rounded-[1rem] text-white flex text-[2rem] font-[400] h-44 justify-center w-44 [&.is-mid]:bg-ink [&.is-high]:bg-red! ${score >= 5 ? 'is-high' : score >= 3 ? 'is-mid' : ''}`}>{score}</span>
                    <span className="grid gap-3 [&_strong]:font-[420] [&_small]:text-[1.25rem] [&_small]:text-dim">
                      <strong>{c.title}</strong>
                      <small>
                        <code>{c.code}</code> · {villageById(c.villageId)?.name}
                      </small>
                      <span className="flex flex-wrap gap-4 mt-4">
                        {reasons.length ? reasons.map((t) => <Badge key={t} tone="outline">{t}</Badge>) : <Badge tone="done">Tidak ada catatan</Badge>}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Belum ada kontrak di wilayah ini." />
          )}
        </Panel>
        <Panel title={`Desa di ${wilayahLabel(r)}`}>
          <ul className="grid gap-10 list-none list-outside [&_li]:bg-soft [&_li]:rounded-[1.4rem] [&_li]:grid [&_li]:gap-12 [&_li]:p-14 [&_li>div]:grid [&_li>div]:gap-2 [&_strong]:text-[1.7rem] [&_strong]:font-[420] [&_small]:text-[1.25rem]! [&_small]:text-dim [&_dl]:grid! [&_dl]:gap-8! [&_dl]:grid-cols-[repeat(4,minmax(0,1fr))] [&_dt]:text-[1.15rem]! [&_dt]:text-dim! [&_dd]:text-[1.7rem]!">
            {regionVillages.map((v) => {
              const vc = contracts.filter((c) => c.villageId === v.id)
              const vr = scopeAllReports(d, v.id).filter((x) => !isClosed(x))
              return (
                <li key={v.id}>
                  <div>
                    <strong>{v.name}</strong>
                    <small>
                      {v.district} · kode {v.code}
                    </small>
                  </div>
                  <dl>
                    <div>
                      <dt>Kontrak</dt>
                      <dd>{vc.length}</dd>
                    </div>
                    <div>
                      <dt>Nilai</dt>
                      <dd>{rpShort(vc.reduce((s, c) => s + valueOf(c), 0))}</dd>
                    </div>
                    <div>
                      <dt>Laporan</dt>
                      <dd className={vr.length ? '[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic' : ''}>{vr.length}</dd>
                    </div>
                    <div>
                      <dt>Terlambat</dt>
                      <dd className={vc.some(isLate) ? '[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic' : ''}>{vc.filter(isLate).length}</dd>
                    </div>
                  </dl>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </>
  )
}
