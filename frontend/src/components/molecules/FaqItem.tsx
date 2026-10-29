'use client'

import { useState } from 'react'
import type { FaqEntry } from '@/interfaces/content'

export interface FaqItemProps {
  entry: FaqEntry
}

export default function FaqItem({ entry }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="faq-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{entry.question}</span>
        <span className="faq-plus" aria-hidden="true" />
      </button>
      <div className="faq-content">
        <div className="faq-content-inner">
          <p>{entry.answer}</p>
        </div>
      </div>
    </div>
  )
}
