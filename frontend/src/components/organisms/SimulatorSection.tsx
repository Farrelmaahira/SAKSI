import { Suspense } from "react";
import Simulator from "./SimulatorLazy";

export default function SimulatorSection() {
  return (
    <section className="pt-80 px-0 pb-120 [scroll-margin-top:2rem] lg:pt-100 lg:px-0 lg:pb-180" id="simulasi">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="[align-items:end] flex flex-wrap gap-30 justify-between mb-50 lg:mb-70">
          <div>
            <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Simulasi</p>
            <h2
              className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8"
              data-split
            >
              Lima langkah, satu kontrak.
            </h2>
          </div>
          <p className="text-[1.5rem] leading-[1.5] max-w-340 opacity-[0.7]">
            Semua data di sini contoh. Tidak ada yang dikirim ke mana pun.
          </p>
        </div>
        <Suspense>
          <Simulator />
        </Suspense>
      </div>
    </section>
  );
}
