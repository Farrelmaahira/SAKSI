import type { ReactNode } from 'react'
import ErrorText from '@/components/atoms/ErrorText'
import { cn } from '@/lib/utils'

// full class names on purpose: Tailwind only generates classes it can read literally from the source
const FIELD = [
  'border-0 border-none grid gap-6 min-w-0',
  '[&>:is(span,legend)]:text-[1.25rem] [&>:is(span,legend)]:tracking-[0.04em] [&>:is(span,legend)]:text-dim [&>:is(span,legend)]:uppercase [&>legend]:mb-6',
  '[&_:is(input,select,textarea)]:bg-white [&_:is(input,select,textarea)]:border-[0.15rem] [&_:is(input,select,textarea)]:border-[#d6d6d2] [&_:is(input,select,textarea)]:border-solid [&_:is(input,select,textarea)]:rounded-[1.2rem] [&_:is(input,select,textarea)]:text-ink [&_:is(input,select,textarea)]:text-[1.5rem]',
  '[&_:is(input,select,textarea)]:min-h-48 [&_:is(input,select,textarea)]:[outline:none] [&_:is(input,select,textarea)]:py-10 [&_:is(input,select,textarea)]:px-14 [&_:is(input,select,textarea)]:w-full [&_:is(input,select,textarea)]:[transition:border-color_0.2s,_box-shadow_0.2s]',
  '[&_:is(input,select,textarea):focus]:border-blue [&_:is(input,select,textarea):focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]',
  '[&_textarea]:leading-[1.5] [&_textarea]:resize-y',
  '[&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis',
].join(' ')

interface Props {
  label: string
  error?: string
  /* fieldset + legend for a group of buttons instead of a label around one control */
  group?: boolean
  className?: string
  children: ReactNode
}

/* Labelled form control (input, select, textarea) with the dashboard field look and an error line */
export default function FormField({ label, error, group, className, children }: Props) {
  const Tag = group ? 'fieldset' : 'label'
  const Title = group ? 'legend' : 'span'
  return (
    <Tag className={cn(FIELD, className)}>
      <Title>{label}</Title>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </Tag>
  )
}
