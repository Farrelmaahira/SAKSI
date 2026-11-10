import type { Result } from "@/interfaces/auth";
import { findUser } from "./find-user";
import { isEmail } from "./is-email";

export function checkAccount(name: string, email: string): Result {
  if (name.trim().length < 3)
    return { ok: false, field: "name", error: "Tulis nama minimal 3 huruf." };
  if (!isEmail(email))
    return {
      ok: false,
      field: "email",
      error: "Format email belum benar, contoh: nama@usaha.id",
    };
  if (findUser(email))
    return {
      ok: false,
      field: "email",
      error: "Email ini sudah terdaftar. Silakan masuk.",
    };
  return { ok: true };
}
