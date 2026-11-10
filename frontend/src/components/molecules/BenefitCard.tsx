import Illustration from "@/components/atoms/Illustration";
import type { Benefit } from "@/interfaces/content";

interface Props {
  benefit: Benefit;
}

export default function BenefitCard({ benefit }: Props) {
  return (
    <article
      className="[&_h3]:text-[3.2rem] [&_h3]:font-[350] [&_h3]:tracking-[-0.02em] [&_h3]:mb-10 [&_h3]:py-0 [&_h3]:px-10 [&_p]:text-[1.6rem] [&_p]:leading-[1.45] [&_p]:py-0 [&_p]:px-10 lg:[&_h3]:text-[4rem] lg:[&_h3]:py-0 lg:[&_h3]:px-20 lg:[&_p]:text-[2rem] lg:[&_p]:leading-[1.5] lg:[&_p]:py-0 lg:[&_p]:px-20 benefit-card"
      data-reveal
    >
      <div className="items-center bg-soft rounded-[1.5rem] flex h-240 justify-center mb-24 overflow-hidden p-40 [&_img]:max-h-full [&_img]:[transition:transform_0.6s_ease-out] [.benefit-card:hover_&_img]:[transform:scale(1.05)] lg:rounded-[2rem] lg:h-340">
        <Illustration name={benefit.image} loading="lazy" />
      </div>
      <h3>{benefit.title}</h3>
      <p>{benefit.text}</p>
    </article>
  );
}
