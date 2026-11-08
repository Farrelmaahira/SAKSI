import Check from '@/components/atoms/Check'
import type { Milestone } from '@/interfaces/contract'

interface Props {
  milestone: Milestone
}

export default function MilestoneItem({ milestone: m }: Props) {
  return (
    <li className={`[.timeline_&.is-pending]:opacity-[0.55] is-${m.status}`}>
      <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex flex-none h-28 justify-center w-28 [.is-current>&]:after:bg-current [.is-current>&]:after:rounded-[50%] [.is-current>&]:after:content-[''] [.is-current>&]:after:h-10 [.is-current>&]:after:w-10 [.timeline_.is-done_&]:bg-white [.timeline_.is-done_&]:border-white [.timeline_.is-done_&]:text-blue">{m.status === 'done' && <Check />}</span>
      <div>
        <strong>{m.label}</strong>
        <small>{m.date}</small>
        {m.note && <p>{m.note}</p>}
      </div>
    </li>
  )
}
