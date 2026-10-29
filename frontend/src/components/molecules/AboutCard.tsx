import type { AboutItem } from "@/interfaces/content";

interface Props {
  item: AboutItem;
  index: number;
}

export default function AboutCard({ item, index }: Props) {
  return (
    <article data-reveal>
      <span className="about-no">0{index + 1}</span>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  );
}
