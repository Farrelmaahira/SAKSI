import { DndContext, DragOverlay } from "@dnd-kit/core";
import DragPreview from "@/components/molecules/DragPreview";
import type { useSimulator } from "@/hooks/use-simulator";
import StepClauses from "./StepClauses";
import StepHash from "./StepHash";
import StepPublish from "./StepPublish";
import StepSign from "./StepSign";
import StepType from "./StepType";

interface SimStepsProps {
  sim: ReturnType<typeof useSimulator>;
}

export default function SimSteps({ sim }: SimStepsProps) {
  const { step, draft, sign, seal, drag } = sim;
  return (
    <>
      <DndContext
        sensors={drag.sensors}
        onDragStart={drag.onDragStart}
        onDragEnd={drag.onDragEnd}
        onDragCancel={drag.onDragCancel}
      >
        {step === 0 && (
          <StepType
            type={sim.type}
            message={sim.typeMsg}
            onChoose={sim.chooseType}
            onClear={sim.clearType}
          />
        )}
        {step === 1 && (
          <StepClauses
            placed={draft.placed}
            aiIds={draft.aiIds}
            message={draft.message}
            onAdd={draft.add}
            onRemove={draft.remove}
            onApplyAi={draft.applyAi}
          />
        )}
        {step === 2 && (
          <StepSign
            signed={sign.signed}
            message={sign.message}
            onPlace={sign.place}
          />
        )}
        <DragOverlay
          dropAnimation={{ duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }}
        >
          <DragPreview id={drag.dragging} />
        </DragOverlay>
      </DndContext>
      {step === 3 && (
        <StepHash
          code={sim.code}
          clauseCount={draft.placed.length}
          value={seal.value}
          sealed={seal.sealed}
          scramble={seal.scramble}
          liveHash={seal.liveHash}
          onValue={seal.setValue}
          onSeal={seal.seal}
          onRestore={seal.restore}
        />
      )}
      {step === 4 && (
        <StepPublish
          published={sim.published}
          sealed={seal.sealed}
          onPublish={sim.publish}
          onReset={sim.reset}
        />
      )}
    </>
  );
}
