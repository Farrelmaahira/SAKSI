import type { SealedContract } from "@/interfaces/contract";
import CitizenReports from "./CitizenReports";
import ContractClauses from "./ContractClauses";
import ContractFacts from "./ContractFacts";
import ContractHead from "./ContractHead";
import HashCard from "./HashCard";
import ProgressCard from "./ProgressCard";

interface Props {
  contract: SealedContract;
  onReport: () => void;
}

export default function ContractDetail({ contract: c, onReport }: Props) {
  return (
    <article className="[animation:pop_0.45s_ease-out] mb-100">
      <ContractHead c={c} />
      <div className="grid gap-20 lg:[align-items:start] lg:gap-30 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="contract-main">
          <ContractFacts c={c} />
          <HashCard c={c} />
          <ContractClauses c={c} />
        </div>
        <div className="contract-side">
          <ProgressCard c={c} />
          <CitizenReports c={c} onReport={onReport} />
        </div>
      </div>
    </article>
  );
}
