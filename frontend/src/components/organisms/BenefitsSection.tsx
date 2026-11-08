import BenefitCard from "@/components/molecules/BenefitCard";
import { benefits } from "@/data/home";

export default function BenefitsSection() {
  return (
    <section className="py-120 px-0 lg:py-180 lg:px-0" id="manfaat">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="mb-60 lg:mb-100">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Manfaat</p>
          <h2 className="text-[5.2rem] font-[320] tracking-[-0.04em] leading-[1] md:text-[8rem] lg:text-[12rem]">Siapa yang terbantu.</h2>
        </div>
        <div className="grid gap-y-50 gap-x-20 md:grid-cols-[1fr_1fr] lg:gap-30 lg:grid-cols-[repeat(4,1fr)]">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
