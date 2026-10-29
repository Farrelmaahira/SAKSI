import Grip from '@/components/atoms/Grip'
import TypeIcon from '@/components/atoms/TypeIcon'
import type { ContractTypeOption } from '@/interfaces/simulator'

interface Props {
  option: ContractTypeOption
}

export default function TypeCardBody({ option }: Props) {
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
