'use client'

import { useEffect, useRef } from 'react'
import Illustration from '@/components/atoms/Illustration'
import Btn from '@/components/atoms/Btn'
import type { IllustrationName } from '@/data/illustrations'

interface Props {
  open: boolean
  title: string
  text: string
  confirmLabel: string
  cancelLabel?: string
  art?: IllustrationName
  /* danger = the action cannot be undone */
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

/* Modal that asks before a consequential action: big illustration, what will happen, two clear choices.
   Built on <dialog>, so focus stays inside, Esc cancels and the page behind cannot be clicked. */
export default function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel = 'Batal', art = 'document-warning_2es6', tone = 'primary', onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="[--muted:#6b6b73] bg-white border-0 border-none rounded-[2.4rem] [box-shadow:0.8rem_0.8rem_0_var(--color-ink)] text-ink text-[1.5rem] inset-0 m-auto max-h-[calc(100svh_-_3.2rem)] max-w-480 overflow-y-auto p-0 w-[calc(100%_-_3.2rem)] [&::backdrop]:bg-[rgba(15,_15,_23,_0.6)] [&_h2]:text-[2.6rem] [&_h2]:font-[350] [&_h2]:tracking-[-0.02em] [&_h2]:leading-[1.15] [&_p]:text-dim [&_p]:leading-[1.5]! [&_p]:max-w-360 motion-safe:[&[open]]:[animation:d-dialog-in_0.35s_var(--ease-saksi)]"
      aria-labelledby="d-dialog-title"
      aria-describedby="d-dialog-text"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="grid gap-12 justify-items-center pt-32 px-24 pb-24 relative text-center">
        <button type="button" className="items-center bg-soft border-0 border-none rounded-[50%] text-ink cursor-pointer flex h-36 justify-center p-0 absolute right-14 top-14 [transition:background_0.2s,_color_0.2s] w-36 [&:hover]:bg-ink [&:hover]:text-white" aria-label="Tutup" onClick={onCancel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="mb-8 w-[min(26rem,_70%)] [&_img]:h-auto [&_img]:w-full">
          <Illustration name={art} loading="lazy" />
        </div>
        <h2 id="d-dialog-title">{title}</h2>
        <p id="d-dialog-text">{text}</p>
        <div className="flex flex-wrap gap-10 justify-center mt-12">
          <Btn variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Btn>
          <Btn variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </dialog>
  )
}
