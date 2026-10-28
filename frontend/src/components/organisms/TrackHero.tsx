import type { FormEvent } from 'react'
import Arrow from '@/components/atoms/Arrow'
import HeroBg from '@/components/atoms/HeroBg'
import Underline from '@/components/atoms/Underline'
import type { SealedContract } from '@/interfaces/contract'

export interface TrackHeroProps {
  registry: SealedContract[]
  input: string
  onInput: (value: string) => void
  onSearch: (e: FormEvent) => void
  onOpen: (code: string) => void
}

export default function TrackHero({ registry, input, onInput, onSearch, onOpen }: TrackHeroProps) {
  return (
    <section className="page-hero track-hero">
      <HeroBg />
      <div className="container">
        <p className="label">Lacak dan lapor</p>
        <h1 className="page-title">
          <span className="title-line">Lacak kontrak,</span> laporkan{' '}
          <span className="marked">
            kejanggalan.
            <Underline className="hero-underline" />
          </span>
        </h1>
        <p className="page-lead">Masukkan kode kontrak atau hash dokumen. Anda bisa melihat isi kontrak, progres pekerjaan, dan laporan warga lainnya.</p>
        <form className="search" onSubmit={onSearch} role="search">
          <label htmlFor="track-q" className="sr-only">
            Kode kontrak atau hash
          </label>
          <input id="track-q" value={input} onChange={(e) => onInput(e.target.value)} placeholder="Contoh: SKS-2026-014 atau 64 karakter hash" autoComplete="off" spellCheck={false} />
          <button type="submit" aria-label="Lacak">
            Lacak <Arrow />
          </button>
        </form>
        {registry.length > 0 && (
          <div className="search-chips">
            <span>Coba:</span>
            {registry.slice(0, 3).map((c) => (
              <button key={c.code} type="button" onClick={() => onOpen(c.code)}>
                {c.code}
              </button>
            ))}
            <button type="button" onClick={() => onOpen(registry[registry.length - 1].hash.slice(0, 12))}>
              hash {registry[registry.length - 1].hash.slice(0, 12)}
            </button>
          </div>
        )}
        <p className="dummy-note">Data di halaman ini adalah contoh untuk keperluan desain.</p>
      </div>
    </section>
  )
}
