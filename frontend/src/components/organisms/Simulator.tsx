"use client";

import SimScenario from "@/components/molecules/SimScenario";
import { useScrollOnChange } from "@/hooks/use-scroll-on-change";
import { useSimulator } from "@/hooks/use-simulator";
import SimFooter from "./SimFooter";
import SimHeader from "./SimHeader";
import SimSidebar from "./SimSidebar";
import SimSteps from "./SimSteps";

export default function Simulator() {
  const sim = useSimulator();
  const { step, setStep } = sim;
  const rootRef = useScrollOnChange<HTMLDivElement>(step);

  return (
    <div className="[scroll-margin-top:2rem]" ref={rootRef}>
      <SimScenario />
      <div className="grid gap-16 grid-cols-[minmax(0,1fr)] lg:[align-items:start] lg:grid-cols-[34rem_minmax(0,1fr)]">
        <SimSidebar step={step} done={sim.done} onStep={setStep} />
        <section
          className="bg-soft rounded-[2rem] min-w-0 p-24 md:p-40 lg:p-50"
          aria-live="polite"
        >
          <SimHeader step={step} />
          <SimSteps sim={sim} />
          <SimFooter
            step={step}
            canNext={sim.done[step]}
            onBack={() => setStep((s) => Math.max(0, s - 1))}
            onNext={() => setStep((s) => s + 1)}
          />
        </section>
      </div>
    </div>
  );
}
