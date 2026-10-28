import FaqItem from '@/components/molecules/FaqItem'
import { faq } from '@/data/simulasi'

export default function FaqSection() {
  return (
    <section className="faq-sec">
      <div className="container faq-grid">
        <div data-reveal>
          <p className="label dark">Pertanyaan</p>
          <h2 className="display-md">Yang sering ditanyakan.</h2>
        </div>
        <div className="faq-list" data-reveal>
          {faq.map((entry) => (
            <FaqItem key={entry.question} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  )
}
