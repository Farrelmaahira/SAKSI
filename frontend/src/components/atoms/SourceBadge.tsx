import Badge from '@/components/atoms/Badge'
import type { ClauseSource } from '@/interfaces/drafting'

interface Props { source?: ClauseSource }

export default function SourceBadge({ source }: Props) {
  if (!source) return null
  return <Badge tone={source === 'ai' ? 'blue' : 'outline'}>{source === 'ai' ? 'AI' : 'Manual'}</Badge>
}
