import type { FaqEntry } from '@/interfaces/content'

interface Props {
  entry: FaqEntry
}

export default function FaqItem({ entry }: Props) {
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
