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
    <div className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
      <span>Foto bukti (opsional, maksimal 4)</span>
      <label
        className={cn('cursor-pointer relative [transition:border-color_0.3s,_background_0.3s] [&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] bg-white [border:0.2rem_dashed_rgba(15,_15,_23,_0.3)] rounded-[1.2rem] block text-[1.5rem] p-24 text-center [&_strong]:font-[500] [&:hover]:border-blue [&.is-over]:border-blue [.app_&]:bg-white [.app_&]:[border:0.15rem_dashed_#d6d6d2] [.app_&]:rounded-[1.2rem] [.app_&]:cursor-pointer [.app_&]:grid [.app_&]:text-[1.4rem] [.app_&]:gap-10 [.app_&]:justify-items-center [.app_&]:py-24 [.app_&]:px-20 [.app_&]:relative [.app_&]:text-center [.app_&]:[transition:border-color_0.2s] [.app_&_input]:h-1 [.app_&_input]:opacity-[0] [.app_&_input]:pointer-events-none [.app_&_input]:absolute [.app_&_input]:w-1 [.app_&_strong]:font-[500] [.app_&:hover]:border-blue [.app_&.is-over]:border-blue!', over && 'is-over')}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
        <span className="block mt-0 mx-auto mb-10 w-[min(20rem,_60%)] [&_img]:h-auto [&_img]:w-full [.app_&]:block [.app_&]:w-[min(20rem,_60%)] [.app_&_img]:h-auto [.app_&_img]:w-full">
          <Illustration name="image-dropzone_zdre" />
        </span>
        <span>
          <strong>Seret foto ke sini</strong> atau klik untuk memilih
        </span>
      </label>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-10 [&_img]:bg-[rgba(15,_15,_23,_0.06)] [&_img]:rounded-[0.8rem] [&_img]:h-96 [&_img]:object-cover [&_img]:w-96 [.app_&]:flex [.app_&]:flex-wrap [.app_&]:gap-10 [.app_&_img]:bg-soft [.app_&_img]:border-[0.1rem] [.app_&_img]:border-[#e3e3df] [.app_&_img]:border-solid [.app_&_img]:rounded-[0.8rem] [.app_&_img]:h-96 [.app_&_img]:object-cover [.app_&_img]:w-96">
          {photos.map((src, i) => (
            <div key={src} className="relative [.app_&]:relative">
              {/* blob: previews cannot go through the optimizer; .photo-row img sets the displayed size. */}
              <Image src={src} alt={`Foto bukti ${i + 1}`} width={96} height={96} unoptimized />
              {onRemove && (
                <button type="button" className="items-center bg-ink border-[0.2rem] border-white border-solid rounded-[50%] text-white cursor-pointer flex h-26 justify-center p-0 absolute -right-8 -top-8 [transition:background_0.2s] w-26 [&:hover]:bg-red [.app_&]:items-center [.app_&]:bg-ink [.app_&]:border-[0.2rem] [.app_&]:border-white [.app_&]:border-solid [.app_&]:rounded-[50%] [.app_&]:text-white [.app_&]:cursor-pointer [.app_&]:flex [.app_&]:h-26 [.app_&]:justify-center [.app_&]:p-0 [.app_&]:absolute [.app_&]:-right-8 [.app_&]:-top-8 [.app_&]:[transition:background_0.2s] [.app_&]:w-26 [.app_&:hover]:bg-red" aria-label={`Hapus foto bukti ${i + 1}`} onClick={() => onRemove(i)}>
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
