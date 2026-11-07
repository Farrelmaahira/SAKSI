import { Suspense } from 'react'
import VerifikasiTemplate from '@/components/organisms/VerifikasiTemplate'
import '@/styles/pages.css'
import '@/styles/auth.css'

export default function VerifikasiPage() {
  // useSearchParams needs a Suspense boundary under Cache Components.
  return (
    <Suspense>
      <VerifikasiTemplate />
    </Suspense>
  )
}
