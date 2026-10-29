import Check from '@/components/atoms/Check'
import type { Milestone } from '@/interfaces/contract'

interface Props {
  milestone: Milestone
}

export default function MilestoneItem({ milestone: m }: Props) {
  return (
    <li className={`is-${m.status}`}>
      <span className="tl-dot">{m.status === 'done' && <Check />}</span>
      <div>
        <strong>{m.label}</strong>
        <small>{m.date}</small>
        {m.note && <p>{m.note}</p>}
      </div>
    </li>
  )
}
