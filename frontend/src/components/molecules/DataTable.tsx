import type { ReactNode } from "react";

interface Props {
  /* a plain label, or { label, numeric } for a right-aligned money or count column */
  columns: (string | { label: string; numeric: true })[];
  /* <tr> rows; give each <td> a data-label so phones can show it as "label: value" */
  children: ReactNode;
}

// on phones the table turns into one stacked card per row
const TABLE =
  "[border-collapse:collapse] text-[1.4rem] min-w-720 w-full [&_th]:border-b-[0.15rem] [&_th]:border-b-ink [&_th]:[border-bottom-style:solid] [&_th]:text-[1.2rem] [&_th]:font-[400] [&_th]:tracking-[0.04em] [&_th]:text-dim [&_th]:pt-0 [&_th]:pr-12 [&_th]:pb-10 [&_th]:pl-0 [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_td]:border-b-[0.1rem] [&_td]:border-b-[#ececea] [&_td]:[border-bottom-style:solid] [&_td]:pt-14 [&_td]:pr-12 [&_td]:pb-14 [&_td]:pl-0 [&_td]:align-middle [&_tbody_tr:hover_td]:bg-soft [&_td_a:not(.d-row-link):not(.d-step)]:text-blue [&_td_a:not(.d-row-link):not(.d-step)]:font-code [&_td_a:not(.d-row-link):not(.d-step)]:text-[1.25rem] max-md:min-w-0 max-md:[&_thead]:[clip-path:inset(50%)] max-md:[&_thead]:h-1 max-md:[&_thead]:overflow-hidden max-md:[&_thead]:absolute max-md:[&_thead]:w-1 max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block! max-md:[&_td]:block! max-md:[&_tr]:border-b-[0.1rem] max-md:[&_tr]:border-b-[#ececea] max-md:[&_tr]:[border-bottom-style:solid] max-md:[&_tr]:py-12 max-md:[&_tr]:px-0 max-md:[&_td]:border-0 max-md:[&_td]:border-none max-md:[&_td]:min-h-28 max-md:[&_td]:pt-4 max-md:[&_td]:pr-0 max-md:[&_td]:pb-4 max-md:[&_td]:pl-110 max-md:[&_td]:relative! max-md:[&_td]:text-left max-md:[&_td]:whitespace-normal max-md:[&_td:not([data-label])]:pl-0 max-md:[&_td[data-label]::before]:text-dim max-md:[&_td[data-label]::before]:content-[attr(data-label)] max-md:[&_td[data-label]::before]:text-[1.15rem] max-md:[&_td[data-label]::before]:left-0 max-md:[&_td[data-label]::before]:tracking-[0.04em] max-md:[&_td[data-label]::before]:leading-[2rem] max-md:[&_td[data-label]::before]:absolute max-md:[&_td[data-label]::before]:uppercase max-md:[&_td[data-label]::before]:top-6 max-md:[&_td[data-label]::before]:w-100 max-md:[&_tbody_tr:hover_td]:[background:none]";

/* Scrollable list table of the dashboard: uppercase header, divided rows, stacked rows on phones */
export default function DataTable({ columns, children }: Props) {
  return (
    <div className="my-0 -mx-20 overflow-x-auto py-0 px-20 md:my-0 md:-mx-24 md:py-0 md:px-24">
      <table className={TABLE}>
        <thead>
          <tr>
            {columns.map((c) => {
              const { label, numeric } = typeof c === "string" ? { label: c, numeric: false } : c;
              return (
                <th key={label} className={numeric ? "tabular-nums text-right! whitespace-nowrap max-md:text-left! max-md:whitespace-normal" : undefined}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
