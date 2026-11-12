import MilestoneItem from "@/components/molecules/MilestoneItem";
import type { SealedContract } from "@/interfaces/contract";

interface Props {
  c: SealedContract;
}

/* Blue card: progress, payment and the milestones of the work */
export default function ProgressCard({ c }: Props) {
  return (
    <div className="bg-blue rounded-[1.6rem] text-white p-28">
      <div className="items-baseline flex justify-between [&_p]:text-[1.3rem] [&_p]:opacity-[0.8] [&_p]:uppercase [&_strong]:text-[6rem] [&_strong]:font-[300] [&_strong]:tracking-[-0.04em] [&_strong]:leading-[1]">
        <p>Progres pekerjaan</p>
        <strong>{c.progress}%</strong>
      </div>
      <div className="bg-deep rounded-[1rem] h-10 mt-16 overflow-hidden [&_span]:bg-white [&_span]:block [&_span]:h-full">
        <span style={{ width: `${c.progress}%` }} />
      </div>
      {c.paidPercent !== undefined && (
        <p className="text-[1.4rem] mt-12 opacity-[0.85]">
          Sudah dibayar {c.paidPercent}% dari nilai kontrak
        </p>
      )}
      <ol className="grid gap-22 list-none list-outside mt-30 [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[2.8rem_1fr] [&_strong]:block [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.75] [&_p]:text-[1.4rem] [&_p]:leading-[1.45] [&_p]:mt-4 [&_p]:opacity-[0.85] timeline">
        {c.milestones.map((m) => (
          <MilestoneItem key={m.label} milestone={m} />
        ))}
      </ol>
    </div>
  );
}
