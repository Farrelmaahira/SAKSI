'use client'

import type { ReactNode } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

export interface DragItemProps {
  id: string
  children: ReactNode
  className?: string
  onPick?: () => void
  disabled?: boolean
}

/* A card that can be dragged, or tapped/clicked as a fallback on touch and keyboard. */
export default function DragItem({ id, children, className, onPick, disabled }: DragItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled })
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn('drag-item', className, isDragging && 'is-dragging')}
      {...attributes}
      {...listeners}
      onClick={onPick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
