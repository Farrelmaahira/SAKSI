'use client'

import { useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { myReports } from '@/lib/db/my-reports'
import { isClosed } from '@/lib/db/is-closed'
import { seedContracts } from '@/data/seed-contracts'
import PageHead from '@/components/molecules/PageHead'
import Chips from '@/components/molecules/Chips'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import WargaReportCard from '@/components/organisms/WargaReportCard'

type Filter = 'semua' | 'proses' | 'selesai'

export default function LaporanSayaTemplate() {
  const { session } = useDash()
  const d = db.use()
  const [filter, setFilter] = useState<Filter>('semua')
  const all = myReports(d, session.email)
  const list = all.filter((r) => filter === 'semua' || (filter === 'selesai' ? isClosed(r) : !isClosed(r)))
  const titleOf = (code: string) => d.contracts.find((c) => c.code === code)?.title ?? seedContracts.find((c) => c.code === code)?.title

  return (
    <>
      <PageHead
        label="Laporan saya"
        title="Laporan saya"
        desc="Pantau laporan yang Anda kirim dan tanggapan dari desa, BPD, atau Inspektorat. Kode laporan hanya nomor referensi."
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
        <div className="grid gap-14">
          {list.map((r) => (
            <WargaReportCard key={r.id} report={r} contractTitle={titleOf(r.contractCode)} />
          ))}
        </div>
      ) : (
        <div className="[align-content:start] bg-white rounded-[2rem] grid gap-16 p-20 md:p-24">
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
