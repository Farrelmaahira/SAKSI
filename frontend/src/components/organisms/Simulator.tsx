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
import { saveSimContract } from "@/lib/contracts/save-sim-contract";
import { sha256 } from "@/lib/contracts/sha256";
import { buildSimContract } from "@/lib/simulator/build-sim-contract";
import { randomHex } from "@/lib/simulator/random-hex";
import { apiClient } from "@/lib/api-client";
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
    if (targetClause) {
      try {
        await apiClient.auditClause({
          contractId: code,
          clauseText: targetClause.text,
          clauseType: targetClause.title,
        });
      } catch {
        // Fallback handled
      }
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
    const c = buildSimContract(code, placed, BASE_VALUE);
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
    <div className="sim" ref={rootRef}>
      <SimScenario />

      <div className="sim-grid">
        <SimSidebar step={step} done={done} onStep={setStep} />

        <section className="sim-stage" aria-live="polite">
          <header className="stage-head">
            <p className="stage-count">
              Langkah {step + 1} dari {steps.length}
            </p>
            <h3>{steps[step].title}</h3>
            <p className="stage-guide">{steps[step].guide}</p>
            {step < 3 && (
              <p className="touch-hint">
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

          <footer className="sim-nav">
            <button
              type="button"
              className="text-btn"
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
