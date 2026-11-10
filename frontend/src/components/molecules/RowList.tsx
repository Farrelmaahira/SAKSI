import type { ReactNode } from 'react'

interface Props { children: ReactNode }

/* Plain divided list (title + small meta on the left, badge or action on the right), as on Verifikasi Segel */
export default function RowList({ children }: Props) {
  return (
    <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:flex-wrap [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim">
      {children}
    </ul>
  )
}
