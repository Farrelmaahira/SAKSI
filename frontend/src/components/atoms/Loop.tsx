import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function Loop({ className }: Props) {
  return (
    <svg className={cn('doodle', className)} viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
      <path d="M64 30C130 6 300 4 370 38c36 18 22 64-46 84-88 25-232 20-290-14C-8 82 18 40 92 22c58-14 160-16 214-6" />
    </svg>
  )
}
