import type { Result } from "@/interfaces/auth";
import type { CounterpartyType } from "@/interfaces/master";

export function checkBusiness(
  business: string,
  type: CounterpartyType | null,
  npwp: string,
  address: string,
): Result {
  if (business.trim().length < 3)
    return {
      ok: false,
      field: "business",
      error: "Tulis nama usaha atau lembaga.",
    };
  if (!type)
    return {
      ok: false,
      field: "type",
      error: "Pilih jenis usaha atau lembaga.",
    };
  const digits = npwp.replace(/\D/g, "");
  if (npwp.trim() && digits.length !== 15 && digits.length !== 16)
    return {
      ok: false,
      field: "npwp",
      error: "NPWP terdiri dari 15 atau 16 angka. Kosongkan jika belum punya.",
    };
  if (address.trim().length < 8)
    return {
      ok: false,
      field: "address",
      error: "Tulis alamat lengkap, minimal nama jalan dan kota.",
    };
  return { ok: true };
}
