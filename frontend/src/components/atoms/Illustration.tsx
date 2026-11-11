import Image from 'next/image'
import { illustrations, type IllustrationName } from '@/data/illustrations'
import { img } from '@/lib/img'

interface Props {
  name: IllustrationName
  alt?: string
  loading?: 'lazy' | 'eager'
}

export default function Illustration({ name, alt = '', loading = 'lazy' }: Props) {
  const { width, height } = illustrations[name]
  return <Image src={img(name)} alt={alt} width={width} height={height} loading={loading} />
}
