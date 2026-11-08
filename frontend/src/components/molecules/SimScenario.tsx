import Illustration from "@/components/atoms/Illustration";
import { BASE_VALUE } from "@/data/simulator";
import { formatRp } from "@/lib/contracts/format-rp";

export default function SimScenario() {
  return (
    <div className="items-center bg-blue rounded-[2rem] text-white grid gap-24 grid-cols-[auto_1fr] mb-16 p-24 [&_img]:w-110 md:py-30 md:px-40 md:[&_img]:w-180">
      <Illustration name="village-hero" />
      <div>
        <p className="text-[1.3rem] mb-8 opacity-[0.7] uppercase">Skenario</p>
        <p className="text-[1.8rem] font-[320] tracking-[-0.01em] leading-[1.4] max-w-900 md:text-[2.4rem]">
          Desa Sukamaju akan membeli 40 sak semen dan 6 m³ pasir dari CV Maju
          Bersama untuk memperbaiki jalan Dusun Krajan. Nilainya{" "}
          {formatRp(BASE_VALUE)}.
        </p>
      </div>
    </div>
  );
}
