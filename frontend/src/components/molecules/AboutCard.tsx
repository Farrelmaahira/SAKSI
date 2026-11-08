import type { AboutItem } from "@/interfaces/content";

interface Props {
  item: AboutItem;
  index: number;
}

export default function AboutCard({ item, index }: Props) {
  return (
    <article data-reveal>
      <span className="text-blue text-[1.4rem]">0{index + 1}</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  );
}
