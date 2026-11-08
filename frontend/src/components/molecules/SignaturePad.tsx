'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import Btn from '@/components/atoms/Btn'

interface Props {
  /* Called with the drawing as a PNG data URL after each stroke, or null once cleared */
  onChange: (image: string | null) => void
  /* Typed into the pad by "Ketik nama" for people who cannot draw */
  name: string
  /* A drawing to show again when the pad is remounted */
  initial?: string | null
}

const W = 600
const H = 240

/* Draw a signature with a mouse, finger or pen. Pointer events cover all three. */
export default function SignaturePad({ onChange, name, initial }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [inked, setInked] = useState(Boolean(initial))

  const pen = () => {
    const c = canvas.current!.getContext('2d')!
    c.lineWidth = 4
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.strokeStyle = '#0f0f17'
    c.fillStyle = '#0f0f17'
    return c
  }
  const publish = () => {
    setInked(true)
    onChange(canvas.current!.toDataURL('image/png'))
  }
  const at = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height] as const
  }

  useEffect(() => {
    if (!initial) return
    const img = new Image()
    img.onload = () => pen().drawImage(img, 0, 0, W, H)
    img.src = initial
    // only the first mount restores a drawing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const [x, y] = at(e)
    const c = pen()
    c.beginPath()
    c.moveTo(x, y)
    c.lineTo(x + 0.01, y) // a tap leaves a dot
    c.stroke()
  }
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const [x, y] = at(e)
    const c = pen()
    c.lineTo(x, y)
    c.stroke()
    c.beginPath()
    c.moveTo(x, y)
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    publish()
  }
  const clear = () => {
    pen().clearRect(0, 0, W, H)
    setInked(false)
    onChange(null)
  }
  const typed = async () => {
    try {
      await document.fonts.load('88px Caveat')
    } catch {
      /* the cursive fallback below still draws */
    }
    const c = pen()
    c.clearRect(0, 0, W, H)
    c.font = '88px Caveat, cursive'
    c.textBaseline = 'middle'
    c.fillText(name, 24, H / 2, W - 48)
    publish()
  }

  return (
    <div className="grid gap-8">
      <canvas
        ref={canvas}
        width={W}
        height={H}
        role="img"
        aria-label="Area tanda tangan. Gambar dengan mouse, jari, atau pena. Atau pakai tombol Ketik nama."
        className="aspect-[5/2] bg-white border-[0.15rem] border-dashed border-line cursor-crosshair h-auto rounded-[1.2rem] touch-none w-full"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <div className="flex flex-wrap gap-8">
        <Btn small variant="ghost" onClick={clear} disabled={!inked}>
          Hapus
        </Btn>
        <Btn small variant="ghost" onClick={typed}>
          Ketik nama
        </Btn>
      </div>
    </div>
  )
}
