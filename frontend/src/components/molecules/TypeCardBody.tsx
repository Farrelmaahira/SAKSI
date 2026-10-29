import Grip from '@/components/atoms/Grip'
import TypeIcon from '@/components/atoms/TypeIcon'
import type { ContractTypeOption } from '@/interfaces/simulator'

export interface TypeCardBodyProps {
  option: ContractTypeOption
}

export default function TypeCardBody({ option }: TypeCardBodyProps) {
  return (
    <>
      <Grip />
      <TypeIcon kind={option.id} />
      <span>
        <strong>{option.id}</strong>
        <small>{option.note}</small>
      </span>
    </>
  )
}
