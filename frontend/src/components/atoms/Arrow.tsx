interface Props {
  dir?: 'right' | 'down' | 'left' | 'up'
}

export default function Arrow({ dir = 'right' }: Props) {
  const rotate = { right: 0, down: 90, left: 180, up: -90 }[dir]
  return (
    <svg className="[fill:none] h-20 [stroke:currentColor] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.4] w-20" viewBox="0 0 24 24" style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
