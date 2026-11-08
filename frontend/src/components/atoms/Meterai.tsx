interface Props {
  /* Serial number printed on the stamp once it has been applied */
  serial?: string
}

export default function Meterai({ serial }: Props) {
  return (
    <div className="[animation:stamp_0.35s_cubic-bezier(0.2,_0.9,_0.3,_1.2)] bg-white border-[0.2rem] border-blue border-solid rounded-[0.6rem] text-blue grid gap-2 py-8 px-10 text-center [transform:rotate(-4deg)] [&_span]:text-[0.9rem] [&_span]:not-italic [&_span]:uppercase [&_em]:text-[0.9rem] [&_em]:not-italic [&_em]:uppercase [&_strong]:text-[2rem] [&_strong]:font-[500] [&_em]:bg-blue [&_em]:rounded-[0.2rem] [&_em]:text-white" aria-label="E-meterai simulasi 10.000">
      <span>Meterai elektronik</span>
      <strong>10000</strong>
      <em>Simulasi</em>
      {serial && <span>No. {serial}</span>}
    </div>
  )
}
