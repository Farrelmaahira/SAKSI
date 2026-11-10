'use client'

import { useState, useEffect } from 'react'
import { useDash } from '@/hooks/use-dash'
import { isClosed } from '@/lib/db/is-closed'
import { listReports } from '@/lib/api/list-reports'
import { toDReport } from '@/lib/api/to-dreport'
import type { ApiResult } from '@/interfaces/api'
import type { CreatedReportResponse } from '@/lib/api/reports'
import PageHead from '@/components/molecules/PageHead'
import Chips from '@/components/molecules/Chips'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import WargaReportCard from '@/components/organisms/WargaReportCard'

type Filter = 'semua' | 'proses' | 'selesai'

export default function LaporanSayaTemplate() {
  const { session } = useDash()
  const [filter, setFilter] = useState<Filter>('semua')
  const [res, setRes] = useState<ApiResult<CreatedReportResponse[]> | null>(null)

  useEffect(() => {
    let active = true
    listReports().then((r) => active && setRes(r))
    return () => {
      active = false
    }
  }, [session.userId])

  // contractCode = server id: /lacak resolves it to the published contract
  const rows = res?.ok ? res.data.map((x) => ({ r: toDReport(x), title: x.contractTitle })) : []
  const all = rows.map((x) => x.r)
  const list = rows.filter(({ r }) => filter === 'semua' || (filter === 'selesai' ? isClosed(r) : !isClosed(r)))

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
            title={all.length ? 'Tidak ada laporan di kategori ini.' : 'Anda belum mengirim laporan.'}
            text="Lihat kejanggalan pada kontrak desa? Laporkan, identitas Anda tidak ditampilkan ke pemerintah desa."
            action={all.length ? undefined : <Btn to="/dashboard/laporan/baru">Buat laporan</Btn>}
          />
        </div>
      )}
    </>
  )
}
