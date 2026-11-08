import Illustration from '@/components/atoms/Illustration'
import CurvedArrow from '@/components/atoms/CurvedArrow'

export default function ThemeSection() {
  return (
    <section className="bg-ink text-white py-120 px-0 lg:py-180 lg:px-0" id="tema">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="mb-80 text-center lg:mb-120" data-reveal>
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Tema</p>
          <h2 className="text-[5.2rem] font-[320] tracking-[-0.04em] leading-[1] md:text-[8rem] lg:text-[12rem]" data-split>Satu kontrak, dua peran.</h2>
        </div>
        <div className="items-center grid gap-50 text-center [&_article_p]:text-[rgba(255,_255,_255,_0.8)] [&_article_p]:text-[1.7rem] [&_article_p]:leading-[1.5] [&_article_p]:my-0 [&_article_p]:mx-auto [&_article_p]:max-w-400 lg:gap-140 lg:grid-cols-[1fr_auto_1fr] lg:[&_article]:text-left lg:[&_article:last-child]:text-right lg:[&_article_p]:text-[2rem] lg:[&_article_p]:m-0 lg:[&_article:last-child_p]:ml-auto theme-grid" data-reveal>
          <article>
            <p className="[.theme-grid_&]:text-[1.4rem] [.theme-grid_&]:mb-20 [.theme-grid_&]:uppercase">Public Service Tracking</p>
            <p className="[.theme-grid_&]:text-white [.theme-grid_&]:text-[4rem] [.theme-grid_&]:font-[320] [.theme-grid_&]:tracking-[-0.04em] [.theme-grid_&]:leading-[1] [.theme-grid_&]:mb-20 lg:[.theme-grid_&]:text-[6rem]">Patokan pelacakan</p>
            <p>Volume, nilai, dan tenggat di dalam kontrak menjadi acuan untuk membandingkan progres di lapangan.</p>
          </article>
          <div className="items-center flex justify-center relative">
            <CurvedArrow className="hidden h-90 absolute w-120 [&.left]:-left-130 [&.left]:-top-20 [&.left]:[transform:scaleX(-1)_rotate(-20deg)] [&.right]:-bottom-20 [&.right]:-right-130 [&.right]:[transform:rotate(160deg)]! lg:block left" />
            <div className="items-center bg-white rounded-[50%] [box-shadow:0_0_0_1.6rem_rgba(255,_255,_255,_0.12),_0_0_0_3.2rem_rgba(255,_255,_255,_0.06)] flex h-260 justify-center w-260 [&_img]:h-[66%] lg:h-400 lg:w-400">
              <Illustration name="contract-signed_vutk" alt="Ilustrasi kontrak yang telah ditandatangani" />
            </div>
            <CurvedArrow className="hidden h-90 absolute w-120 [&.left]:-left-130 [&.left]:-top-20 [&.left]:[transform:scaleX(-1)_rotate(-20deg)] [&.right]:-bottom-20 [&.right]:-right-130 [&.right]:[transform:rotate(160deg)]! lg:block right" />
          </div>
          <article>
            <p className="[.theme-grid_&]:text-[1.4rem] [.theme-grid_&]:mb-20 [.theme-grid_&]:uppercase">Civic Reporting &amp; Accountability</p>
            <p className="[.theme-grid_&]:text-white [.theme-grid_&]:text-[4rem] [.theme-grid_&]:font-[320] [.theme-grid_&]:tracking-[-0.04em] [.theme-grid_&]:leading-[1] [.theme-grid_&]:mb-20 lg:[.theme-grid_&]:text-[6rem]">Bukti laporan</p>
            <p>Laporan warga merujuk pada pasal yang jelas, sehingga pengawas punya dasar untuk menindaklanjuti.</p>
          </article>
        </div>
      </div>
    </section>
  )
}
