'use client'

import Link from 'next/link'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { myReports } from '@/lib/db/my-reports'
import { isClosed } from '@/lib/db/is-closed'
import { greeting } from '@/lib/dash/greeting'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import { useReadIds } from '@/lib/notifications/use-read-ids'
import { villageById } from '@/lib/master/village-by-id'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import Panel from '@/components/molecules/Panel'
import NotifList from '@/components/molecules/NotifList'
import ReportMini from '@/components/molecules/ReportMini'
import Btn from '@/components/atoms/Btn'

export default function WargaHome() {
  const { session } = useDash()
  const d = db.use()
  const read = useReadIds(session.userId)
  const reports = myReports(d, session.email)
  const notifs = notificationsFor(session, d, [])
  const answered = reports.filter((r) => r.actions.length > 0).length

  return (
    <>
      <PageHead
        label={`Beranda · ${villageById(session.role.villageId)?.name ?? ''}`}
        title={`${greeting()}, ${session.name.split(' ')[0]}.`}
        desc="Laporkan kejanggalan pada kontrak desa dan pantau tanggapannya. Identitas Anda tidak ditampilkan ke pemerintah desa."
        actions={<Btn to="/dashboard/laporan/baru" icon="plus">Buat laporan</Btn>}
      />
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] d-stats">
        <Stat label="Laporan terkirim" value={reports.length} icon="flag" to="/dashboard/laporan" />
        <Stat label="Sudah ditanggapi" value={answered} icon="check" />
        <Stat label="Sedang diproses" value={reports.filter((r) => !isClosed(r)).length} icon="clock" tone="ink" />
        <Stat label="Selesai" value={reports.filter(isClosed).length} icon="shield" />
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Notifikasi terbaru" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/notifikasi">Semua notifikasi</Link>}>
          {notifs.length ? <NotifList items={notifs.slice(0, 4)} read={read} userId={session.userId} /> : <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada kabar. Notifikasi muncul saat laporan Anda ditanggapi.</p>}
        </Panel>
        <Panel title="Laporan terakhir" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/laporan">Laporan saya</Link>}>
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
      <Panel title="Pantau kontrak desa" desc="Daftar kontrak, progres, termin, dan keaslian dokumen terbuka untuk semua orang tanpa login.">
        <div className="items-center flex flex-wrap gap-10">
          <Btn to="/lacak" variant="ghost" icon="globe">Buka portal publik</Btn>
        </div>
      </Panel>
    </>
  )
}
