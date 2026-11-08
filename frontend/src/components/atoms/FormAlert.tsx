import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function FormAlert({ children }: Props) {
  return (
    <p className="bg-red rounded-[1rem] text-white text-[1.5rem] py-12 px-16" role="alert">
      {children}
    </p>
  )
}
