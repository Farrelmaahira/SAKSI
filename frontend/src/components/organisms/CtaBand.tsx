import PillButton from '@/components/atoms/PillButton'

export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-grid">
        <h2 className="display-md">Sudah paham alurnya? Lacak kontrak yang sedang berjalan.</h2>
        <PillButton to="/lacak">Buka Lacak dan Lapor</PillButton>
      </div>
    </section>
  )
}
