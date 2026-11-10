/* One seal check: the file's SHA-256 and, when GET /public/seals/verify matched it, the sealed contract */
export interface VerifyResult {
  name: string
  hash: string
  match?: { code: string; id: number; title: string; version: number }
}
