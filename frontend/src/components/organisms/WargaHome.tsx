'use client'

import { useWargaHome } from '@/hooks/use-warga-home'
import { greeting } from '@/lib/dash/greeting'
import { villageById } from '@/lib/master/village-by-id'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import StatGrid from '@/components/molecules/StatGrid'
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
  const { session, server, notifs, read, reports, contracts, answered, inProgress, closed } = useWargaHome()

  return (
    <>
      <PageHead
        label={`Beranda · ${villageById(session.role.villageId)?.name ?? 'Desa Sukamaju'}`}
        title={`${greeting()}, ${session.name.split(' ')[0]}.`}
        desc="Laporkan kejanggalan pada kontrak desa dan pantau tanggapannya secara transparan dari database desa."
        actions={<Btn to="/dashboard/laporan/baru" icon="plus">Buat laporan</Btn>}
      />
      <StatGrid cols={4}>
        <Stat label="Laporan terkirim" value={reports.length} icon="flag" to="/dashboard/laporan" />
        <Stat label="Sudah ditanggapi" value={answered} icon="check" />
        <Stat label="Sedang diproses" value={inProgress} icon="clock" tone="ink" />
        <Stat label="Selesai" value={closed} icon="shield" />
      </StatGrid>
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
