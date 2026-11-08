import FaqItem from "@/components/molecules/FaqItem";
import { faq } from "@/data/simulasi";

export default function FaqSection() {
  return (
    <section className="py-120 px-0 lg:py-180 lg:px-0">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 grid gap-50 lg:gap-100 lg:grid-cols-[0.85fr_1.15fr] container">
        <div data-reveal>
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Pertanyaan</p>
          <h2 className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8" data-split>Yang sering ditanyakan.</h2>
        </div>
        <div className="[&_summary::-webkit-details-marker]:hidden [&_details_p]:text-[1.8rem] [&_details_p]:leading-[1.6] [&_details_p]:max-w-660 [&_details_p]:opacity-[0.8] [&_details_p]:pb-28 lg:[&_summary]:text-[2.6rem] lg:[&_details_p]:text-[2rem]" data-reveal>
          {faq.map((entry) => (
            <FaqItem key={entry.question} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
