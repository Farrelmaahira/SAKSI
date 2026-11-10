'use client'

import FormAlert from '@/components/atoms/FormAlert'
import Empty from '@/components/molecules/Empty'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import BuatLaporanForm from '@/components/organisms/BuatLaporanForm'
import ReportSent from '@/components/organisms/ReportSent'
import { useBuatLaporan } from '@/hooks/use-buat-laporan'

export default function BuatLaporanTemplate() {
  const report = useBuatLaporan()
  if (report.role !== 'warga') return <NotAllowed />
  if (report.sent) return <ReportSent code={report.sent} onAnother={report.reset} />

  return (
    <>
      <PageHead label="Buat laporan" title="Laporkan kejanggalan" desc="Pilih kontrak, ceritakan yang Anda lihat, dan lampirkan foto bila ada." />
      <Panel>
        {report.loadError ? (
          <FormAlert>{report.loadError}</FormAlert>
        ) : !report.registry ? (
          <p className="text-[1.4rem] text-dim" role="status">Memuat kontrak desa…</p>
        ) : !report.contracts.length ? (
          <Empty title="Belum ada kontrak yang dipublikasikan." text="Laporan bisa dikirim setelah desa mempublikasikan kontraknya." />
        ) : (
          <BuatLaporanForm report={report} />
        )}
      </Panel>
    </>
  )
}
