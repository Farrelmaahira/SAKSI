import Cross from '@/components/atoms/Cross'

interface Props {
  message: string | null
}

export default function SimFeedback({ message }: Props) {
  if (!message) return null
  return (
    <p className="is-wrong items-start [animation:pop_0.3s_ease-out] bg-white border-l-[0.4rem] border-l-red [border-left-style:solid] rounded-[1.2rem] flex text-[1.6rem] gap-10 leading-[1.45] mt-20 py-16 px-20 sim-feedback">
      <Cross />
      {message}
    </p>
  )
}
