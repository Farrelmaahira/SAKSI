import { useState } from 'react'
import { useSimClauses } from '@/hooks/use-sim-clauses'
import { useSimDrag } from '@/hooks/use-sim-drag'
import { useSimSeal } from '@/hooks/use-sim-seal'
import { useSimSign } from '@/hooks/use-sim-sign'
import { BASE_VALUE, clauses, typeFeedback } from '@/data/simulator'
import type { Contract } from '@/interfaces/contract'
import { getSession } from '@/lib/auth/get-session'
import { saveSimContract } from '@/lib/contracts/save-sim-contract'
import { buildSimContract } from '@/lib/simulator/build-sim-contract'

/* The five-step contract simulator: each step has its own hook, this one ties them to the step counter. */
export function useSimulator() {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<string | null>(null)
  const [typeMsg, setTypeMsg] = useState<string | null>(null)
  const [published, setPublished] = useState<Contract | null>(null)
  const [code] = useState(() => `SKS-SIM-${Math.floor(1000 + Math.random() * 9000)}`)
  const draft = useSimClauses(code)
  const sign = useSimSign()
  const seal = useSimSeal(code, draft.placed)

  const chooseType = (id: string) => {
    if (id !== 'Pengadaan') return setTypeMsg(typeFeedback[id])
    setType(id)
    setTypeMsg(null)
  }
  const drag = useSimDrag({ step, onType: chooseType, onClause: draft.add, onSign: sign.place })

  // a step is done when its goal is met; the next button stays disabled until then
  const done = [type === 'Pengadaan', clauses.every((c) => draft.placed.includes(c.id)), Boolean(sign.all), Boolean(seal.sealed), Boolean(published)]

  const publish = () => {
    const c = { ...buildSimContract(code, draft.placed, BASE_VALUE), owner: getSession()?.email }
    saveSimContract(c)
    seal.restore()
    setPublished(c)
  }

  const reset = () => {
    setStep(0)
    setType(null)
    setTypeMsg(null)
    draft.reset()
    sign.reset()
    seal.reset()
    setPublished(null)
  }

  return { step, setStep, type, typeMsg, chooseType, clearType: () => setType(null), code, draft, sign, seal, drag, done, published, publish, reset }
}
