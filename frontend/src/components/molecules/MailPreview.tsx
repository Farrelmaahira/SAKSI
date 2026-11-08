import Link from 'next/link'

interface Props {
  to: string
  subject: string
  body: string
  action: string
  href: string
}

export default function MailPreview({ to, subject, body, action, href }: Props) {
  return (
    <div className="bg-soft [border:0.15rem_dashed_#bdbdb7] rounded-[1.4rem] grid gap-12 p-18 [&_dl]:grid [&_dl]:text-[1.3rem] [&_dl]:gap-4 [&_dl_div]:grid [&_dl_div]:gap-10 [&_dl_div]:grid-cols-[6rem_1fr] [&_dt]:opacity-[0.55] [&_dd]:wrap-anywhere">
      <p className="text-blue font-hand text-[2.2rem] leading-[1]">Email simulasi</p>
      <dl>
        <div>
          <dt>Kepada</dt>
          <dd>{to}</dd>
        </div>
        <div>
          <dt>Subjek</dt>
          <dd>{subject}</dd>
        </div>
      </dl>
      <p className="bg-white rounded-[1rem] text-[1.4rem] leading-[1.5] p-14">{body}</p>
      <Link className="items-center bg-blue rounded-[3rem] text-white inline-flex text-[1.4rem] h-44 [justify-self:start] py-0 px-20 [transition:background_0.3s] [&:hover]:bg-ink" href={href}>
        {action}
      </Link>
    </div>
  )
}
