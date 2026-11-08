import HeroBg from '@/components/atoms/HeroBg'
import PillButton from '@/components/atoms/PillButton'

export default function NotFoundTemplate() {
  return (
    <main>
      <section className="bg-ink text-white overflow-hidden pt-140 px-0 pb-80 relative lg:pt-200 lg:px-0 lg:pb-110 page-hero">
        <HeroBg />
        <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">404</p>
          <h1 className="text-[5rem] font-[320] tracking-[-0.04em] leading-[1] mb-36 md:text-[7.2rem] lg:text-[clamp(7.2rem,_7.4vw,_12rem)] lg:mb-50 page-title">Halaman ini tidak ada di arsip.</h1>
          <PillButton to="/">Kembali ke beranda</PillButton>
        </div>
      </section>
    </main>
  )
}
