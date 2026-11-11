import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}

/* Underlined "back" button of a multi-step form */
export default function BackButton({ children, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue disabled:cursor-not-allowed disabled:opacity-[0.3]"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
