'use client'

import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  children: ReactNode
  className?: string
}

export default function DropZone({ id, children, className }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={cn('[transition:box-shadow_0.2s,_background_0.2s] [&.is-over]:[box-shadow:0_0_0_0.3rem_var(--color-blue)]', className, isOver && 'is-over')}>
      {children}
    </div>
  )
}
