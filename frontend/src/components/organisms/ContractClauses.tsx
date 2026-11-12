import type { SealedContract } from "@/interfaces/contract";

interface Props {
  c: SealedContract;
}

/* The clauses in a collapsible list, or a note that the village did not publish them */
export default function ContractClauses({ c }: Props) {
  const hides = (f: string) => Boolean(c.hidden?.includes(f));

  return hides("pasal") ? (
    <p className="border-b-[rgba(15,_15,_23,_0.15)] [&_summary]:items-center [&_summary]:[background:none] [&_summary]:[border:none] [&_summary]:[color:inherit] [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:[font-family:inherit] [&_summary]:font-[350] [&_summary]:gap-20 [&_summary]:justify-between [&_summary]:list-none [&_summary]:list-outside [&_summary]:py-26 [&_summary]:px-0 [&_summary]:text-left [&_summary]:[transition:opacity_0.2s] [&_summary]:w-full [&_summary:hover]:opacity-[0.85] [&_summary::-webkit-details-marker]:hidden bg-soft border-b-0 [border-bottom-style:none] rounded-[1.6rem] mt-20 py-0 px-24 [&_summary]:text-[1.8rem] [&_ol]:grid [&_ol]:gap-18 [&_ol]:list-none [&_ol]:list-outside [&_ol]:pb-26 [&_strong]:text-[1.5rem] [&_strong]:font-[500] [&_li_p]:text-[1.6rem] [&_li_p]:leading-[1.5] [&_li_p]:mt-4 [&_li_p]:opacity-[0.8] text-[1.5rem] leading-[1.5] opacity-[0.75]">
      Isi pasal tidak dipublikasikan desa. Keaslian dokumen tetap bisa dicek
      lewat hash di atas.
    </p>
  ) : (
    <details className="border-b-[rgba(15,_15,_23,_0.15)] [&_summary]:items-center [&_summary]:[background:none] [&_summary]:[border:none] [&_summary]:[color:inherit] [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:[font-family:inherit] [&_summary]:font-[350] [&_summary]:gap-20 [&_summary]:justify-between [&_summary]:list-none [&_summary]:list-outside [&_summary]:py-26 [&_summary]:px-0 [&_summary]:text-left [&_summary]:[transition:opacity_0.2s] [&_summary]:w-full [&_summary:hover]:opacity-[0.85] [&_summary::-webkit-details-marker]:hidden bg-soft border-b-0 [border-bottom-style:none] rounded-[1.6rem] mt-20 py-0 px-24 [&_summary]:text-[1.8rem] [&_ol]:grid [&_ol]:gap-18 [&_ol]:list-none [&_ol]:list-outside [&_ol]:pb-26 [&_strong]:text-[1.5rem] [&_strong]:font-[500] [&_li_p]:text-[1.6rem] [&_li_p]:leading-[1.5] [&_li_p]:mt-4 [&_li_p]:opacity-[0.8]">
      <summary>
        Isi kontrak, {c.clauses.length} pasal
        <span
          className="flex-none h-20 relative [transition:transform_0.4s_var(--ease-saksi)] w-20 before:bg-current before:content-[''] before:left-0 before:absolute before:top-[50%] before:h-1.5 before:w-full after:bg-current after:content-[''] after:left-0 after:absolute after:top-[50%] after:h-1.5 after:w-full after:[transform:rotate(90deg)] [.faq-item.is-open_&]:[transform:rotate(45deg)] [details[open]>summary_&]:[transform:rotate(45deg)]"
          aria-hidden="true"
        />
      </summary>
      <ol>
        {c.clauses.map((cl, i) => (
          <li key={cl.title}>
            <strong>
              Pasal {i + 1}. {cl.title}
            </strong>
            <p>{cl.text}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}
