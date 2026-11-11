'use client'

import { useDash } from '@/hooks/use-dash'
import { useMyReports } from '@/hooks/use-my-reports'
import PageHead from '@/components/molecules/PageHead'
import Chips from '@/components/molecules/Chips'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import WargaReportCard from '@/components/organisms/WargaReportCard'

export default function LaporanSayaTemplate() {
  const { session } = useDash()
  const { res, filter, setFilter, counts, total, list } = useMyReports(session.userId)

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
          { key: 'semua', label: 'Semua', count: counts.semua },
          { key: 'proses', label: 'Diproses', count: counts.proses },
          { key: 'selesai', label: 'Selesai', count: counts.selesai },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {!res ? (
        <p className="text-[1.4rem] text-dim" role="status">Memuat laporan…</p>
      ) : !res.ok ? (
        <FormAlert>{res.error}</FormAlert>
      ) : list.length ? (
        <div className="grid gap-14">
          {list.map(({ r, title }) => (
            <WargaReportCard key={r.id} report={r} contractTitle={title} />
          ))}
        </div>
      ) : (
        <div className="[align-content:start] bg-white rounded-[2rem] grid gap-16 p-20 md:p-24">
          <Empty
            art="document-ready_o5d5"
            title={total ? 'Tidak ada laporan di kategori ini.' : 'Anda belum mengirim laporan.'}
            text="Lihat kejanggalan pada kontrak desa? Laporkan, identitas Anda tidak ditampilkan ke pemerintah desa."
            action={total ? undefined : <Btn to="/dashboard/laporan/baru">Buat laporan</Btn>}
          />
        </div>
      )}
    </>
  )
}
