import { cn } from '@/lib/utils'

interface Props {
  title: string
  status: string
  ok: boolean
}

export default function PaperHead({ title, status, ok }: Props) {
  return (
    <div className="paper-head">
      <span>{title}</span>
      <span className={cn('paper-status', ok && 'is-ok')}>{status}</span>
    </div>
  )
}
