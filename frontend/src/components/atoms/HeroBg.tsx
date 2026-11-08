import Image from 'next/image'

export default function HeroBg() {
  return (
    <div className="inset-0 absolute [&_img]:h-full [&_img]:object-cover [&_img]:[object-position:center_45%] [&_img]:w-full after:bg-ink after:content-[''] after:inset-0 after:opacity-[0.6] after:absolute" aria-hidden="true">
      <Image
        src="/images/hero-village-2400.jpg"
        width={2400}
        height={1596}
        sizes="100vw"
        quality={90}
        alt="Latar Belakang Desa Indonesia"
        preload
      />
    </div>
  )
}

