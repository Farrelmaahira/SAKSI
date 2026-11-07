import { Suspense } from 'react'
import AturUlangSandiTemplate from '@/components/organisms/AturUlangSandiTemplate'
import '@/styles/pages.css'
import '@/styles/auth.css'

export default function AturUlangSandiPage() {
  // useSearchParams needs a Suspense boundary under Cache Components.
  return (
    <Suspense>
      <AturUlangSandiTemplate />
    </Suspense>
  )
}
