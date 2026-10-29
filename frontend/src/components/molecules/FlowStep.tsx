import Illustration from '@/components/atoms/Illustration'
import type { FlowItem } from '@/interfaces/content'

export interface FlowStepProps {
  item: FlowItem
  index: number
}

export default function FlowStep({ item, index }: FlowStepProps) {
  return (
    <li>
      <div className="flow-art">
        <Illustration name={item.art} loading="lazy" />
      </div>
      <div className="flow-body">
        <span className="flow-no">0{index + 1}</span>
        <strong className="flow-label">{item.label}</strong>
        <p className="flow-desc">{item.desc}</p>
      </div>
    </li>
  )
}
