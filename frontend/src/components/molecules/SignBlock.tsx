import type { ReactNode } from 'react'
import Signature from '@/components/atoms/Signature'
import SignatureImage from '@/components/atoms/SignatureImage'
import type { Signature as SignatureData } from '@/interfaces/db'
import { fmtDate } from '@/lib/dates/fmt-date'

interface Props {
  /* "Pihak Pertama", "Kepala Desa" ... */
  role: string
  name: string
  signature?: SignatureData
  /* Shown while nobody has signed yet */
  emptyText: string
  /* Decorative stand-in for signatures saved without a drawing */
  fallback?: 'a' | 'b'
  /* Laid over the signature, for example the e-meterai */
  children?: ReactNode
}

/* One signing slot on a letter: the handwriting, then the name and the date under a line. */
export default function SignBlock({ role, name, signature, emptyText, fallback = 'a', children }: Props) {
  return (
    <div className="grid gap-6 text-center">
      <p className="text-[1.2rem] text-dim uppercase">{role}</p>
      <div className="items-center border-b-[0.1rem] border-b-ink border-solid flex h-110 justify-center pb-6 relative">
        {signature?.image ? <SignatureImage src={signature.image} name={name} /> : signature ? <Signature variant={fallback} /> : <span className="text-[1.3rem] text-dim">{emptyText}</span>}
        {children}
      </div>
      <strong className="text-[1.5rem] font-[500]">{name}</strong>
      {signature && <small className="text-[1.2rem] text-dim">{fmtDate(signature.at)}</small>}
    </div>
  )
}
