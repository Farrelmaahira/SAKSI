'use client'

import { useRef } from 'react'
import { useFolderStack } from '@/hooks/use-folder-stack'
import ScopeFolder from '@/components/molecules/ScopeFolder'
import { scopeFolders } from '@/data/scope-folders'

export default function ScopeFolders() {
  const root = useRef<HTMLDivElement>(null)
  useFolderStack(root)

  return (
    <div className="grid [grid-auto-rows:1fr] gap-y-[14vh] lg:pb-0 lg:after:content-[''] lg:after:block lg:after:h-[28vh]" ref={root}>
      {scopeFolders.map((f, i) => (
        <ScopeFolder key={f.title} folder={f} index={i} />
      ))}
    </div>
  )
}
