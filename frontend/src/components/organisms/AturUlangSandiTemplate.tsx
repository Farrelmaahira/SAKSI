import { Suspense } from "react";
import AuthShell from "./AuthShell";
import ResetTokenForm from "./ResetTokenForm";

export default function AturUlangSandiTemplate() {
  return (
    <AuthShell
      label="Atur ulang kata sandi"
      title="Buat kata sandi"
      mark="baru."
      lead="Pilih kata sandi yang mudah Anda ingat tetapi sulit ditebak orang lain."
      points={[
        "Minimal 8 karakter",
        "Campurkan huruf dan angka",
        "Jangan pakai kata sandi yang sama dengan akun lain",
      ]}
    >
      <Suspense>
        <ResetTokenForm />
      </Suspense>
    </AuthShell>
  );
}
