import { useRouter } from 'next/navigation'
import { useConfirm } from '@/hooks/use-confirm'
import { logout } from '@/lib/auth/logout'
import { resetDemo } from '@/lib/db/reset-demo'

/* Sign out and "reset demo data" of the dashboard shell. */
export function useDashActions(onLeaving: () => void) {
  const router = useRouter()
  const confirm = useConfirm()

  const signOut = () => {
    onLeaving()
    logout()
    router.push('/')
  }

  const reset = async () => {
    const ok = await confirm({
      title: 'Kembalikan ke data contoh?',
      text: 'Semua kontrak, laporan, dan catatan di dashboard kembali ke data contoh awal. Akun Anda tidak terhapus.',
      confirmLabel: 'Ya, kembalikan',
      tone: 'danger',
      art: 'document-warning_2es6',
    })
    if (ok) resetDemo()
  }

  return { signOut, reset, afterSwitch: () => router.push('/dashboard') }
}
