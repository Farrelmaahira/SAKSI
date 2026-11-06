import type { TabProps } from '@/interfaces/dash'
import { db } from '@/lib/db/db'
import { allReports } from '@/lib/db/all-reports'
import Empty from '@/components/molecules/Empty'
import ReportCard from '@/components/organisms/ReportCard'

export default function LaporanTab({ c, session }: TabProps) {
  const d = db.use()
  const reports = allReports(d).filter((r) => r.contractCode === c.code)
  const visible = session.role.role === 'inspektorat' ? reports.filter((r) => r.actions.some((a) => a.kind === 'eskalasi')) : reports
  if (!visible.length)
    return <Empty title={session.role.role === 'inspektorat' ? 'Tidak ada laporan yang diteruskan untuk kontrak ini.' : 'Belum ada laporan warga untuk kontrak ini.'} text="Warga bisa melapor lewat portal publik dengan kode kontrak." />
  return (
    <div className="d-reports">
      {visible.map((r) => (
        <ReportCard key={r.id} report={r} contract={c} session={session} />
      ))}
    </div>
  )
}
