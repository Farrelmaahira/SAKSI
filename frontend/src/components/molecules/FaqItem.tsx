import type { FaqEntry } from '@/interfaces/content'

export interface FaqItemProps {
  entry: FaqEntry
}

export default function FaqItem({ entry }: FaqItemProps) {
  return (
    <details>
      <summary>
        {entry.question}
        <span className="faq-plus" aria-hidden="true" />
      </summary>
      <p>{entry.answer}</p>
    </details>
  )
}
