import type { Ref } from "react";
import FormAlert from "@/components/atoms/FormAlert";
import Illustration from "@/components/atoms/Illustration";
import type { SealedContract } from "@/interfaces/contract";
import ReportForm from "./ReportForm";

interface ReportSectionProps {
  ref: Ref<HTMLElement>;
  registry: SealedContract[];
  code: string;
  onCode: (code: string) => void;
  onOpen: (code: string) => void;
  error?: string;
}

export default function ReportSection({
  ref,
  registry,
  code,
  onCode,
  onOpen,
  error,
}: ReportSectionProps) {
  return (
    <section
      className="py-120 px-0 [scroll-margin-top:1rem] lg:py-160 lg:px-0"
      id="lapor"
      ref={ref}
    >
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 grid gap-50 lg:[align-items:start] lg:gap-80 lg:grid-cols-[0.8fr_1.2fr] container">
        <div className="[&>p:not(.label)]:text-[1.8rem] [&>p:not(.label)]:leading-[1.55] [&>p:not(.label)]:my-30 [&>p:not(.label)]:mx-0 [&>p:not(.label)]:max-w-520 [&_img]:mt-50 [&_img]:max-w-300 lg:sticky lg:top-40">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">
            Lapor
          </p>
          <h2 className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8">
            Laporkan kejanggalan.
          </h2>
          <p>
            Laporan yang baik menyebut pasal yang tidak sesuai, menceritakan apa
            yang terlihat, dan menyertakan foto bila ada.
          </p>
          <ol className="grid gap-14 list-none list-outside [&_li]:items-baseline [&_li]:flex [&_li]:text-[1.8rem] [&_li]:gap-14 [&_span]:text-blue [&_span]:text-[1.3rem]">
            <li>
              <span>01</span>Pilih kontrak dan jenis masalahnya
            </li>
            <li>
              <span>02</span>Tunjuk pasal yang dilanggar
            </li>
            <li>
              <span>03</span>Kirim, lalu pantau dengan nomor tiket
            </li>
          </ol>
          <Illustration name="data-reports_l2u3" />
        </div>
        {registry.length > 0 && code && (
          <div className="grid gap-20">
            {error && <FormAlert>{error}</FormAlert>}
            <ReportForm
              registry={registry}
              code={code}
              onCode={onCode}
              onOpen={onOpen}
            />
          </div>
        )}
      </div>
    </section>
  );
}
