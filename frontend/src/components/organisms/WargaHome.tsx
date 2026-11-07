'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { isClosed } from '@/lib/db/is-closed'
import { greeting } from '@/lib/dash/greeting'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import { useReadIds } from '@/lib/notifications/use-read-ids'
import { villageById } from '@/lib/master/village-by-id'
import { fetchMyReports, fetchPublicContracts, type CreatedReportResponse, type PublicContractSummary } from '@/lib/api/reports'
import type { DReport, ReportFlow } from '@/interfaces/db'
import PageHead from '@/components/molecules/PageHead'
import Stat from '@/components/molecules/Stat'
import Panel from '@/components/molecules/Panel'
import NotifList from '@/components/molecules/NotifList'
import ReportMini from '@/components/molecules/ReportMini'
import Btn from '@/components/atoms/Btn'

function mapDbReport(r: CreatedReportResponse, email: string, name: string): DReport {
  let flow: ReportFlow = 'baru'
  if (r.status === 'diverifikasi') flow = 'diverifikasi'
  else if (r.status === 'ditindaklanjuti') flow = 'ditindaklanjuti'
  else if (r.status === 'diteruskan') flow = 'diteruskan'
  else if (r.status === 'selesai' || r.status === 'ditolak') flow = 'ditutup'

  return {
    id: r.kodePelacakan,
    contractCode: `SPK-1-${String(r.contractId).padStart(4, '0')}`,
    category: r.kategori.replace(/_/g, ' '),
    clause: 'Klausul Terkait',
    text: r.deskripsi,
    date: r.dibuatPada ? new Date(r.dibuatPada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini',
    reporter: 'Warga terverifikasi',
    owner: email,
    reporterName: name,
    photos: r.attachments?.length || 0,
    flow,
    actions: (r.actions || []).map((a) => ({
      id: String(a.id),
      at: a.waktu,
      by: a.aktorNama || 'BPD / Tim Pengawas',
      role: 'bpd',
      kind: 'klarifikasi',
      text: a.catatan || a.tindakan,
    })),
  }
}

export default function WargaHome() {
  const { session } = useDash()
  const d = db.use()
  const read = useReadIds(session.userId)
  const notifs = notificationsFor(session, d, [])
  const [reports, setReports] = useState<DReport[]>([])
  const [contracts, setContracts] = useState<PublicContractSummary[]>([])

  useEffect(() => {
    let active = true
    async function loadData() {
      const [reps, cnts] = await Promise.all([
        fetchMyReports(),
        fetchPublicContracts(),
      ])
      if (active) {
        if (reps && reps.length > 0) {
          setReports(reps.map((r) => mapDbReport(r, session.email, session.name)))
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
      <div className="d-stats d-stats-4">
        <Stat label="Laporan terkirim" value={reports.length} icon="flag" to="/dashboard/laporan" />
        <Stat label="Sudah ditanggapi" value={answered} icon="check" />
        <Stat label="Sedang diproses" value={reports.filter((r) => !isClosed(r)).length} icon="clock" tone="ink" />
        <Stat label="Selesai" value={reports.filter(isClosed).length} icon="shield" />
      </div>
      <div className="d-grid-2">
        <Panel title="Notifikasi terbaru" action={<Link className="d-link" href="/dashboard/notifikasi">Semua notifikasi</Link>}>
          {notifs.length ? <NotifList items={notifs.slice(0, 4)} read={read} userId={session.userId} /> : <p className="d-muted">Belum ada kabar. Notifikasi muncul saat laporan Anda ditanggapi.</p>}
        </Panel>
        <Panel title="Laporan terakhir" action={<Link className="d-link" href="/dashboard/laporan">Laporan saya</Link>}>
          {reports.length ? (
            <div className="d-minis">
              {reports.slice(0, 3).map((r) => (
                <ReportMini key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <p className="d-muted">Anda belum mengirim laporan.</p>
          )}
        </Panel>
      </div>
      <Panel
        title={`Kontrak desa yang berjalan (${contracts.length})`}
        desc="Pantau rincian kegiatan, rekanan, dan klausul kontrak yang sedang berjalan di desa Anda."
        action={<Link className="d-link" href="/dashboard/kontrak">Lihat semua kontrak</Link>}
      >
        {contracts.length > 0 ? (
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Nomor / Judul</th>
                  <th>Jenis</th>
                  <th>Rekanan</th>
                  <th>Nilai</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-contract-cell">
                        <Link href={`/dashboard/kontrak/${c.id}`} className="d-strong d-link">
                          {c.nomor}
                        </Link>
                        <span className="d-muted">{c.judul}</span>
                      </div>
                    </td>
                    <td><span className="d-tag">{c.jenis}</span></td>
                    <td>{c.counterpartyNama || '-'}</td>
                    <td>Rp {c.nilai.toLocaleString('id-ID')}</td>
                    <td><span className="d-status-pill">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="d-btn-row">
            <Btn to="/dashboard/kontrak" variant="light" icon="file">Lihat kontrak desa</Btn>
          </div>
        )}
      </Panel>
    </>
  )
}
