'use client'

import { useState, useEffect } from 'react'
import { UserProfile, KpiMetric, ContractItem, WidgetOption } from '@/types/dashboard'
import { DEMO_PROFILES, ROLE_METRICS, CONTRACT_ITEMS } from '@/data/dashboard'
import { apiClient } from '@/lib/api-client'

export interface UseDashboardReturn {
  activeTab: 'dashboard' | 'contracts' | 'verify' | 'vendors' | 'simulate' | 'spk' | 'termin' | 'audit' | 'reports' | 'settings' | 'help'
  activeRole: 'kades' | 'bpd' | 'inspektorat'
  currentUser: UserProfile
  metrics: KpiMetric[]
  contracts: ContractItem[]
  searchQuery: string
  isAddWidgetOpen: boolean
  isSidebarCollapsed: boolean
  toastMessage: string | null
  gaugeScore: number
  isLoading: boolean
  setActiveTab: (tab: 'dashboard' | 'contracts' | 'verify' | 'vendors' | 'simulate' | 'spk' | 'termin' | 'audit' | 'reports' | 'settings' | 'help') => void
  setRole: (role: 'kades' | 'bpd' | 'inspektorat') => void
  setSearchQuery: (query: string) => void
  setIsAddWidgetOpen: (open: boolean) => void
  toggleSidebar: () => void
  exportReport: () => void
  selectWidget: (widget: WidgetOption) => void
}

export function useDashboard(initialRole: 'kades' | 'bpd' | 'inspektorat' = 'kades'): UseDashboardReturn {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'verify' | 'vendors' | 'simulate' | 'spk' | 'termin' | 'audit' | 'reports' | 'settings' | 'help'>('dashboard')
  const [activeRole, setActiveRole] = useState<'kades' | 'bpd' | 'inspektorat'>(initialRole)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState<boolean>(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [contractsList, setContractsList] = useState<ContractItem[]>(CONTRACT_ITEMS)
  const [liveMetrics, setLiveMetrics] = useState<KpiMetric[]>(ROLE_METRICS[initialRole] || ROLE_METRICS.kades)

  const currentUser = DEMO_PROFILES[activeRole] || DEMO_PROFILES.kades

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    apiClient
      .getDashboardOverview(activeRole)
      .then((data) => {
        if (!isMounted) return
        if (data.metrics && data.metrics.length > 0) {
          setLiveMetrics(data.metrics)
        }
        if (data.contracts && data.contracts.length > 0) {
          setContractsList(data.contracts)
        }
      })
      .catch(() => {
        // Fallback already handled inside apiClient
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeRole])

  const filteredContracts = searchQuery.trim()
    ? contractsList.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.contractId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contractsList

  const gaugeScore = activeRole === 'bpd' ? 94 : activeRole === 'inspektorat' ? 92 : 68

  const showToast = (msg: string, duration = 3000) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), duration)
  }

  const exportReport = () => {
    showToast('Mengunduh Berita Acara Rekapitulasi Kontrak Desa (CSV / PDF)...')
  }

  const selectWidget = (widget: WidgetOption) => {
    showToast(`Widget "${widget.title}" disematkan ke dashboard.`)
    setIsAddWidgetOpen(false)
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return {
    activeTab,
    activeRole,
    currentUser,
    metrics: liveMetrics,
    contracts: filteredContracts,
    searchQuery,
    isAddWidgetOpen,
    isSidebarCollapsed,
    toastMessage,
    gaugeScore,
    isLoading,
    setActiveTab,
    setRole: setActiveRole,
    setSearchQuery,
    setIsAddWidgetOpen,
    toggleSidebar,
    exportReport,
    selectWidget,
  }
}
