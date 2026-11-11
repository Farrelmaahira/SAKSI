'use client'

import { useState, useEffect } from 'react'
import { useDash } from '@/hooks/use-dash'
import { isClosed } from '@/lib/db/is-closed'
import { greeting } from '@/lib/dash/greeting'
import { useNotifications } from '@/hooks/use-notifications'
import { toNotif } from '@/lib/notifications/to-notif'
import { villageById } from '@/lib/master/village-by-id'
import type { PublicContractSummary } from '@/lib/api/reports'
import { listReports } from '@/lib/api/list-reports'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { toDReport } from '@/lib/api/to-dreport'
import type { DReport } from '@/interfaces/db'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import Panel from '@/components/molecules/Panel'
import NotifList from '@/components/molecules/NotifList'
import ReportMini from '@/components/molecules/ReportMini'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import TextLink from '@/components/atoms/TextLink'
import ContractLink from '@/components/molecules/ContractLink'
import DataTable from '@/components/molecules/DataTable'
import { formatRp } from '@/lib/contracts/format-rp'

export default function WargaHome() {
  const { session } = useDash()
  const server = useNotifications(session.userId)
  const notifs = server.items.map(toNotif)
  const read = server.items.filter((x) => x.dibaca).map((x) => `n:${x.id}`)
  const [reports, setReports] = useState<DReport[]>([])
  const [contracts, setContracts] = useState<PublicContractSummary[]>([])

  useEffect(() => {
    let active = true
    async function loadData() {
      const [reps, cnts] = await Promise.all([
        listReports().then((r) => (r.ok ? r.data : [])),
        listPublicContracts().then((r) => (r.ok ? r.data : [])),
      ])
      if (active) {
        if (reps && reps.length > 0) {
          setReports(reps.map((r) => toDReport(r)))
        }
        if (cnts) {
          setContracts(cnts)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [session])

  const answered = reports.filter((r) => r.actions.length > 0).length

  return (
    <>
      <PageHead
        label={`Beranda · ${villageById(session.role.villageId)?.name ?? 'Desa Sukamaju'}`}
        title={`${greeting()}, ${session.name.split(' ')[0]}.`}
        desc="Laporkan kejanggalan pada kontrak desa dan pantau tanggapannya secara transparan dari database desa."
        actions={<Btn to="/dashboard/laporan/baru" icon="plus">Buat laporan</Btn>}
      />
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] d-stats">
        <Stat label="Laporan terkirim" value={reports.length} icon="flag" to="/dashboard/laporan" />
        <Stat label="Sudah ditanggapi" value={answered} icon="check" />
        <Stat label="Sedang diproses" value={reports.filter((r) => !isClosed(r)).length} icon="clock" tone="ink" />
        <Stat label="Selesai" value={reports.filter(isClosed).length} icon="shield" />
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Notifikasi terbaru" action={<TextLink href="/dashboard/notifikasi">Semua notifikasi</TextLink>}>
          {notifs.length ? <NotifList items={notifs.slice(0, 4)} read={read} userId={session.userId} /> : <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{server.status === 'error' ? server.error : server.status === 'ok' ? 'Belum ada kabar. Notifikasi muncul saat laporan Anda ditanggapi.' : 'Memuat notifikasi…'}</p>}
        </Panel>
        <Panel title="Laporan terakhir" action={<TextLink href="/dashboard/laporan">Laporan saya</TextLink>}>
          {reports.length ? (
            <div className="grid gap-10">
              {reports.slice(0, 3).map((r) => (
                <ReportMini key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Anda belum mengirim laporan.</p>
          )}
        </Panel>
      </div>
      <Panel
        title={`Kontrak desa yang berjalan (${contracts.length})`}
        desc="Pantau rincian kegiatan, rekanan, dan klausul kontrak yang sedang berjalan di desa Anda."
        action={<TextLink href="/dashboard/kontrak">Lihat semua kontrak</TextLink>}
      >
        {contracts.length > 0 ? (
          <DataTable columns={['Nomor / Judul', 'Jenis', 'Rekanan', 'Nilai', 'Status']}>
            {contracts.slice(0, 5).map((c) => (
              <tr key={c.id}>
                <td><ContractLink href={`/dashboard/kontrak/${c.id}`} code={c.nomor} title={c.judul} /></td>
                <td data-label="Jenis"><Badge tone="tint">{c.jenis}</Badge></td>
                <td data-label="Rekanan">{c.counterpartyNama || '-'}</td>
                <td data-label="Nilai">{formatRp(c.nilai)}</td>
                <td data-label="Status"><Badge tone="blue">{c.status}</Badge></td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <div>
            <Btn to="/dashboard/kontrak" variant="light" icon="file">Lihat kontrak desa</Btn>
          </div>
        )}
      </Panel>
    </>
  )
}
