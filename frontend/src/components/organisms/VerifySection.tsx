import type { SealedContract } from '@/interfaces/contract'
import VerifyDoc from './VerifyDoc'

interface Props {
  registry: SealedContract[]
  onOpen: (code: string) => void
}

export default function VerifySection({ registry, onOpen }: Props) {
  return (
    <section className="bg-ink text-white py-120 px-0 lg:py-160 lg:px-0">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <VerifyDoc registry={registry} onOpen={onOpen} />
      </div>
    </section>
  )
}
