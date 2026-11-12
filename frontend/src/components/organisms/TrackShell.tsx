import HeroBg from '@/components/atoms/HeroBg'
import TrackHeading from '@/components/organisms/TrackHeading'

/* What the lacak page shows before its search form hydrates: the same hero, with the heading in the HTML. */
export default function TrackShell() {
  return (
    <main>
      <section className="bg-ink text-white overflow-hidden pt-140 px-0 relative lg:pt-200 lg:px-0 page-hero pb-80 lg:pb-110">
        <HeroBg />
        <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
          <TrackHeading />
        </div>
      </section>
    </main>
  )
}
