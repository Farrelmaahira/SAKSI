import type { ReactNode } from 'react'

// full class names on purpose: Tailwind only generates classes it can read literally from the source
const FIELD = [
  'grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase',
  '[&_:is(input,select,textarea)]:bg-white [&_:is(input,select,textarea)]:border-[0.15rem] [&_:is(input,select,textarea)]:border-transparent [&_:is(input,select,textarea)]:border-solid [&_:is(input,select,textarea)]:rounded-[1.2rem]',
  '[&_:is(input,select,textarea)]:text-ink [&_:is(input,select,textarea)]:text-[1.6rem] [&_:is(input,select,textarea)]:[outline:none] [&_:is(input,select,textarea)]:py-14 [&_:is(input,select,textarea)]:px-16 [&_:is(input,select,textarea)]:w-full',
  '[&_:is(input,select,textarea):focus]:border-blue [&_textarea]:leading-[1.5] [&_textarea]:resize-y',
  '[&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis',
].join(' ')

interface Props {
  label: string
  children: ReactNode
}

/* Labelled control of the public report form (white box, no border until focused) */
export default function ReportField({ label, children }: Props) {
  return (
    <label className={FIELD}>
      <span>{label}</span>
      {children}
    </label>
  )
}
