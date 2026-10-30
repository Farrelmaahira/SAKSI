'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/dashboard'
import { DEMO_PROFILES } from '@/data/dashboard'
import { apiClient } from '@/lib/api-client'

export interface UseAuthReturn {
  currentUser: UserProfile
  activeRole: 'kades' | 'bpd' | 'inspektorat'
  statusMessage: string | null
  isLoading: boolean
  switchRole: (role: 'kades' | 'bpd' | 'inspektorat') => void
  login: (emailOrNip: string, pass: string) => Promise<boolean>
  quickLogin: (role: 'kades' | 'bpd' | 'inspektorat') => void
  logout: () => void
}

export function useAuth(initialRole: 'kades' | 'bpd' | 'inspektorat' = 'kades'): UseAuthReturn {
  const router = useRouter()
  const [activeRole, setActiveRole] = useState<'kades' | 'bpd' | 'inspektorat'>(initialRole)
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PROFILES[initialRole])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const savedRole = localStorage.getItem('saksi_role') as 'kades' | 'bpd' | 'inspektorat' | null
    if (savedRole && (savedRole === 'kades' || savedRole === 'bpd' || savedRole === 'inspektorat')) {
      setActiveRole(savedRole)
      setCurrentUser(DEMO_PROFILES[savedRole])
    }
  }, [])

  const switchRole = (role: 'kades' | 'bpd' | 'inspektorat') => {
    setActiveRole(role)
    setCurrentUser(DEMO_PROFILES[role])
    localStorage.setItem('saksi_role', role)
  }

  const login = async (emailOrNip: string, pass: string): Promise<boolean> => {
    if (!emailOrNip.trim() || !pass.trim()) {
      setStatusMessage('Silakan isi username/NIP dan kata sandi.')
      return false
    }

    setIsLoading(true)
    setStatusMessage('Memverifikasi kredensial akun...')

    try {
      const auth = await apiClient.login({ identifier: emailOrNip, password: pass })
      const role = auth.user.role as 'kades' | 'bpd' | 'inspektorat'
      const resolvedRole = (role === 'kades' || role === 'bpd' || role === 'inspektorat') ? role : 'kades'

      switchRole(resolvedRole)
      setCurrentUser(auth.user)
      setIsLoading(false)
      router.push(`/dashboard?role=${resolvedRole}`)
      return true
    } catch {
      setIsLoading(false)
      setStatusMessage('Terjadi kesalahan saat otentikasi. Silakan coba lagi.')
      return false
    }
  }

  const quickLogin = async (role: 'kades' | 'bpd' | 'inspektorat') => {
    const profile = DEMO_PROFILES[role]
    setIsLoading(true)
    setStatusMessage(`Masuk sebagai ${profile.roleLabel}...`)

    const demoCredentials: Record<'kades' | 'bpd' | 'inspektorat', { id: string; pass: string }> = {
      kades: { id: 'kades@sukamaju.desa.id', pass: 'Kades@Sukamaju2026' },
      bpd: { id: 'bpd@sukamaju.desa.id', pass: 'Bpd@Sukamaju2026' },
      inspektorat: { id: 'inspektorat@banyumaskab.go.id', pass: 'Inspek@Banyumas2026' },
    }

    const cred = demoCredentials[role]
    const auth = await apiClient.login({ identifier: cred.id, password: cred.pass })
    switchRole(role)
    if (auth.user) {
      setCurrentUser(auth.user)
    }
    setIsLoading(false)
    router.push(`/dashboard?role=${role}`)
  }

  const logout = () => {
    apiClient.clearStoredToken()
    localStorage.removeItem('saksi_role')
    router.push('/login')
  }

  return {
    currentUser,
    activeRole,
    statusMessage,
    isLoading,
    switchRole,
    login,
    quickLogin,
    logout,
  }
}
