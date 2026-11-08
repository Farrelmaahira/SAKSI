import Check from '@/components/atoms/Check'

interface Props {
  points: string[]
}

export default function AuthPoints({ points }: Props) {
  return (
    <ul className="hidden gap-14 list-none list-outside [&_li]:items-center [&_li]:flex [&_li]:text-[1.7rem] [&_li]:gap-12 md:grid">
      {points.map((p) => (
        <li key={p}>
          <span className="items-center bg-white rounded-[50%] text-blue flex flex-none h-30 justify-center w-30">
            <Check />
          </span>
          {p}
        </li>
      ))}
    </ul>
  )
}
