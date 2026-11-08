import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props { title?: string; action?: ReactNode; children: ReactNode; className?: string; desc?: string }

export default function Panel({ title, action, children, className, desc }: Props) {
  return (
    <section className={cn('[align-content:start] bg-white rounded-[2rem] grid gap-16 p-20 md:p-24', className)}>
      {(title || action) && (
        <header className="items-start flex gap-16 justify-between [&_h2]:text-[2.1rem] [&_h2]:font-[380] [&_h2]:tracking-[-0.02em] [&_p]:text-[1.35rem]! [&_p]:leading-[1.45] [&_p]:mt-4 [&_p]:text-dim max-md:flex-wrap">
          <div>
            {title && <h2>{title}</h2>}
            {desc && <p>{desc}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
