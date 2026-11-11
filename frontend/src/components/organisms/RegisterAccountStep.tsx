import PillButton from "@/components/atoms/PillButton";
import TextField from "@/components/molecules/TextField";
import type { AuthError } from "@/interfaces/auth";

interface RegisterAccountProps {
  name: string;
  email: string;
  error: AuthError | null;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
}

export default function RegisterAccountStep({
  name,
  email,
  error,
  onName,
  onEmail,
}: RegisterAccountProps) {
  const fieldError = (f: string) =>
    error?.field === f ? error.error : undefined;

  return (
    <div className="[animation:pop_0.35s_ease-out] grid gap-20" key="account">
      <TextField
        id="reg-name"
        label="Nama lengkap"
        autoComplete="name"
        placeholder="Contoh: Rina Kartika"
        autoFocus
        value={name}
        onChange={(e) => onName(e.target.value)}
        error={fieldError("name")}
      />
      <TextField
        id="reg-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@usaha.id"
        value={email}
        onChange={(e) => onEmail(e.target.value)}
        error={fieldError("email")}
        hint="Link aktivasi akan dikirim ke email ini."
      />
      <div className="items-center flex gap-24 justify-between mt-8 [&.is-end]:justify-end auth-actions is-end">
        <PillButton type="submit" tone="blue">
          Lanjut
        </PillButton>
      </div>
    </div>
  );
}
