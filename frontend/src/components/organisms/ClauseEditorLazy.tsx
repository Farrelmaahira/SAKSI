'use client'

import dynamic from 'next/dynamic'
import Hint from '@/components/atoms/Hint'

// The clause editor is only needed once a draft is open for editing.
const ClauseEditorLazy = dynamic(() => import('@/components/organisms/ClauseEditor'), {
  ssr: false,
  loading: () => <Hint>Memuat editor pasal…</Hint>,
})

export default ClauseEditorLazy
