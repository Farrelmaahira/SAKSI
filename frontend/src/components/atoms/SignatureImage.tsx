import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  /* PNG data URL from the signature pad */
  src: string
  /* Whose signature, for screen readers */
  name: string
  className?: string
}

/* A handwritten signature. The canvas exports 5:2, so the box keeps that shape at any height. */
export default function SignatureImage({ src, name, className }: Props) {
  return <Image className={cn('h-80 w-auto', className)} src={src} alt={`Tanda tangan ${name}`} width={300} height={120} unoptimized />
}
