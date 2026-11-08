import Illustration from '@/components/atoms/Illustration'
import CurvedArrow from '@/components/atoms/CurvedArrow'

export default function PatternSection() {
  return (
    <section className="py-120 px-0 lg:py-180 lg:px-0">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 grid gap-50 lg:grid-cols-[1fr_1fr] lg:gap-100 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div data-reveal>
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Catatan KPK</p>
          <h2 className="text-[5.2rem] font-[320] tracking-[-0.04em] leading-[1] md:text-[8rem] lg:text-[12rem]">Modusnya berulang.</h2>
        </div>
        <ol className="[--f:2.6rem] [--no:3rem] border-t-[0.1rem] border-t-[rgba(15,_15,_23,_0.2)] [border-top-style:solid] list-none list-outside [&_li]:items-start [&_li]:border-b-[0.1rem] [&_li]:border-b-[rgba(15,_15,_23,_0.2)] [&_li]:[border-bottom-style:solid] [&_li]:flex [&_li]:text-[length:var(--f)] [&_li]:font-[320] [&_li]:gap-24 [&_li]:tracking-[-0.03em] [&_li]:leading-[1.2] [&_li]:py-26 [&_li]:px-0 [&_li_span]:items-center [&_li_span]:text-blue [&_li_span]:flex [&_li_span]:flex-none [&_li_span]:text-[length:var(--no)] [&_li_span]:[font-variant-numeric:tabular-nums] [&_li_span]:h-[calc(var(--f)_*_1.2)] [&_li_span]:tracking-[0] [&_li_span]:w-[calc(var(--no)_*_1.3)] md:[--f:3.6rem] md:[--no:4rem] lg:[--f:4.4rem] lg:[--no:4.8rem] lg:[&_li]:py-34 lg:[&_li]:px-0 pattern-list" data-reveal>
          <li>
            <span>01</span>Penggelembungan anggaran
          </li>
          <li>
            <span>02</span>Proyek fiktif
          </li>
          <li>
            <span>03</span>Laporan tidak sesuai kondisi lapangan
          </li>
          <li className="[.pattern-list_li&]:text-blue [.pattern-list_li&_span]:[font-size:0] [.pattern-list_li&_span::before]:items-center [.pattern-list_li&_span::before]:bg-blue [.pattern-list_li&_span::before]:rounded-[50%] [.pattern-list_li&_span::before]:text-white [.pattern-list_li&_span::before]:content-['!'] [.pattern-list_li&_span::before]:flex [.pattern-list_li&_span::before]:text-[length:calc(var(--no)_*_0.75)] [.pattern-list_li&_span::before]:font-[500] [.pattern-list_li&_span::before]:h-[calc(var(--no)_*_1.1)] [.pattern-list_li&_span::before]:justify-center [.pattern-list_li&_span::before]:w-[calc(var(--no)_*_1.1)]">
            <span>!</span>Belum ada sistem yang khusus mengurus kontrak desa
          </li>
        </ol>
      </div>

      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="items-center grid gap-40 mt-100 md:grid-cols-[0.8fr_1.2fr] md:p-0 lg:mt-180 lg:py-0 lg:px-60" data-reveal>
          <div className="[&_img]:my-0 [&_img]:mx-auto [&_img]:w-[60%] md:[&_img]:w-[80%]">
            <Illustration name="document-warning_2es6" />
          </div>
          <div className="research-copy">
            <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Riset Olken, 2007</p>
            <p className="text-blue text-[14rem] font-[300] tracking-[-0.06em] leading-[0.9] mb-30 relative [&_span]:text-[3rem] [&_span]:tracking-[-0.02em] [&_span]:ml-15 lg:text-[24rem] lg:[&_span]:text-[4.4rem]">
              <CurvedArrow className="text-ink h-70 -left-90 absolute -top-50 w-90 hidden md:block" />
              8<span>poin persen</span>
            </p>
            <p className="text-[2rem] leading-[1.5] max-w-520 lg:text-[2.4rem]">Penurunan dana yang hilang ketika audit dilakukan secara menyeluruh. Pengawasan yang rapi terbukti berpengaruh.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
