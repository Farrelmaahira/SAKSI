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
    <div ref={setNodeRef} className={cn('drop-zone', className, isOver && 'is-over')}>
      {children}
    </div>
  )
}
