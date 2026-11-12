import { formatRp } from "@/lib/contracts/format-rp";
import type { SealedContract } from "@/interfaces/contract";

interface Props {
  c: SealedContract;
}

/* Parties, value, term and start date; parts the village chose to hide say so */
export default function ContractFacts({ c }: Props) {
  const hides = (f: string) => Boolean(c.hidden?.includes(f));

  return (
    <dl className="bg-soft rounded-[1.6rem] py-8 px-24 [&>div]:border-b-[0.1rem] [&>div]:border-b-[rgba(15,_15,_23,_0.1)] [&>div]:[border-bottom-style:solid] [&>div]:grid [&>div]:gap-4 [&>div]:py-16 [&>div]:px-0 [&>div:last-child]:border-b-0 [&>div:last-child]:[border-bottom-style:none] [&_dt]:text-[1.3rem] [&_dt]:opacity-[0.6] [&_dt]:uppercase [&_dd]:text-[1.7rem] [&_dd]:leading-[1.4] [&_small]:text-[1.4rem] [&_small]:opacity-[0.6] md:[&>div]:items-baseline md:[&>div]:grid-cols-[18rem_1fr]">
      <div>
        <dt>Pihak pertama</dt>
        <dd>{c.first}</dd>
      </div>
      <div>
        <dt>Pihak kedua</dt>
        <dd>
          {hides("pihak") ? (
            <span className="text-[1.5rem] opacity-[0.6]">
              Tidak dipublikasikan desa
            </span>
          ) : (
            c.second
          )}
        </dd>
      </div>
      <div>
        <dt>Nilai</dt>
        <dd>
          {hides("nilai") ? (
            <span className="text-[1.5rem] opacity-[0.6]">
              Tidak dipublikasikan desa
            </span>
          ) : (
            <>
              {formatRp(c.value)}
              {c.valueNote && <small> {c.valueNote}</small>}
            </>
          )}
        </dd>
      </div>
      <div>
        <dt>Jangka waktu</dt>
        <dd>{c.duration}</dd>
      </div>
      <div>
        <dt>Mulai berlaku</dt>
        <dd>{c.start}</dd>
      </div>
    </dl>
  );
}
