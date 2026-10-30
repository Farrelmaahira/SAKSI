'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/dashboard'
import { DEMO_PROFILES } from '@/data/dashboard'

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem('saksi_role') as 'kades' | 'bpd' | 'inspektorat' | null
    if (saved && (saved === 'kades' || saved === 'bpd' || saved === 'inspektorat')) {
      setActiveRole(saved)
    }
  }, [])

  const switchRole = (role: 'kades' | 'bpd' | 'inspektorat') => {
    setActiveRole(role)
    localStorage.setItem('saksi_role', role)
  }

  const login = async (emailOrNip: string, pass: string): Promise<boolean> => {
    if (!emailOrNip.trim() || !pass.trim()) {
      setStatusMessage('Silakan isi username/NIP dan kata sandi.')
      return false
    }

    setIsLoading(true)
    setStatusMessage('Memverifikasi kredensial akun...')

    let targetRole: 'kades' | 'bpd' | 'inspektorat' = 'kades'
    if (emailOrNip.includes('bpd')) targetRole = 'bpd'
    else if (emailOrNip.includes('inspektorat')) targetRole = 'inspektorat'

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false)
        switchRole(targetRole)
        router.push(`/dashboard?role=${targetRole}`)
        resolve(true)
      }, 400)
    })
  }

  const quickLogin = (role: 'kades' | 'bpd' | 'inspektorat') => {
    const profile = DEMO_PROFILES[role]
    setIsLoading(true)
    setStatusMessage(`Masuk sebagai ${profile.roleLabel}...`)
    setTimeout(() => {
      setIsLoading(false)
      switchRole(role)
      router.push(`/dashboard?role=${role}`)
    }, 350)
  }

  const logout = () => {
    localStorage.removeItem('saksi_role')
    router.push('/login')
  }

  return {
    currentUser: DEMO_PROFILES[activeRole] || DEMO_PROFILES.kades,
    activeRole,
    statusMessage,
    isLoading,
    switchRole,
    login,
    quickLogin,
    logout,
  }
}

