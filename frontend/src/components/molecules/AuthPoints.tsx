import Check from '@/components/atoms/Check'

interface Props {
  points: string[]
}

export default function AuthPoints({ points }: Props) {
  return (
    <ul className="auth-points">
      {points.map((p) => (
        <li key={p}>
          <span className="auth-check">
            <Check />
          </span>
          {p}
        </li>
      ))}
    </ul>
  )
}
