import MailPreview from "@/components/molecules/MailPreview";
import StepIndicator from "@/components/molecules/StepIndicator";
import { verifySteps } from "@/data/auth";

interface RegisterDoneProps {
  email: string;
  token: string;
  firstName: string;
  type: string;
  business: string;
}

export default function RegisterDone({
  email,
  token,
  firstName,
  type,
  business,
}: RegisterDoneProps) {
  return (
    <div className="[animation:pop_0.35s_ease-out] grid gap-20">
      <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">
        Cek email Anda
      </h2>
      <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">
        Kami mengirim link aktivasi ke <strong>{email}</strong>. Selama belum
        diklik, status akun Anda <em>menunggu verifikasi</em>.
      </p>
      <StepIndicator steps={verifySteps} current={3} />
      <MailPreview
        to={email}
        subject="Aktifkan akun SAKSI Anda"
        body={`Halo ${firstName}, terima kasih sudah mendaftar sebagai ${type.toLowerCase()} untuk ${business}. Klik tombol di bawah untuk mengaktifkan akun. Link berlaku 24 jam.`}
        action="Aktifkan akun"
        href={`/verifikasi?token=${token}`}
      />
    </div>
  );
}
