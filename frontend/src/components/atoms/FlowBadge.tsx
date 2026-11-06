import type { ReportFlow } from '@/interfaces/db'
import { flowTone } from '@/data/dash'
import { flowLabels } from '@/data/db'

interface Props { flow: ReportFlow }

export default function FlowBadge({ flow }: Props) {
  return <span className={`badge badge-${flowTone[flow]}`}>{flowLabels[flow]}</span>
}
