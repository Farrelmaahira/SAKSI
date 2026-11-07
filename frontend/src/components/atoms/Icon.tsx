import { iconPaths } from '@/data/dash'

interface Props { name: keyof typeof iconPaths | string; className?: string }

export default function Icon({ name, className = '' }: Props) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.file} />
    </svg>
  )
}
