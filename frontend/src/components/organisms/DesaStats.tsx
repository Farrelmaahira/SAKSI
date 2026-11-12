import Stat from '@/components/molecules/Stat'
import StatGrid from '@/components/molecules/StatGrid'
import type { useDesaHome } from '@/hooks/use-desa-home'
import { rpShort } from '@/lib/dash/rp-short'
import { daysUntil } from '@/lib/dates/days-until'

interface Props {
  home: ReturnType<typeof useDesaHome>
}

/* Five numbers: active contracts, value, terms due, unanswered reports, integrity. Server metrics replace the local ones once loaded. */
export default function DesaStats({ home: h }: Props) {
  const m = h.metrics
  return (
    <StatGrid cols={5}>
      <Stat label="Kontrak aktif" value={m ? m.activeContractsCount : h.active.length} hint={m ? `Real-time dari database (${m.sealedContractsCount} tersegel)` : `${h.contracts.length} kontrak total`} icon="file" to="/dashboard/kontrak" />
      <Stat label={`Nilai kontrak ${h.year}`} value={rpShort(m ? m.totalRealizationBudget : h.yearValue)} hint="Realisasi anggaran aktif" icon="wallet" tone="ink" />
      <Stat label="Termin jatuh tempo" value={h.due.length} hint="7 hari ke depan atau lewat" icon="clock" tone={h.due.some((t) => daysUntil(t.planDate) < 0) ? 'red' : 'blue'} />
      <Stat label="Laporan belum ditanggapi" value={h.unanswered.length} hint="Dari warga" icon="flag" tone={h.unanswered.length ? 'red' : 'blue'} to="/dashboard/laporan" />
      <Stat label="Indeks Integritas" value={m ? `${m.integrityIndex}%` : h.critical} hint={m ? 'Berdasarkan audit kepatuhan' : 'Di draf yang belum dikirim'} icon="alert" tone="blue" />
    </StatGrid>
  )
}
