'use client'

import LetterPanel from '@/components/organisms/LetterPanel'
import SignStepsPanel from '@/components/organisms/SignStepsPanel'
import type { TabProps } from '@/interfaces/dash'

export default function TandaTanganTab({ c, session }: TabProps) {
  return (
    <>
      <SignStepsPanel c={c} session={session} />
      <LetterPanel c={c} />
    </>
  )
}
