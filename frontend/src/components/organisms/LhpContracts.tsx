import Empty from '@/components/molecules/Empty'
import FormAlert from '@/components/atoms/FormAlert'
import Panel from '@/components/molecules/Panel'
import LhpForm from '@/components/organisms/LhpForm'
import type { ApiResult, AuditReport, TerminListItem } from '@/interfaces/api'

interface Props {
  contracts: ApiResult<TerminListItem[]> | null
  onCreated: (report: AuditReport) => void
}

/* The inspektorat's contracts to examine: loading, error, none, or the form to write a new LHP */
export default function LhpContracts({ contracts, onCreated }: Props) {
  if (!contracts) return <Panel><p className="text-[1.4rem] text-dim" role="status">Memuat kontrak…</p></Panel>
  if (!contracts.ok) return <Panel><FormAlert>{contracts.error}</FormAlert></Panel>
  if (!contracts.data.length) return <Panel><Empty title="Belum ada kontrak untuk diperiksa." text="Kontrak muncul bila desanya ada di wilayah Anda atau ditugaskan kepada Anda oleh admin daerah." /></Panel>
  return <LhpForm contracts={contracts.data} onCreated={onCreated} />
}
