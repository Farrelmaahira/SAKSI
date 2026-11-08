import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* The design's own colour and font names, declared in the @theme block of app/globals.css. tailwind-merge needs them
   to tell `text-ink` (colour) from `text-[1.8rem]` (size) when classes are merged. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: ['blue', 'deep', 'ink', 'soft', 'white', 'red', 'green', 'gray', 'line', 'dim', 'side-dim', 'ink-dim'],
      font: ['body', 'hand', 'code'],
    },
  },
  /* `text-[1.4rem]` must not delete a `leading-*` written before it (tailwind-merge's text-sm/6 rule): the design sets both on purpose. */
  override: { conflictingClassGroups: { 'font-size': [] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
