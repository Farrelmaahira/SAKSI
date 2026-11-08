"use client";

import { rancanganPlans } from "@/data/dash";
import { useDash } from "@/hooks/use-dash";
import NotAllowed from "@/components/molecules/NotAllowed";
import PageHead from "@/components/molecules/PageHead";
import Badge from "@/components/atoms/Badge";
import Panel from "@/components/molecules/Panel";
import Illustration from "@/components/atoms/Illustration";
import Btn from "@/components/atoms/Btn";

interface Props {
  plan: keyof typeof rancanganPlans;
}

export default function RancanganTemplate({ plan }: Props) {
  const { session } = useDash();
  const p = rancanganPlans[plan];
  if (p.role && session.role.role !== p.role) return <NotAllowed />;
  return (
    <>
      <PageHead
        label={p.label}
        title={p.title}
        desc={p.desc}
        actions={<Badge tone="tint">Segera hadir</Badge>}
      />
      <Panel className="items-center gap-24 py-30 px-24 [&_img]:max-h-180 [&_img]:w-auto [&>div]:grid [&>div]:gap-12 [&>div]:justify-items-start [&_h2]:text-[2.6rem] [&_h2]:font-[340] [&_ul]:grid! [&_ul]:gap-6! [&_ul]:text-[1.5rem]! [&_ul]:list-none [&_ul]:list-outside [&_li::before]:text-blue [&_li::before]:content-['→'] [&_li::before]:mr-10 md:grid-cols-[24rem_1fr]">
        <Illustration name="in-progress_2mox" />
        <div>
          <h2>Fitur ini masih dirancang</h2>
          <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">
            Belum tersedia di prototipe. Rencana cakupannya:
          </p>
          <ul>
            {p.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <Btn variant="ghost" to="/dashboard">
            Kembali ke beranda
          </Btn>
        </div>
      </Panel>
    </>
  );
}
