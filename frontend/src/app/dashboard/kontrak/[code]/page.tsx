import { Suspense } from 'react'
import KontrakDetailTemplate from '@/components/organisms/KontrakDetailTemplate'

export default function KontrakDetailPage() {
  // useParams and useSearchParams need a Suspense boundary under Cache Components.
  return (
    <Suspense>
      <KontrakDetailTemplate />
    </Suspense>
  )
}
