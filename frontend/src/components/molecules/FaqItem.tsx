'use client'

import { useState } from 'react'
import type { FaqEntry } from '@/interfaces/content'

interface Props {
  entry: FaqEntry
}

export default function FaqItem({ entry }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`border-b-[0.1rem] border-b-[rgba(15,_15,_23,_0.15)] [border-bottom-style:solid] [&_p]:text-[1.8rem] [&_p]:leading-[1.6] [&_p]:max-w-660 [&_p]:opacity-[0.8] [&_p]:pb-28 lg:[&_p]:text-[2rem] faq-item ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="items-center [background:none] [border:none] [color:inherit] cursor-pointer flex [font-family:inherit] text-[2rem] font-[350] gap-20 justify-between list-none list-outside py-26 px-0 text-left [transition:opacity_0.2s] w-full [&:hover]:opacity-[0.85] lg:text-[2.6rem]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{entry.question}</span>
        <span className="flex-none h-20 relative [transition:transform_0.4s_var(--ease-saksi)] w-20 before:bg-current before:content-[''] before:left-0 before:absolute before:top-[50%] before:h-1.5 before:w-full after:bg-current after:content-[''] after:left-0 after:absolute after:top-[50%] after:h-1.5 after:w-full after:[transform:rotate(90deg)] [.faq-item.is-open_&]:[transform:rotate(45deg)] [details[open]>summary_&]:[transform:rotate(45deg)]" aria-hidden="true" />
      </button>
      <div className="grid grid-rows-[0fr] opacity-[0] overflow-hidden [transition:grid-template-rows_0.4s_var(--ease-saksi),_opacity_0.3s_ease] [.faq-item.is-open_&]:grid-rows-[1fr] [.faq-item.is-open_&]:opacity-[1]">
        <div className="min-h-0 overflow-hidden">
          <p>{entry.answer}</p>
        </div>
      </div>
    </div>
  )
}
