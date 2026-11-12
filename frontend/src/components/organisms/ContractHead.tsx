import type { SealedContract } from "@/interfaces/contract";

interface Props {
  c: SealedContract;
}

/* Type and status tags, title and village of a published contract */
export default function ContractHead({ c }: Props) {
  return (
    <header className="mb-40 [&_h2]:text-[3.8rem] [&_h2]:font-[320] [&_h2]:tracking-[-0.035em] [&_h2]:leading-[1.05] [&_h2]:max-w-1200 [&>p]:text-[1.8rem] [&>p]:mt-14 [&>p]:opacity-[0.7] md:[&_h2]:text-[5.6rem] lg:[&_h2]:text-[7rem]">
      <div className="flex flex-wrap gap-8 mb-24">
        <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit]">
          {c.type}
        </span>
        <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit] outline">
          {c.code}
        </span>
        {c.fromSimulation && (
          <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit] outline">
            Dari simulasi
          </span>
        )}
      </div>
      <h2>{c.title}</h2>
      <p>{c.village}</p>
    </header>
  );
}
