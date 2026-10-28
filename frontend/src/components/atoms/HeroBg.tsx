import Image from 'next/image'

/* Same village photo as the home hero (styles live in globals.css). */
export default function HeroBg() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <Image src="/images/hero-village-2400.jpg" width={2400} height={1596} sizes="100vw" alt="" preload />
    </div>
  )
}
