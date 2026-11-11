'use client'

import { useReveal } from '@/hooks/use-reveal'

/* Renders nothing; switches on the scroll-reveal animation for the page it sits in. */
export default function RevealEffect() {
  useReveal()
  return null
}
