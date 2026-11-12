import type { FormEvent } from 'react'
import Arrow from '@/components/atoms/Arrow'
import HeroBg from '@/components/atoms/HeroBg'
import TrackHeading from '@/components/organisms/TrackHeading'
import type { SealedContract } from '@/interfaces/contract'

interface Props {
  registry: SealedContract[]
  input: string
  onInput: (value: string) => void
  onSearch: (e: FormEvent) => void
  onOpen: (code: string) => void
}

export default function TrackHero({ registry, input, onInput, onSearch, onOpen }: Props) {
  // only a contract whose published detail is loaded carries its seal hash
  const sample = registry.find((c) => c.hash)
  return (
    <section className="bg-ink text-white overflow-hidden pt-140 px-0 relative lg:pt-200 lg:px-0 page-hero pb-80 lg:pb-110">
      <HeroBg />
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <TrackHeading />
        <form className="bg-white rounded-[6rem] flex gap-6 mt-10 max-w-920 p-6 [&_input]:bg-transparent [&_input]:border-0 [&_input]:border-none [&_input]:text-ink [&_input]:flex-1 [&_input]:text-[1.6rem] [&_input]:min-w-0 [&_input]:[outline:0] [&_input]:py-0 [&_input]:px-20 [&_button]:items-center [&_button]:bg-ink [&_button]:border-0 [&_button]:border-none [&_button]:rounded-[6rem] [&_button]:text-white [&_button]:inline-flex [&_button]:flex-none [&_button]:text-[1.4rem] [&_button]:gap-10 [&_button]:h-52 [&_button]:py-0 [&_button]:px-24 [&_button]:uppercase [&_button]:[transition:background_0.3s] [&_button:hover]:bg-deep focus-within:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] md:[&_input]:text-[2rem] md:[&_input]:py-0 md:[&_input]:px-28 md:[&_button]:text-[1.5rem] md:[&_button]:h-64 md:[&_button]:py-0 md:[&_button]:px-32" onSubmit={onSearch} role="search">
          <label htmlFor="track-q" className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">
            Kode kontrak atau hash
          </label>
          <input id="track-q" value={input} onChange={(e) => onInput(e.target.value)} placeholder="Contoh: SKS-2026-014 atau 64 karakter hash" autoComplete="off" spellCheck={false} />
          <button type="submit" aria-label="Lacak">
            Lacak <Arrow />
          </button>
        </form>
        {registry.length > 0 && (
          <div className="items-center flex flex-wrap text-[1.4rem] gap-10 mt-24 [&_button]:bg-transparent [&_button]:border-[0.1rem] [&_button]:border-[rgba(255,_255,_255,_0.6)] [&_button]:border-solid [&_button]:rounded-[3rem] [&_button]:text-white [&_button]:font-code [&_button]:text-[1.25rem] [&_button]:py-6 [&_button]:px-14 [&_button]:[transition:background_0.3s,_color_0.3s] [&_button:hover]:bg-white [&_button:hover]:text-blue">
            <span>Coba:</span>
            {registry.slice(0, 3).map((c) => (
              <button key={c.code} type="button" onClick={() => onOpen(c.code)}>
                {c.code}
              </button>
            ))}
            {sample && (
              <button type="button" onClick={() => onOpen(sample.hash)}>
                hash {sample.hash.slice(0, 12)}
              </button>
            )}
          </div>
        )}
        <p className="text-[1.3rem] mt-30 opacity-[0.7]">Data di halaman ini adalah contoh untuk keperluan desain.</p>
      </div>
    </section>
  )
}
