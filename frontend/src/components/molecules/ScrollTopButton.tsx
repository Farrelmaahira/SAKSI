'use client'

import PillButton from '@/components/atoms/PillButton'

/* Smooth scroll back to the top of the page */
export default function ScrollTopButton() {
  return <PillButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Kembali ke atas</PillButton>
}
