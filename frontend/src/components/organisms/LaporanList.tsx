import FormAlert from '@/components/atoms/FormAlert'
import Empty from '@/components/molecules/Empty'
import ReportCard from '@/components/organisms/ReportCard'
import type { useLaporan } from '@/hooks/use-laporan'

interface Props {
  laporan: ReturnType<typeof useLaporan>
}

/* The reports of the page: loading line, the server error, the cards, or an empty state */
export default function LaporanList({ laporan: l }: Props) {
  if (!l.server) return <p className="text-[1.4rem] text-dim" role="status">Memuat laporan warga…</p>
  if (!l.server.ok) return <FormAlert>{l.server.error}</FormAlert>
  if (!l.list.length) {
    return (
      <div className="[align-content:start] bg-white rounded-[2rem] grid gap-16 p-20 md:p-24">
        <Empty title={l.filter === 'perlu' ? 'Tidak ada laporan yang menunggu Anda.' : 'Tidak ada laporan yang cocok.'} text="Laporan baru dari portal warga muncul di sini secara otomatis." />
      </div>
    )
  }
  return (
    <div className="grid gap-14">
      {l.list.map((x) => (
        <ReportCard key={x.id} report={x} contract={l.contracts.find((c) => c.code === x.contractCode)} session={l.session} onChanged={l.refresh} />
      ))}
    </div>
  )
}
