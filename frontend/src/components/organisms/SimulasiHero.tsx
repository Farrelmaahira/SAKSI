import Illustration from "@/components/atoms/Illustration";
import CurvedArrow from "@/components/atoms/CurvedArrow";
import HeroBg from "@/components/atoms/HeroBg";
import PillButton from "@/components/atoms/PillButton";
import Underline from "@/components/atoms/Underline";
import ScrollLink from "@/components/molecules/ScrollLink";

export default function SimulasiHero() {
  return (
    <section className="bg-ink text-white overflow-hidden pt-140 px-0 pb-80 relative lg:pt-200 lg:px-0 lg:pb-110 page-hero">
      <HeroBg />
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 grid lg:[align-items:end] lg:gap-x-80 lg:[grid-template-areas:'copy_copy'_'body_art'] lg:grid-cols-[minmax(0,1fr)_auto] container">
        <div className="lg:[grid-area:copy]">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">
            Simulasi dan tentang SAKSI
          </p>
          <h1 className="text-[5rem] font-[320] tracking-[-0.04em] leading-[1] mb-36 md:text-[7.2rem] lg:text-[clamp(7.2rem,_7.4vw,_12rem)] lg:mb-50 page-title">
            <span className="lg:block">Coba buat kontrak desa,</span> langkah
            demi{" "}
            <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
              langkah.
              <Underline className="bottom-[-0.12em] h-[0.28em] left-[-2%] absolute w-[104%]" />
            </span>
          </h1>
        </div>
        <div className="lg:[grid-area:body]">
          <p className="text-[rgba(255,_255,_255,_0.85)] text-[1.8rem] leading-[1.5] mb-40 max-w-560 md:text-[2rem]">
            Tidak perlu paham hukum. Ikuti panduan, seret kartu, dan lihat
            bagaimana SAKSI menjaga kontrak dari draf sampai diawasi warga.
          </p>
          <div className="items-center flex gap-30">
            <PillButton href="#simulasi">Mulai simulasi</PillButton>
            <ScrollLink href="#tentang">Tentang SAKSI</ScrollLink>
          </div>
        </div>
        <div
          className="hidden [&_img]:[filter:drop-shadow(1rem_1rem_0_var(--color-ink))] [&_img]:[transform:rotate(4deg)] [&_img]:w-full lg:block lg:[grid-area:art] lg:mr-40 lg:relative lg:w-200 xl:w-240"
          aria-hidden="true"
        >
          <p className="font-hand text-[3rem] leading-[1] absolute right-[calc(100%_+_1rem)] top-20 [transform:rotate(-6deg)] whitespace-nowrap">
            5 langkah saja
            <CurvedArrow className="h-56 left-[55%] absolute top-32 w-74" />
          </p>
          <Illustration name="contract-signed_vutk" loading="eager" />
        </div>
      </div>
    </section>
  );
}
