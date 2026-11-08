import HeroBg from '@/components/atoms/HeroBg'
import PillButton from '@/components/atoms/PillButton'
import Underline from '@/components/atoms/Underline'
import ScrollLink from '@/components/molecules/ScrollLink'

export default function HomeHero() {
  return (
    <section className="bg-ink text-white flex flex-col justify-end min-h-svh overflow-hidden pt-120 px-0 pb-40 sticky top-0 z-0 [&_h1]:text-[5.6rem] [&_h1]:font-[320] [&_h1]:tracking-[-0.04em] [&_h1]:leading-[1] [&_h1]:mb-24 md:[&_h1]:text-[8rem] lg:pt-140 lg:px-0 lg:pb-60 lg:[&_h1]:text-[12rem] lg:[&_h1]:mb-40">
      <HeroBg />
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 md:py-0 md:px-40 lg:py-0 lg:px-80 [align-items:end] grid gap-40 relative w-full z-1 lg:grid-cols-[1fr_auto] [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="max-w-1300 [&>p]:text-[rgba(255,_255,_255,_0.85)] [&>p]:text-[1.7rem] [&>p]:leading-[1.5] [&>p]:mb-36 [&>p]:max-w-520 [&>p_strong]:text-white [&>p_strong]:font-[500] md:[&>p]:text-[2rem] lg:[&>p]:mb-50">
          <h1>
            Setiap rupiah dana desa punya{' '}
            <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
              saksi.
              <Underline className="bottom-[-0.12em] h-[0.28em] left-[-2%] absolute w-[104%]" />
            </span>
          </h1>
          <p>
            <strong>SAKSI</strong>, Sistem Audit Kontrak Segel Integritas. Sistem kontrak digital untuk pemerintah desa dan UMKM.
          </p>
          <div className="items-center flex gap-30">
            <PillButton href="#masalah">Kenapa penting</PillButton>
            <ScrollLink href="#masalah">Scroll</ScrollLink>
          </div>
        </div>
        <a className="text-[1.2rem] [justify-self:start] tracking-[0.02em] opacity-[0.7] uppercase [transition:opacity_0.3s] [&:hover]:opacity-[1] lg:text-[1.3rem] lg:[justify-self:end]" href="https://unsplash.com/@akhnaf17_" target="_blank" rel="noreferrer">
          Foto: Akhnaf / Unsplash
        </a>
      </div>
    </section>
  )
}

