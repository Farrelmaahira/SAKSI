import { Suspense } from 'react'
import LacakTemplate from '@/components/templates/LacakTemplate'
import '@/styles/pages.css'
import '@/styles/lacak.css'

export default function LacakPage() {
  // useSearchParams needs a Suspense boundary under Cache Components.
  return (
    <Suspense>
      <LacakTemplate />
    </Suspense>
  )
}
