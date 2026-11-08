interface Props { msg: { ok: boolean; text: string } | null }

export default function Notice({ msg }: Props) {
  if (!msg) return null
  return (
    <p className={msg.ok ? 'items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok' : 'text-red text-[1.35rem] not-italic'} role="status">
      {msg.text}
    </p>
  )
}
