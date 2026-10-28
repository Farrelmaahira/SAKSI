import type { SealedContract } from './contract'

export interface VerifyResult {
  name: string
  hash: string
  match?: SealedContract
}
