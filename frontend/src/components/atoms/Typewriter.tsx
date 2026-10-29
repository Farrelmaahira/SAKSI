'use client'

import { useEffect, useState } from 'react'

export interface TypewriterProps {
  text: string
  speed?: number
}

/* Types text out one character at a time, used when AI writes a clause. */
export default function Typewriter({ text, speed = 22 }: TypewriterProps) {
  const [n, setN] = useState(0)
  const [lastText, setLastText] = useState(text)
  if (text !== lastText) {
    setLastText(text)
    setN(0)
  }
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(t), v) : v + 1)), speed)
    return () => clearInterval(t)
  }, [text, speed])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <i className="caret is-on" />}
    </>
  )
}
