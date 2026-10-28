import Grip from '@/components/atoms/Grip'
import { clauses, distractor, signItems, types } from '@/data/simulator'
import TypeCardBody from './TypeCardBody'

export interface DragPreviewProps {
  id: string | null
}

/* The card that follows the pointer while dragging. */
export default function DragPreview({ id }: DragPreviewProps) {
  if (!id) return null
  const t = types.find((x) => x.id === id)
  if (t)
    return (
      <div className="drag-item type-card is-overlay">
        <TypeCardBody option={t} />
      </div>
    )
  const c = [...clauses, distractor].find((x) => x.id === id)
  if (c)
    return (
      <div className="drag-item clause-chip is-overlay">
        <Grip />
        {c.title}
      </div>
    )
  const s = signItems.find((x) => x.id === id)
  if (s)
    return (
      <div className="drag-item sign-chip is-overlay">
        <Grip />
        {s.label}
      </div>
    )
  return null
}
