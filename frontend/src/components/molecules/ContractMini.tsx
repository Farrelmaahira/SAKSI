import type { DContract } from "@/interfaces/db";
import Link from "next/link";
import StatusBadge from "@/components/atoms/StatusBadge";
import Bar from "@/components/atoms/Bar";
import { progressOf } from "@/lib/db/progress-of";
import { isLate } from "@/lib/db/is-late";

interface Props {
  c: DContract;
}

export default function ContractMini({ c }: Props) {
  return (
    <Link
      className="border-[0.15rem] border-[#ececea] border-solid rounded-[1.4rem] grid gap-8 p-14 [transition:border-color_0.2s,_box-shadow_0.2s] [&:hover]:border-ink [&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [&_strong]:font-[420]"
      href={`/dashboard/kontrak/${c.code}`}
    >
      <div className="items-center flex justify-between [&_code]:text-[1.2rem] [&_code]:text-dim">
        <code>{c.code}</code>
        <StatusBadge status={c.status} />
      </div>
      <strong>{c.title}</strong>
      <div className="items-center flex text-[1.3rem] gap-10">
        <Bar value={progressOf(c)} tone={isLate(c) ? "red" : "blue"} />
        <span>{progressOf(c)}%</span>
      </div>
    </Link>
  );
}
