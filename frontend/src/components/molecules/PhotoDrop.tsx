'use client'

import { useState, type DragEvent } from 'react'
import Image from 'next/image'
import Illustration from '@/components/atoms/Illustration'
import { cn } from '@/lib/utils'

interface Props {
  photos: string[]
  onFiles: (files: FileList | null) => void
  /* When given, every thumbnail gets a remove button */
  onRemove?: (index: number) => void
}

export default function PhotoDrop({ photos, onFiles, onRemove }: Props) {
  const [over, setOver] = useState(false)

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    onFiles(e.dataTransfer.files)
  }

  return (
    <div className="field">
      <span>Foto bukti (opsional, maksimal 4)</span>
      <label
        className={cn('photo-drop', over && 'is-over')}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
        <span className="photo-drop-art">
          <Illustration name="image-dropzone_zdre" loading="lazy" />
        </span>
        <span>
          <strong>Seret foto ke sini</strong> atau klik untuk memilih
        </span>
      </label>
      {photos.length > 0 && (
        <div className="photo-row">
          {photos.map((src, i) => (
            <div key={src} className="photo-thumb">
              {/* blob: previews cannot go through the optimizer; .photo-row img sets the displayed size. */}
              <Image src={src} alt={`Foto bukti ${i + 1}`} width={96} height={96} unoptimized />
              {onRemove && (
                <button type="button" className="photo-remove" aria-label={`Hapus foto bukti ${i + 1}`} onClick={() => onRemove(i)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
