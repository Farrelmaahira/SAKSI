import type { VerifyEmailResult } from "@/interfaces/auth";
import { markUsed } from "./mark-used";
import { readToken } from "./read-token";
import { updateUser } from "./update-user";
import { users } from "./users-store";

export function verifyEmail(token: string): VerifyEmailResult {
  const { t, error } = readToken(token, "verifikasi");
  if (!t)
    return { ok: false, field: "token", error: error ?? "Link tidak valid." };
  const u = users.get().find((x) => x.id === t.userId);
  if (!u) return { ok: false, field: "token", error: "Akun tidak ditemukan." };
  updateUser(u.id, { status: "aktif" });
  markUsed(token);
  return { ok: true, email: u.email };
}
