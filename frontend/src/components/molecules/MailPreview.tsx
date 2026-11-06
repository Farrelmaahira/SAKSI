import Link from 'next/link'

interface Props {
  to: string
  subject: string
  body: string
  action: string
  href: string
}

/* Prototype stand-in for a real email: shows what would arrive in the inbox */
export default function MailPreview({ to, subject, body, action, href }: Props) {
  return (
    <div className="mail-preview">
      <p className="mail-tag">Email simulasi</p>
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
      <p className="mail-body">{body}</p>
      <Link className="mail-action" href={href}>
        {action}
      </Link>
    </div>
  )
}
