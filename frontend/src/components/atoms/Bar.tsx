interface Props { value: number; tone?: 'blue' | 'red' }

export default function Bar({ value, tone = 'blue' }: Props) {
  return (
    <div className={`d-bar tone-${tone}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}
