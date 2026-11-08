import { iconPaths } from '@/data/dash'
import { cn } from '@/lib/utils'

interface Props { name: keyof typeof iconPaths | string; className?: string }

export default function Icon({ name, className }: Props) {
  return (
    <svg className={cn('[fill:none] flex-none h-18 [stroke:currentColor] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8] w-18 [&.flip]:[transform:rotate(180deg)] [.d-callout_&]:mt-1 [.d-locked_&]:mt-1! [.d-ok_&]:mt-1! [.d-step_&]:h-15 [.d-step_&]:mt-1.5! [.d-step_&]:w-15 [.d-report-meta_&]:h-16! [.d-report-meta_&]:mt-1.5! [.d-report-meta_&]:w-16! [.d-next>&]:h-24! [.d-next>&]:w-24! [.d-integrity>&]:h-24! [.d-integrity>&]:w-24! [.app-notif-mark_&]:h-15! [.app-notif-mark_&]:w-15!', className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.file} />
    </svg>
  )
}
