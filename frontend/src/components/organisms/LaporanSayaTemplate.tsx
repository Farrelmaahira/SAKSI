'use client'

import { useState, useEffect } from 'react'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { myReports } from '@/lib/db/my-reports'
import { isClosed } from '@/lib/db/is-closed'
import { seedContracts } from '@/data/seed-contracts'
import { fetchMyReports, type CreatedReportResponse } from '@/lib/api/reports'
import type { DReport, ReportFlow } from '@/interfaces/db'
import PageHead from '@/components/molecules/PageHead'
import Chips from '@/components/molecules/Chips'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import WargaReportCard from '@/components/organisms/WargaReportCard'

type Filter = 'semua' | 'proses' | 'selesai'

function mapDbReportToDReport(r: CreatedReportResponse, email: string, name: string): DReport {
  let flow: ReportFlow = 'baru'
  if (r.status === 'diverifikasi') flow = 'diverifikasi'
  else if (r.status === 'ditindaklanjuti') flow = 'ditindaklanjuti'
  else if (r.status === 'diteruskan') flow = 'diteruskan'
  else if (r.status === 'selesai' || r.status === 'ditolak') flow = 'ditutup'

  return {
    id: r.kodePelacakan,
    contractCode: `SPK-1-${String(r.contractId).padStart(4, '0')}`,
    category: r.kategori.replace(/_/g, ' '),
    clause: 'Klausul Pengadaan',
    text: r.deskripsi,
    location: r.lokasiLat ? `Koordinat (${r.lokasiLat.toFixed(4)}, ${r.lokasiLng?.toFixed(4) ?? 0})` : undefined,
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

export default function LaporanSayaTemplate() {
  const { session } = useDash()
  const d = db.use()
  const [filter, setFilter] = useState<Filter>('semua')
  const [dbReports, setDbReports] = useState<DReport[] | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const res = await fetchMyReports()
      if (active && res && res.length > 0) {
        const mapped = res.map((item) => mapDbReportToDReport(item, session.email, session.name))
        setDbReports(mapped)
      } else if (active) {
        setDbReports([])
      }
    }
    load()
    return () => {
      active = false
    }
  }, [session])

  // Gunakan data dari database bila ada
  const all = (dbReports !== null && dbReports.length > 0) ? dbReports : (dbReports !== null ? [] : myReports(d, session.email))
  const list = all.filter((r) => filter === 'semua' || (filter === 'selesai' ? isClosed(r) : !isClosed(r)))
  const titleOf = (code: string) => d.contracts.find((c) => c.code === code)?.title ?? seedContracts.find((c) => c.code === code)?.title

  return (
    <>
      <PageHead
        label="Laporan saya"
        title="Laporan saya"
        desc="Pantau laporan yang Anda kirim dan tanggapan dari desa, BPD, atau Inspektorat. Seluruh data diambil langsung dari database sistem."
        actions={<Btn to="/dashboard/laporan/baru" icon="plus">Buat laporan</Btn>}
      />
      <Chips
        items={[
          { key: 'semua', label: 'Semua', count: all.length },
          { key: 'proses', label: 'Diproses', count: all.filter((r) => !isClosed(r)).length },
          { key: 'selesai', label: 'Selesai', count: all.filter(isClosed).length },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {list.length ? (
        <div className="d-reports">
          {list.map((r) => (
            <WargaReportCard key={r.id} report={r} contractTitle={titleOf(r.contractCode)} />
          ))}
        </div>
      ) : (
        <div className="d-panel">
          <Empty
            art="document-ready_o5d5"
            title={all.length ? 'Tidak ada laporan di kategori ini.' : 'Anda belum mengirim laporan.'}
            text="Lihat kejanggalan pada kontrak desa? Laporkan, identitas Anda tidak ditampilkan ke pemerintah desa."
            action={all.length ? undefined : <Btn to="/dashboard/laporan/baru">Buat laporan</Btn>}
          />
        </div>
      )}
    </>
  )
}
