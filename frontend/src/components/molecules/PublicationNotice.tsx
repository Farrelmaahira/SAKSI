import Icon from '@/components/atoms/Icon'
import TextLink from '@/components/atoms/TextLink'
import { fmtDate } from '@/lib/dates/fmt-date'

interface Props {
  code: string
  at: string
}

/* Blue box: since when the contract shows on the citizen portal, with a link to it */
export default function PublicationNotice({ code, at }: Props) {
  return (
    <div className="items-start rounded-[1.4rem] grid gap-12 grid-cols-[auto_minmax(0,1fr)] py-14 px-16 [&_strong]:font-[420] [&.is-ok]:bg-blue [&.is-ok]:text-white [&.is-bad]:bg-red! [&.is-bad]:text-white! [.d-checks_li&]:text-blue d-integrity is-ok">
      <Icon name="globe" />
      <div>
        <strong>Tampil di portal sejak {fmtDate(at)}</strong>
        <TextLink href={`/lacak?q=${code}`} className="inline-block mt-6 text-white [&:hover]:text-white">
          Lihat di portal publik
        </TextLink>
      </div>
    </div>
  )
}
