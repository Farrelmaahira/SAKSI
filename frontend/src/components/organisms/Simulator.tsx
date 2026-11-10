"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Arrow from "@/components/atoms/Arrow";
import PillButton from "@/components/atoms/PillButton";
import DragPreview from "@/components/molecules/DragPreview";
import SimScenario from "@/components/molecules/SimScenario";
import {
  BASE_VALUE,
  clauses,
  distractor,
  signItems,
  steps,
  typeFeedback,
  unsigned,
} from "@/data/simulator";
import type { Contract } from "@/interfaces/contract";
import type { SignedState } from "@/interfaces/simulator";
import { contractText } from "@/lib/contracts/contract-text";
import { getSession } from "@/lib/auth/get-session";
import { saveSimContract } from "@/lib/contracts/save-sim-contract";
import { sha256 } from "@/lib/contracts/sha256";
import { buildSimContract } from "@/lib/simulator/build-sim-contract";
import { randomHex } from "@/lib/simulator/random-hex";
import { auditClause } from "@/lib/api/audit-clause";
import SimSidebar from "./SimSidebar";
import StepClauses from "./StepClauses";
import StepHash from "./StepHash";
import StepPublish from "./StepPublish";
import StepSign from "./StepSign";
import StepType from "./StepType";

export default function Simulator() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [typeMsg, setTypeMsg] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [aiIds, setAiIds] = useState<string[]>([]);
  const [clauseMsg, setClauseMsg] = useState<string | null>(null);
  const [signed, setSigned] = useState<SignedState>(unsigned);
  const [signMsg, setSignMsg] = useState<string | null>(null);
  const [sealed, setSealed] = useState("");
  const [scramble, setScramble] = useState("");
  const [value, setValue] = useState(BASE_VALUE);
  const [liveHash, setLiveHash] = useState("");
  const [published, setPublished] = useState<Contract | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [code] = useState(
    () => `SKS-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 140, tolerance: 6 },
    }),
  );

  const missing = clauses.filter((c) => !placed.includes(c.id));
  const allSigned = signed.kades && signed.meterai && signed.penyedia;
  const done = [
    type === "Pengadaan",
    missing.length === 0,
    allSigned,
    Boolean(sealed),
    Boolean(published),
  ];

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = rootRef.current;
    if (el && el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  useEffect(() => {
    if (!sealed) return;
    let alive = true;
    sha256(contractText(buildSimContract(code, placed, value))).then(
      (h) => alive && setLiveHash(h),
    );
    return () => {
      alive = false;
    };
  }, [value, sealed]);

  const chooseType = (id: string) => {
    if (id === "Pengadaan") {
      setType(id);
      setTypeMsg(null);
    } else {
      setTypeMsg(typeFeedback[id]);
    }
  };

  const addClause = (id: string) => {
    if (id === distractor.id) return setClauseMsg(distractor.reason);
    setClauseMsg(null);
    setPlaced((p) => (p.includes(id) ? p : [...p, id]));
  };

  const applyAi = async (id: string) => {
    setAiIds((a) => [...a, id]);
    addClause(id);
    const targetClause = clauses.find((c) => c.id === id);
    // fire-and-forget: the simulator's own feedback does not depend on the server audit
    if (targetClause) {
      await auditClause({
        contractId: code,
        clauseText: targetClause.text,
        clauseType: targetClause.title,
      });
    }
  };

  const placeSign = (id: string, zone: string) => {
    const item = signItems.find((s) => s.id === id);
    if (!item) return;
    if (item.zone !== zone)
      return setSignMsg(
        "Kotak itu untuk pihak lain. Coba seret ke kotak yang sesuai namanya.",
      );
    setSignMsg(null);
    setSigned((s) => ({ ...s, [item.key]: true }));
  };

  const seal = async () => {
    const h = await sha256(
      contractText(buildSimContract(code, placed, BASE_VALUE)),
    );
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setScramble(randomHex(64));
      if (i > 16) {
        clearInterval(t);
        setSealed(h);
        setLiveHash(h);
      }
    }, 40);
  };

  const publish = () => {
    const c = { ...buildSimContract(code, placed, BASE_VALUE), owner: getSession()?.email };
    saveSimContract(c);
    setValue(BASE_VALUE);
    setPublished(c);
  };

  const reset = () => {
    setStep(0);
    setType(null);
    setTypeMsg(null);
    setPlaced([]);
    setAiIds([]);
    setClauseMsg(null);
    setSigned(unsigned);
    setSignMsg(null);
    setSealed("");
    setScramble("");
    setValue(BASE_VALUE);
    setLiveHash("");
    setPublished(null);
  };

  const onDragStart = ({ active }: DragStartEvent) =>
    setDragging(String(active.id));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    if (!over) return;
    const id = String(active.id);
    const target = String(over.id);
    if (step === 0 && target === "desk") chooseType(id);
    if (step === 1 && target === "draft") addClause(id);
    if (step === 2) placeSign(id, target);
  };

  return (
    <div className="[scroll-margin-top:2rem]" ref={rootRef}>
      <SimScenario />

      <div className="grid gap-16 grid-cols-[minmax(0,1fr)] lg:[align-items:start] lg:grid-cols-[34rem_minmax(0,1fr)]">
        <SimSidebar step={step} done={done} onStep={setStep} />

        <section className="bg-soft rounded-[2rem] min-w-0 p-24 md:p-40 lg:p-50" aria-live="polite">
          <header className="mb-30 [&_h3]:text-[3.4rem] [&_h3]:font-[320] [&_h3]:tracking-[-0.03em] [&_h3]:leading-[1.05] [&_h3]:mt-8 [&_h3]:mx-0 [&_h3]:mb-12 md:[&_h3]:text-[4.6rem]">
            <p className="text-blue text-[1.3rem] uppercase">
              Langkah {step + 1} dari {steps.length}
            </p>
            <h3>{steps[step].title}</h3>
            <p className="text-[1.7rem] leading-[1.5] max-w-720 md:text-[1.9rem]">{steps[step].guide}</p>
            {step < 3 && (
              <p className="text-[1.3rem] mt-10 opacity-[0.6] fine-hover:hidden">
                Di ponsel, ketuk kartu untuk menaruhnya.
              </p>
            )}
          </header>

          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setDragging(null)}
          >
            {step === 0 && (
              <StepType
                type={type}
                message={typeMsg}
                onChoose={chooseType}
                onClear={() => setType(null)}
              />
            )}
            {step === 1 && (
              <StepClauses
                placed={placed}
                aiIds={aiIds}
                message={clauseMsg}
                onAdd={addClause}
                onRemove={(id) => setPlaced((p) => p.filter((x) => x !== id))}
                onApplyAi={applyAi}
              />
            )}
            {step === 2 && (
              <StepSign signed={signed} message={signMsg} onPlace={placeSign} />
            )}

            <DragOverlay
              dropAnimation={{
                duration: 220,
                easing: "cubic-bezier(.2,.8,.2,1)",
              }}
            >
              <DragPreview id={dragging} />
            </DragOverlay>
          </DndContext>

          {step === 3 && (
            <StepHash
              code={code}
              clauseCount={placed.length}
              value={value}
              sealed={sealed}
              scramble={scramble}
              liveHash={liveHash}
              onValue={setValue}
              onSeal={seal}
              onRestore={() => setValue(BASE_VALUE)}
            />
          )}

          {step === 4 && (
            <StepPublish
              published={published}
              sealed={sealed}
              onPublish={publish}
              onReset={reset}
            />
          )}

          <footer className="items-center flex gap-20 justify-between mt-32">
            <button
              type="button"
              className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <Arrow dir="left" /> Kembali
            </button>
            {step < steps.length - 1 && (
              <PillButton
                tone="blue"
                onClick={() => setStep((s) => s + 1)}
                disabled={!done[step]}
              >
                Langkah berikutnya
              </PillButton>
            )}
          </footer>
        </section>
      </div>
    </div>
  );
}
