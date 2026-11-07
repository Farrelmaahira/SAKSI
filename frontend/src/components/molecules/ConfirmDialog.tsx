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
      className="d-dialog"
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
      <div className="d-dialog-body">
        <button type="button" className="d-dialog-close" aria-label="Tutup" onClick={onCancel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="d-dialog-art">
          <Illustration name={art} loading="lazy" />
        </div>
        <h2 id="d-dialog-title">{title}</h2>
        <p id="d-dialog-text">{text}</p>
        <div className="d-dialog-actions">
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
