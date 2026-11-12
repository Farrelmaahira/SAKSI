import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, RefObject } from 'react'

export const PAD_W = 600
export const PAD_H = 240
const W = PAD_W
const H = PAD_H

interface Options {
  name: string
  initial?: string | null
  onChange: (image: string | null) => void
}

/* Drawing on a canvas with pointer events (mouse, finger, pen), plus "type my name" for people who cannot draw. */
export function useSignatureCanvas(canvas: RefObject<HTMLCanvasElement | null>, { name, initial, onChange }: Options) {
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

  return { inked, down, move, up, clear, typed }
}
