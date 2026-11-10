import type { Token, TokenKind } from "@/interfaces/auth";
import { tokens } from "./tokens-store";

export function readToken(
  token: string,
  kind: TokenKind,
): { t: Token; error?: undefined } | { t?: undefined; error: string } {
  const t = tokens.get().find((x) => x.token === token && x.kind === kind);
  if (!t) return { error: "Link tidak dikenali. Minta link baru." };
  if (t.usedAt) return { error: "Link ini sudah pernah dipakai." };
  if (t.expiresAt < Date.now())
    return { error: "Link sudah kedaluwarsa. Minta link baru." };
  return { t };
}
