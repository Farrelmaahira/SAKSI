import Illustration from "@/components/atoms/Illustration";
import type { FlowItem } from "@/interfaces/content";

interface Props {
  item: FlowItem;
  index: number;
}

export default function FlowStep({ item, index }: Props) {
  return (
    <li>
      <div className="aspect-[4/3] bg-white rounded-[1rem] overflow-hidden relative [.flow_li:last-child_&]:aspect-[2/1] [&_img]:h-[76%] [&_img]:inset-[12%] [&_img]:object-contain [&_img]:absolute [&_img]:[transition:transform_0.6s_var(--ease-saksi)] [&_img]:w-[76%] [.flow_li:hover_&_img]:[transform:scale(1.06)] lg:[.flow_li:last-child_&]:aspect-[4/3]">
        <Illustration name={item.art} loading="lazy" />
      </div>
      <div className="grid gap-6 pt-20 px-10 pb-12 lg:pt-24 lg:px-12 lg:pb-16">
        <span className="text-blue text-[1.3rem] [.flow_li:last-child_&]:text-white [.flow_li:last-child_&]:opacity-[0.85]">
          0{index + 1}
        </span>
        <strong className="text-[2.2rem] font-[350] tracking-[-0.02em] leading-[1.1] lg:text-[2.4rem]">
          {item.label}
        </strong>
        <p className="text-[1.4rem] leading-[1.45] opacity-[0.7] [.flow_li:last-child_&]:text-white [.flow_li:last-child_&]:opacity-[0.85] lg:text-[1.5rem]">
          {item.desc}
        </p>
      </div>
    </li>
  );
}
