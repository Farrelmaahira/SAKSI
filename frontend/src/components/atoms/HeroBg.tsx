import Image from 'next/image'

export function HeroBg() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <Image
        src="/images/hero-village-2400.webp"
        width={2400}
        height={1596}
        sizes="100vw"
        alt="Latar Belakang Desa Indonesia"
        preload
      />
    </div>
  )
}

export default HeroBg
