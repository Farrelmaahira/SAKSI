import type { ContractStatus } from '@/interfaces/db'
import { statusTone } from '@/data/dash'
import { statusLabels } from '@/data/db'

interface Props { status: ContractStatus }

export default function StatusBadge({ status }: Props) {
  return <span className={`badge badge-${statusTone[status]}`}>{statusLabels[status]}</span>
}
