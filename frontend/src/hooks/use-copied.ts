import { useState } from 'react'

const RESET_MS = 1600

/* Copies a text to the clipboard and says so for a moment. */
export function useCopied(text: string) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), RESET_MS)
    } catch {
      setCopied(false)
    }
  }

  return { copied, copy }
}
