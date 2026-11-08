import Arrow from '@/components/atoms/Arrow'

interface Props {
  href: string
  children: string
}

export default function ScrollLink({ href, children }: Props) {
  return (
    <a className="items-center inline-flex text-[1.4rem] gap-14 uppercase scroll-link" href={href}>
      <span className="items-center border-[0.1rem] border-[rgba(255,_255,_255,_0.6)] border-solid rounded-[50%] flex h-50 justify-center [transition:background_0.4s,_color_0.4s] w-50 [.scroll-link:hover_&]:bg-white [.scroll-link:hover_&]:text-blue lg:h-60 lg:w-60">
        <Arrow dir="down" />
      </span>
      {children}
    </a>
  )
}
