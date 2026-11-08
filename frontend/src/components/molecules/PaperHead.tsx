import { cn } from '@/lib/utils'

interface Props {
  title: string
  status: string
  ok: boolean
}

export default function PaperHead({ title, status, ok }: Props) {
  return (
    <div className="items-center flex text-[1.2rem] gap-10 justify-between mb-20 uppercase">
      <span>{title}</span>
      <span className={cn('border-[0.1rem] border-ink border-solid rounded-[3rem] flex-none py-3 px-10 [&.is-ok]:bg-blue [&.is-ok]:border-blue [&.is-ok]:text-white', ok && '[.d-checks_li&]:text-blue is-ok')}>{status}</span>
    </div>
  )
}
