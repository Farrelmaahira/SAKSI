import MailPreview from '@/components/molecules/MailPreview'
import StepIndicator from '@/components/molecules/StepIndicator'
import { verifySteps } from '@/data/auth'

interface Props {
  email: string
  token: string
  firstName: string
  type: string
  business: string
}

export default function RegisterDone({ email, token, firstName, type, business }: Props) {
  return (
    <div className="auth-step">
      <h2 className="auth-card-title">Cek email Anda</h2>
      <p className="auth-card-sub">
        Kami mengirim link aktivasi ke <strong>{email}</strong>. Selama belum diklik, status akun Anda <em>menunggu verifikasi</em>.
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
  )
}
