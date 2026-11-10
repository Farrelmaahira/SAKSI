import Badge from "@/components/atoms/Badge";
import type { ReportFlow } from "@/interfaces/db";
import { flowTone } from "@/data/dash";
import { flowLabels, wargaFlowLabels } from "@/data/db";

interface Props {
  flow: ReportFlow;
  warga?: boolean;
}

export default function FlowBadge({ flow, warga }: Props) {
  return (
    <Badge tone={flowTone[flow]}>
      {(warga ? wargaFlowLabels : flowLabels)[flow]}
    </Badge>
  );
}
