import type { ApiResult } from '@/interfaces/api'
import FormAlert from '@/components/atoms/FormAlert'

interface Props { result?: ApiResult<unknown> }

/* Loading or error line for a tab that reads GET /contracts/{id}/termin. Renders nothing once loaded. */
export default function TerminState({ result }: Props) {
  if (!result) return <p className="text-[1.4rem] text-dim" role="status">Memuat data termin dari server…</p>
  return result.ok ? null : <FormAlert>{result.error}</FormAlert>
}
