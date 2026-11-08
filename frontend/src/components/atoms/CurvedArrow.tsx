import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function CurvedArrow({ className }: Props) {
  return (
    <svg className={cn('[fill:none] overflow-visible pointer-events-none [stroke:currentColor] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3] [&_path]:[vector-effect:non-scaling-stroke]', className)} viewBox="0 0 160 120" aria-hidden="true">
      <path d="M10 18c42-14 96 2 116 40 9 17 10 34 4 50" />
      <path d="M112 92c7 6 13 12 18 18 6-9 13-16 22-22" />
    </svg>
  )
}
