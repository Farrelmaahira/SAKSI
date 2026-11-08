import PillButton from "@/components/atoms/PillButton";

export default function CtaBand() {
  return (
    <section className="bg-ink text-white py-120 px-0 lg:py-160 lg:px-0">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 grid gap-40 [&_h2]:max-w-1100 lg:[align-items:end] lg:grid-cols-[1fr_auto] container">
        <h2 className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8">
          Sudah paham alurnya? Lacak kontrak yang sedang berjalan.
        </h2>
        <PillButton to="/lacak">Buka Lacak dan Lapor</PillButton>
      </div>
    </section>
  );
}
