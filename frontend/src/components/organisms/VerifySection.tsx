import type { SealedContract } from '@/interfaces/contract'
import VerifyDoc from './VerifyDoc'

export interface VerifySectionProps {
  registry: SealedContract[]
  onOpen: (code: string) => void
}

export default function VerifySection({ registry, onOpen }: VerifySectionProps) {
  return (
    <section className="verify-sec">
      <div className="container">
        <VerifyDoc registry={registry} onOpen={onOpen} />
      </div>
    </section>
  )
}
