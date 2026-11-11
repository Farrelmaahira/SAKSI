import { useState } from 'react'
import { MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'

interface Targets {
  step: number
  onType: (id: string) => void
  onClause: (id: string) => void
  onSign: (id: string, zone: string) => void
}

/* Drag and drop of the simulator: what a dropped card does depends on the step it was dropped in. */
export function useSimDrag({ step, onType, onClause, onSign }: Targets) {
  const [dragging, setDragging] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 6 } }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null)
    if (!over) return
    const id = String(active.id)
    const target = String(over.id)
    if (step === 0 && target === 'desk') onType(id)
    if (step === 1 && target === 'draft') onClause(id)
    if (step === 2) onSign(id, target)
  }

  return {
    dragging,
    sensors,
    onDragStart: ({ active }: DragStartEvent) => setDragging(String(active.id)),
    onDragEnd,
    onDragCancel: () => setDragging(null),
  }
}
