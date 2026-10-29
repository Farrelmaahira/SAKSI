import type { SealedContract } from '@/interfaces/contract'
import VerifyDoc from './VerifyDoc'

interface Props {
  registry: SealedContract[]
  onOpen: (code: string) => void
}

export default function VerifySection({ registry, onOpen }: Props) {
  return (
    <section className="verify-sec">
      <div className="container">
        <VerifyDoc registry={registry} onOpen={onOpen} />
      </div>
    </section>
  )
}
