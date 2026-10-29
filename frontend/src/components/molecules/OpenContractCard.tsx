import type { SealedContract } from '@/interfaces/contract'
import { formatRp } from '@/lib/contracts/format-rp'
import { shortHash } from '@/lib/contracts/short-hash'
import { cn } from '@/lib/utils'

export interface OpenContractCardProps {
  contract: SealedContract
  active: boolean
  onOpen: (code: string) => void
}

export default function OpenContractCard({ contract: c, active, onOpen }: OpenContractCardProps) {
  return (
    <button type="button" className={cn('open-card', active && 'is-active')} onClick={() => onOpen(c.code)}>
      <span className="open-top">
        <span className="tag">{c.type}</span>
        <span className="open-code">{c.code}</span>
      </span>
      <strong>{c.title}</strong>
      <span className="open-meta">
        {c.village} · {formatRp(c.value)}
      </span>
      <span className="open-progress">
        <span style={{ width: `${c.progress}%` }} />
      </span>
      <span className="open-foot">
        <span>{c.progress}% selesai</span>
        <code>{shortHash(c.hash)}</code>
      </span>
    </button>
  )
}
