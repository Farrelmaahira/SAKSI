'use client'

interface Props<T extends string> { items: { key: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }

export default function Chips<T extends string>({ items, value, onChange }: Props<T>) {
  return (
    <div className="d-chips">
      {items.map((i) => (
        <button key={i.key} type="button" className={value === i.key ? 'is-on' : ''} aria-pressed={value === i.key} onClick={() => onChange(i.key)}>
          {i.label}
          {i.count !== undefined && <span>{i.count}</span>}
        </button>
      ))}
    </div>
  )
}
