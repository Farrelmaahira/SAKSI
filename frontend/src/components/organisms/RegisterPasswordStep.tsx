import FormAlert from "@/components/atoms/FormAlert";
import PillButton from "@/components/atoms/PillButton";
import PasswordField from "@/components/molecules/PasswordField";
import PasswordStrength from "@/components/molecules/PasswordStrength";
import type { AuthError } from "@/interfaces/auth";
import { cn } from "@/lib/utils";

interface Props {
  password: string;
  confirm: string;
  agree: boolean;
  busy: boolean;
  error: AuthError | null;
  onPassword: (v: string) => void;
  onConfirm: (v: string) => void;
  onAgree: (v: boolean) => void;
  onBack: () => void;
}

export default function RegisterPasswordStep({
  password,
  confirm,
  agree,
  busy,
  error,
  onPassword,
  onConfirm,
  onAgree,
  onBack,
}: Props) {
  const fieldError = (f: string) =>
    error?.field === f ? error.error : undefined;

  return (
    <div className="[animation:pop_0.35s_ease-out] grid gap-20" key="password">
      {error && !error.field && <FormAlert>{error.error}</FormAlert>}
      <div>
        <PasswordField
          id="reg-password"
          label="Kata sandi"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          autoFocus
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          error={fieldError("password")}
        />
        {password && <PasswordStrength password={password} />}
      </div>
      <PasswordField
        id="reg-confirm"
        label="Konfirmasi kata sandi"
        autoComplete="new-password"
        placeholder="Ketik ulang kata sandi"
        value={confirm}
        onChange={(e) => onConfirm(e.target.value)}
        error={fieldError("confirm")}
        hint={
          confirm && confirm === password ? "Kata sandi sudah sama." : undefined
        }
      />
      <label
        className={cn(
          "[&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] items-start cursor-pointer flex text-[1.4rem] gap-12 leading-[1.45] relative auth-agree",
          fieldError("agree") && "has-error",
        )}
      >
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => onAgree(e.target.checked)}
        />
        <span
          className="border-[0.15rem] border-ink border-solid rounded-[0.5rem] flex-none h-22 [transition:background_0.2s,_border-color_0.2s] w-22 [.auth-agree_input:checked+&]:bg-blue [.auth-agree_input:checked+&]:border-blue [.auth-agree_input:checked+&]:after:[border:solid_var(--color-white)] [.auth-agree_input:checked+&]:after:[border-width:0_0.2rem_0.2rem_0] [.auth-agree_input:checked+&]:after:content-[''] [.auth-agree_input:checked+&]:after:block [.auth-agree_input:checked+&]:after:h-11 [.auth-agree_input:checked+&]:after:mt-2.5 [.auth-agree_input:checked+&]:after:mx-auto [.auth-agree_input:checked+&]:after:mb-0 [.auth-agree_input:checked+&]:after:[transform:rotate(45deg)] [.auth-agree_input:checked+&]:after:w-6 [.auth-agree_input:focus-visible+&]:[outline:0.2rem_solid_var(--color-ink)] [.auth-agree_input:focus-visible+&]:[outline-offset:0.2rem] [.auth-agree.has-error_&]:border-red"
          aria-hidden="true"
        />
        Saya paham ini prototipe dan akun hanya tersimpan di browser ini.
      </label>
      {fieldError("agree") && (
        <p className="text-red text-[1.4rem] leading-[1.4]">
          {fieldError("agree")}
        </p>
      )}
      <div className="items-center flex gap-24 justify-between mt-8 [&.is-end]:justify-end auth-actions">
        <button
          type="button"
          className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0"
          onClick={onBack}
        >
          Kembali
        </button>
        <PillButton type="submit" tone="blue" disabled={busy}>
          {busy ? "Mendaftarkan…" : "Daftar"}
        </PillButton>
      </div>
    </div>
  );
}
