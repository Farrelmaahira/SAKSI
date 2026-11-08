import type { SealedContract } from "@/interfaces/contract";
import { formatRp } from "@/lib/contracts/format-rp";
import { shortHash } from "@/lib/contracts/short-hash";
import { cn } from "@/lib/utils";

interface Props {
  contract: SealedContract;
  active: boolean;
  onOpen: (code: string) => void;
}

export default function OpenContractCard({
  contract: c,
  active,
  onOpen,
}: Props) {
  return (
    <button
      type="button"
      className={cn("bg-soft border-[0.2rem] border-transparent border-solid rounded-[1.6rem] text-ink flex flex-col gap-12 p-24 text-left [transition:transform_0.3s_var(--ease-saksi),_border-color_0.3s] [&:hover]:[transform:translateY(-0.4rem)] [&.is-active]:border-blue [&_strong]:text-[2rem] [&_strong]:font-[400] [&_strong]:leading-[1.25]", active && "[.app-nav_a&]:bg-white [.app-nav_a&]:[box-shadow:0.4rem_0.4rem_0_var(--color-ink)] [.app-nav_a&]:text-blue is-active")}
      onClick={() => onOpen(c.code)}
    >
      <span className="items-center flex gap-10 justify-between">
        <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit]">{c.type}</span>
        <span className="font-code text-[1.3rem]">{c.code}</span>
      </span>
      <strong>{c.title}</strong>
      <span className="text-[1.4rem] opacity-[0.65]">
        {c.village} · {formatRp(c.value)}
      </span>
      <span className="bg-white rounded-[1rem] h-6 mt-auto overflow-hidden [&_span]:bg-blue [&_span]:block [&_span]:h-full">
        <span style={{ width: `${c.progress}%` }} />
      </span>
      <span className="[&_code]:font-code flex text-[1.3rem] gap-10 justify-between [&_code]:opacity-[0.6]">
        <span>{c.progress}% selesai</span>
        <code>{shortHash(c.hash)}</code>
      </span>
    </button>
  );
}
