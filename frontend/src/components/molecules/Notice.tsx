interface Props { msg: { ok: boolean; text: string } | null }

export default function Notice({ msg }: Props) {
  if (!msg) return null
  return (
    <p className={msg.ok ? 'd-ok' : 'd-field-error'} role="status">
      {msg.text}
    </p>
  )
}
