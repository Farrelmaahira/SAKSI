import { useEffect, useRef } from 'react'

/* Scrolls the element into view when `key` changes (not on the first render), if its top is above the viewport. */
export function useScrollOnChange<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = ref.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [key])
  return ref
}
