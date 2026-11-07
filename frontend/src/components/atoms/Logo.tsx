import Image from 'next/image'

/* Shield mark with a transparent background, cropped tight. It is black; CSS turns it white on the blue/photo areas. */
export default function Logo() {
  return <Image className="logo-mark" src="/logo-saksi-mark.png" alt="" width={47} height={50} loading="eager" quality={90} />
}
