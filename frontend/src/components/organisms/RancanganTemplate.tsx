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
      <Panel className="d-planned">
        <Illustration name="in-progress_2mox" />
        <div>
          <h2>Fitur ini masih dirancang</h2>
          <p className="d-muted">
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
