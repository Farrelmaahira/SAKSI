'use client'

import FormAlert from '@/components/atoms/FormAlert'
import Empty from '@/components/molecules/Empty'
import ReportCard from '@/components/organisms/ReportCard'
import { useContractReports } from '@/hooks/use-contract-reports'
import type { TabProps } from '@/interfaces/dash'

export default function LaporanTab({ c, session }: TabProps) {
  const role = session.role.role
  const { result, visible, refresh } = useContractReports(c, role)

  if (!result) return <p className="text-[1.4rem] text-dim" role="status">Memuat laporan warga…</p>
  if (!result.ok) return <FormAlert>{result.error}</FormAlert>
  if (!visible.length)
    return <Empty title={role === 'inspektorat' ? 'Tidak ada laporan yang diteruskan untuk kontrak ini.' : 'Belum ada laporan warga untuk kontrak ini.'} text="Warga bisa melapor lewat portal publik dengan kode kontrak." />
  return (
    <div className="grid gap-14">
      {visible.map((r) => (
        <ReportCard key={r.id} report={r} contract={c} session={session} onChanged={refresh} />
      ))}
    </div>
  )
}
