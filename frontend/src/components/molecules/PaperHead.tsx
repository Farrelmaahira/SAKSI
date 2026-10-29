import { cn } from '@/lib/utils'

export interface PaperHeadProps {
  title: string
  status: string
  ok: boolean
}

export default function PaperHead({ title, status, ok }: PaperHeadProps) {
  return (
    <div className="paper-head">
      <span>{title}</span>
      <span className={cn('paper-status', ok && 'is-ok')}>{status}</span>
    </div>
  )
}
