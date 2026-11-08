interface Props {
  variant: 'a' | 'b'
}

export default function Signature({ variant }: Props) {
  const d =
    variant === 'a'
      ? 'M6 38c10-18 18-30 22-28 5 3-12 26-6 27 6 1 12-20 17-18 4 2-3 14 1 15 4 1 8-9 12-8 3 1 1 6 4 6 4 0 8-5 14-6M20 44c18-3 36-4 52-3'
      : 'M8 30c6-14 16-22 20-18 5 5-10 20-4 22 7 2 14-18 19-14 4 3-6 12-1 13 6 1 12-12 17-10 4 2-1 8 3 8 5 0 10-6 14-8M14 40c16 2 34 1 52-3'
  return (
    <svg className="[.sign-chip_&]:h-30 [.sign-chip_&]:w-60 [fill:none] h-auto max-w-140 [stroke:var(--color-ink)] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2] w-full [&_path]:[animation:sign_0.9s_ease-out] [&_path]:[stroke-dasharray:320]" viewBox="0 0 100 50" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
