import Badge from '@/components/atoms/Badge'
import type { ContractStatus } from '@/interfaces/db'
import { statusTone } from '@/data/dash'
import { statusLabels } from '@/data/db'

interface Props { status: ContractStatus }

export default function StatusBadge({ status }: Props) {
  return <Badge tone={statusTone[status]}>{statusLabels[status]}</Badge>
}
