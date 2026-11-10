import type { ReactNode } from 'react'

interface Props {
  rows: [label: string, value: ReactNode][]
}

/* Label and value pairs, side by side from tablet width up */
export default function SummaryList({ rows }: Props) {
  return (
    <dl className="grid [&>div]:border-t-[0.1rem] [&>div]:border-t-[#ececea] [&>div]:[border-top-style:solid] [&>div]:grid [&>div]:gap-3 [&>div]:py-10 [&>div]:px-0 [&>div:first-child]:border-t-0 [&>div:first-child]:[border-top-style:none] [&>div:first-child]:pt-0 [&_dt]:text-[1.25rem] [&_dt]:text-dim [&_dd]:text-[1.5rem] [&_dd]:leading-[1.45] md:[&>div]:gap-20 md:[&>div]:grid-cols-[16rem_minmax(0,1fr)]">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
