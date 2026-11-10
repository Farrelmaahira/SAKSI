import Illustration from '@/components/atoms/Illustration'
import type { TemplateInfo } from '@/interfaces/drafting'
import { cn } from '@/lib/utils'

interface Props {
  info: TemplateInfo
  selected: boolean
  onClick: () => void
}

/* One contract type to pick from: picture, name and a one-line description */
export default function TemplateCard({ info, selected, onClick }: Props) {
  return (
    <button
      type="button"
      className={cn(
        'bg-white border-[0.15rem] border-solid rounded-[1.8rem] [color:inherit] grid gap-6 justify-items-start p-16 text-left [transition:border-color_0.2s,_box-shadow_0.2s,_transform_0.2s] [&_img]:h-80 [&_img]:mb-8 [&_img]:w-auto [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_span]:text-[1.35rem] [&_span]:leading-[1.4] [&_span]:text-dim',
        selected ? 'border-blue [box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [transform:translate(-0.2rem,_-0.2rem)]' : 'border-[#dcdcd8] [&:hover]:border-ink',
      )}
      aria-pressed={selected}
      onClick={onClick}
    >
      <Illustration name={info.art} />
      <strong>{info.label}</strong>
      <span>{info.desc}</span>
    </button>
  )
}
