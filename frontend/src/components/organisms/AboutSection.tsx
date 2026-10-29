import AboutCard from '@/components/molecules/AboutCard'
import FlowStep from '@/components/molecules/FlowStep'
import { about, flow } from '@/data/simulasi'

export default function AboutSection() {
  return (
    <section className="about-sec" id="tentang">
      <div className="container">
        <div className="about-head" data-reveal>
          <p className="label dark">Tentang</p>
          <h2 className="display-md">SAKSI menjaga kontrak dari draf sampai diawasi warga.</h2>
        </div>
        <div className="about-cols">
          {about.map((item, i) => (
            <AboutCard key={item.title} item={item} index={i} />
          ))}
        </div>
        <div className="flow-head" data-reveal>
          <p className="label dark">Alur kontrak di SAKSI</p>
          <p>Lima langkah yang sama akan Anda coba di simulasi di bawah.</p>
        </div>
        <ol className="flow" data-reveal>
          {flow.map((item, i) => (
            <FlowStep key={item.label} item={item} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
