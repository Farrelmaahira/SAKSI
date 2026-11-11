import { useState } from 'react'
import { clauses, distractor } from '@/data/simulator'
import { auditClause } from '@/lib/api/audit-clause'

/* Step 2 of the simulator: which clauses are on the draft, and which of them the AI suggested. */
export function useSimClauses(code: string) {
  const [placed, setPlaced] = useState<string[]>([])
  const [aiIds, setAiIds] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const add = (id: string) => {
    if (id === distractor.id) return setMessage(distractor.reason)
    setMessage(null)
    setPlaced((p) => (p.includes(id) ? p : [...p, id]))
  }

  const applyAi = async (id: string) => {
    setAiIds((a) => [...a, id])
    add(id)
    const target = clauses.find((c) => c.id === id)
    // fire-and-forget: the simulator's own feedback does not depend on the server audit
    if (target) await auditClause({ contractId: code, clauseText: target.text, clauseType: target.title })
  }

  const reset = () => {
    setPlaced([])
    setAiIds([])
    setMessage(null)
  }

  return { placed, aiIds, message, add, remove: (id: string) => setPlaced((p) => p.filter((x) => x !== id)), applyAi, reset }
}
