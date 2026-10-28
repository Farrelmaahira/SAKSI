'use client'

import { useState, type DragEvent } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface PhotoDropProps {
  photos: string[]
  onFiles: (files: FileList | null) => void
}

export default function PhotoDrop({ photos, onFiles }: PhotoDropProps) {
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
        <strong>Seret foto ke sini</strong> atau klik untuk memilih
      </label>
      {photos.length > 0 && (
        <div className="photo-row">
          {photos.map((src, i) => (
            // blob: previews cannot go through the optimizer; .photo-row img sets the displayed size.
            <Image key={src} src={src} alt={`Foto bukti ${i + 1}`} width={80} height={80} unoptimized />
          ))}
        </div>
      )}
    </div>
  )
}
