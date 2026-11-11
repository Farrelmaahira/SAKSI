'use client'

import dynamic from 'next/dynamic'

// The drawing pad is only needed on the signing step.
const SignaturePadLazy = dynamic(() => import('@/components/molecules/SignaturePad'), {
  ssr: false,
  loading: () => <div className="min-h-[240px]" role="status" aria-label="Memuat kotak tanda tangan" />,
})

export default SignaturePadLazy
