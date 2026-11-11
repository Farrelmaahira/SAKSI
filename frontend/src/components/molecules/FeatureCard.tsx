import Illustration from '@/components/atoms/Illustration'
import type { Feature } from '@/interfaces/content'

interface Props {
  feature: Feature
  index: number
}

export default function FeatureCard({ feature, index }: Props) {
  return (
    <article className="flex-[0_0_30rem] [scroll-snap-align:start] last:mr-20 [&_h3]:text-[3rem] [&_h3]:font-[350] [&_h3]:tracking-[-0.02em] [&_h3]:leading-[1.1] [&_h3]:mb-14 [&_h3]:py-0 [&_h3]:px-10 [&_p]:text-[1.6rem] [&_p]:tracking-[-0.01em]! [&_p]:leading-[1.45] [&_p]:py-0 [&_p]:px-10 md:basis-420 md:last:mr-40 feat:flex-[0_0_52rem] feat:max-w-520 feat:last:mr-[var(--edge)] feat:[&_h3]:text-[3.8rem] feat:[&_h3]:mb-18 feat:[&_h3]:py-0 feat:[&_h3]:px-10 feat:[&_p]:text-[1.9rem] feat:[&_p]:leading-[1.45] feat:[&_p]:py-0 feat:[&_p]:px-10 feature-card">
      <div className="items-center bg-soft rounded-[1.5rem] flex h-260 justify-center mb-24 overflow-hidden p-40 relative [&_img]:max-h-full [&_img]:[transition:transform_0.6s_ease-out] [.feature-card:hover_&_img]:[transform:scale(1.05)] md:h-360 feat:rounded-[2rem] feat:h-400 feat:p-50">
        <span className="text-[1.3rem] absolute top-20 text-blue left-24">0{index + 1}</span>
        {feature.tag && <span className="text-[1.3rem] absolute top-20 border-[0.1rem] border-ink border-solid rounded-[3rem] py-4 px-12 right-20 uppercase">{feature.tag}</span>}
        <Illustration name={feature.image} />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.text}</p>
    </article>
  )
}
