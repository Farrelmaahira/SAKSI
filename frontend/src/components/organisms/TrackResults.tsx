import type { Ref } from 'react'
import Illustration from '@/components/atoms/Illustration'
import OpenContractCard from '@/components/molecules/OpenContractCard'
import type { SealedContract } from '@/interfaces/contract'
import { shortHash } from '@/lib/contracts/short-hash'
import ContractDetail from './ContractDetail'

interface Props {
  ref: Ref<HTMLElement>
  registry: SealedContract[]
  loading: boolean
  query: string
  found?: SealedContract
  onOpen: (code: string) => void
  onReport: () => void
}

export default function TrackResults({ ref, registry, loading, query: q, found, onOpen, onReport }: Props) {
  return (
    <section className="track-results" ref={ref}>
      <div className="container">
        {loading && <p className="loading">Memuat arsip kontrak…</p>}

        {!loading && q && !found && (
          <div className="empty">
            <Illustration name="document-warning_2es6" />
            <div>
              <h2>Kontrak tidak ditemukan.</h2>
              <p>
                Tidak ada kontrak dengan kode atau hash <code>{q.length > 24 ? shortHash(q) : q}</code>. Periksa lagi penulisannya, atau pilih salah satu kontrak di bawah.
              </p>
            </div>
          </div>
        )}

        {found && <ContractDetail contract={found} onReport={onReport} />}

        <div className="open-list">
          <div className="open-head">
            <h2 className="display-sm">Kontrak terbuka</h2>
            <p>{registry.length} kontrak dapat dipantau</p>
          </div>
          <div className="open-grid">
            {registry.map((c) => (
              <OpenContractCard key={c.code} contract={c} active={found?.code === c.code} onOpen={onOpen} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
