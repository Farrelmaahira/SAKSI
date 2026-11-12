'use client'

import { useRef } from 'react'
import Btn from '@/components/atoms/Btn'
import { PAD_H, PAD_W, useSignatureCanvas } from '@/hooks/use-signature-canvas'

interface Props {
  /* Called with the drawing as a PNG data URL after each stroke, or null once cleared */
  onChange: (image: string | null) => void
  /* Typed into the pad by "Ketik nama" for people who cannot draw */
  name: string
  /* A drawing to show again when the pad is remounted */
  initial?: string | null
}

/* Draw a signature with a mouse, finger or pen. Pointer events cover all three. */
export default function SignaturePad({ onChange, name, initial }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const pad = useSignatureCanvas(canvas, { name, initial, onChange })

  return (
    <div className="grid gap-8">
      <canvas
        ref={canvas}
        width={PAD_W}
        height={PAD_H}
        role="img"
        aria-label="Area tanda tangan. Gambar dengan mouse, jari, atau pena. Atau pakai tombol Ketik nama."
        className="aspect-[5/2] bg-white border-[0.15rem] border-dashed border-line cursor-crosshair h-auto rounded-[1.2rem] touch-none w-full"
        onPointerDown={pad.down}
        onPointerMove={pad.move}
        onPointerUp={pad.up}
        onPointerCancel={pad.up}
      />
      <div className="flex flex-wrap gap-8">
        <Btn small variant="ghost" onClick={pad.clear} disabled={!pad.inked}>
          Hapus
        </Btn>
        <Btn small variant="ghost" onClick={pad.typed}>
          Ketik nama
        </Btn>
      </div>
    </div>
  )
}
