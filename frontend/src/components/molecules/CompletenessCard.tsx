import Check from "@/components/atoms/Check";
import { clauses } from "@/data/simulator";

/* "Audit kelengkapan": how many of the required clauses are on the draft, as a count, a bar and a checklist */
export default function CompletenessCard({ placed }: { placed: string[] }) {
  return (
    <div className="bg-white rounded-[1.4rem] mt-10 p-20 [&_ul]:grid [&_ul]:gap-y-8 [&_ul]:gap-x-12 [&_ul]:grid-cols-[1fr_1fr] [&_ul]:list-none [&_ul]:list-outside [&_ul]:mt-16 [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-8 [&_li]:opacity-[0.5] audit">
      <div className="items-baseline flex justify-between [&_p]:text-[1.3rem] [&_p]:uppercase [&_strong]:text-blue [&_strong]:text-[2.6rem] [&_strong]:font-[400]">
        <p>Audit kelengkapan</p>
        <strong>
          {placed.length}/{clauses.length}
        </strong>
      </div>
      <div className="bg-soft rounded-[1rem] h-8 mt-10 overflow-hidden [&_span]:bg-blue [&_span]:block [&_span]:h-full [&_span]:[transition:width_0.5s_var(--ease-saksi)]">
        <span style={{ width: `${(placed.length / clauses.length) * 100}%` }} />
      </div>
      <ul>
        {clauses.map((c) => (
          <li
            key={c.id}
            className={
              placed.includes(c.id) ? "[.audit_li&]:opacity-[1] ok" : ""
            }
          >
            {placed.includes(c.id) ? (
              <Check />
            ) : (
              <span className="border-[0.15rem] border-current border-solid rounded-[50%] flex-none h-12 m-3 w-12" />
            )}
            {c.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
