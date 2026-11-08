import AboutCard from "@/components/molecules/AboutCard";
import FlowStep from "@/components/molecules/FlowStep";
import { about, flow } from "@/data/simulasi";

export default function AboutSection() {
  return (
    <section className="pt-120 px-0 pb-60 lg:pt-180 lg:px-0 lg:pb-80" id="tentang">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="mb-70 max-w-1240 lg:mb-100" data-reveal>
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Tentang</p>
          <h2 className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8">
            SAKSI menjaga kontrak dari draf sampai diawasi warga.
          </h2>
        </div>
        <div className="grid gap-50 [&_h3]:text-[3.2rem] [&_h3]:font-[350] [&_h3]:tracking-[-0.02em] [&_h3]:mt-16 [&_h3]:mx-0 [&_h3]:mb-14 [&_p]:text-[1.8rem] [&_p]:leading-[1.55] [&_p]:max-w-460 lg:gap-80 lg:grid-cols-[repeat(3,1fr)] lg:[&_h3]:text-[4rem] lg:[&_p]:text-[2rem]">
          {about.map((item, i) => (
            <AboutCard key={item.title} item={item} index={i} />
          ))}
        </div>
        <div className="[align-items:end] flex flex-wrap gap-y-10 gap-x-30 justify-between mt-90 mx-0 mb-24 [&_p:not(.label)]:text-[1.6rem] [&_p:not(.label)]:max-w-400 [&_p:not(.label)]:opacity-[0.65] lg:mt-120 lg:mx-0 lg:mb-30 flow-head" data-reveal>
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Alur kontrak di SAKSI</p>
          <p>Lima langkah yang sama akan Anda coba di simulasi di bawah.</p>
        </div>
        <ol className="grid gap-10 grid-cols-[1fr_1fr] list-none list-outside [&_li]:bg-soft [&_li]:rounded-[1.6rem] [&_li]:flex [&_li]:flex-col [&_li]:p-10 [&_li]:[transition:transform_0.5s_var(--ease-saksi)] [&_li:hover]:[transform:translateY(-0.4rem)] [&_li:last-child]:bg-blue [&_li:last-child]:text-white [&_li:last-child]:[grid-column:1_/_-1] lg:gap-16 lg:grid-cols-[repeat(5,1fr)] lg:[&_li]:p-12 lg:[&_li:last-child]:[grid-column:auto] flow" data-reveal>
          {flow.map((item, i) => (
            <FlowStep key={item.label} item={item} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
