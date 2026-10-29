'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { UserRole, WidgetOption } from '@/types/dashboard'
import { DEMO_USERS, ROLE_KPIS, CONTRACT_ROWS } from '@/data/dashboard'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { MainChartCard } from '@/components/dashboard/MainChartCard'
import { ActivityBarCard } from '@/components/dashboard/ActivityBarCard'
import { IntegritasGaugeCard } from '@/components/dashboard/IntegritasGaugeCard'
import { ContractsTableCard } from '@/components/dashboard/ContractsTableCard'
import { AiAssistantCard } from '@/components/dashboard/AiAssistantCard'
import { AddWidgetDrawer } from '@/components/dashboard/AddWidgetDrawer'
import '@/styles/dashboard.css'

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || 'kades'

  const [activeRole, setActiveRole] = useState<UserRole>('kades')
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (initialRole && (initialRole === 'kades' || initialRole === 'bpd' || initialRole === 'inspektorat')) {
      setActiveRole(initialRole)
    }
  }, [initialRole])

  const currentUser = DEMO_USERS[activeRole] || DEMO_USERS.kades
  const currentMetrics = ROLE_KPIS[activeRole] || ROLE_KPIS.kades

  const handleExport = () => {
    setToastMessage('Mengunduh Laporan Rekapitulasi Kontrak (CSV / PDF)...')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSelectWidget = (widget: WidgetOption) => {
    setToastMessage(`Widget "${widget.title}" berhasil disematkan ke dashboard.`)
    setIsAddWidgetOpen(false)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter contracts if search query is provided
  const filteredContracts = searchQuery.trim()
    ? CONTRACT_ROWS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CONTRACT_ROWS

  // Calculate dynamic gauge score per role
  const gaugeScore = activeRole === 'bpd' ? 94 : activeRole === 'inspektorat' ? 92 : 68

  return (
    <div className="dashboard-layout">
      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#121318',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#65D18D" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar (258px) */}
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Area */}
      <div className="dashboard-main">
        {/* Topbar (72px) */}
        <Topbar
          currentUser={currentUser}
          onRoleChange={(role) => setActiveRole(role)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Container (padding 32px) */}
        <main className="dashboard-content">
          {/* Header row with controls */}
          <PageHeader
            onOpenAddWidget={() => setIsAddWidgetOpen(true)}
            onExport={handleExport}
          />

          {/* 4 KPI Cards */}
          <KpiCards metrics={currentMetrics} />

          {/* 2-Column Grid (5:3 Ratio, ~685px vs ~409px) */}
          <div className="dashboard-grid-2col">
            {/* Left Column (Total Profit / Realisasi + Best Selling / Kontrak) */}
            <div className="grid-col-left">
              <MainChartCard />
              <ContractsTableCard contracts={filteredContracts} />
            </div>

            {/* Right Column (Most Day Active + Gauge + AI Assistant) */}
            <div className="grid-col-right">
              <ActivityBarCard />
              <IntegritasGaugeCard score={gaugeScore} />
              <AiAssistantCard />
            </div>
          </div>
        </main>
      </div>

      {/* Slide-out Add Widget Sheet (420px) */}
      <AddWidgetDrawer
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onSelectWidget={handleSelectWidget}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px' }}>Memuat Dashboard SAKSI...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

