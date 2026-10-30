'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDashboard } from '@/hooks/use-dashboard'
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
import { VerifyTab } from '@/components/dashboard/VerifyTab'
import { VendorsTab } from '@/components/dashboard/VendorsTab'
import { SimulateTab } from '@/components/dashboard/SimulateTab'
import { SpkTab } from '@/components/dashboard/SpkTab'
import { TerminTab } from '@/components/dashboard/TerminTab'
import { AuditReportTab } from '@/components/dashboard/AuditReportTab'
import { CitizenReportsTab } from '@/components/dashboard/CitizenReportsTab'
import { SettingsTab } from '@/components/dashboard/SettingsTab'
import { HelpTab } from '@/components/dashboard/HelpTab'
import '@/styles/dashboard.css'

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialRoleParam = (searchParams.get('role') as 'kades' | 'bpd' | 'inspektorat') || 'kades'

  // Custom hook containing all dashboard business logic
  const {
    activeTab,
    activeRole,
    currentUser,
    metrics,
    contracts,
    searchQuery,
    isAddWidgetOpen,
    isSidebarCollapsed,
    toastMessage,
    gaugeScore,
    setActiveTab,
    setRole,
    setSearchQuery,
    setIsAddWidgetOpen,
    toggleSidebar,
    exportReport,
    selectWidget,
  } = useDashboard(initialRoleParam)

  return (
    <div className="dashboard-layout">
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
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#65D18D" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role-adaptive sidebar with official SAKSI logo, no upgrade card, clean tab navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userRole={activeRole}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className="dashboard-main">
        {/* Topbar with clean initials avatar, no emojis */}
        <Topbar
          currentUser={currentUser}
          onRoleChange={setRole}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="dashboard-content">
          <PageHeader
            onOpenAddWidget={() => setIsAddWidgetOpen(true)}
            onExport={exportReport}
          />

          {activeTab === 'dashboard' && (
            <>
              <KpiCards metrics={metrics} />
              <div className="dashboard-grid-2col">
                <div className="grid-col-left">
                  <MainChartCard />
                  <ContractsTableCard contracts={contracts} />
                </div>
                <div className="grid-col-right">
                  <ActivityBarCard />
                  <IntegritasGaugeCard score={gaugeScore} />
                  <AiAssistantCard />
                </div>
              </div>
            </>
          )}

          {activeTab === 'contracts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ContractsTableCard
                contracts={contracts}
                title={
                  activeRole === 'inspektorat'
                    ? 'Audit Kontrak Seluruh Desa (33 Desa Se-Kabupaten)'
                    : activeRole === 'bpd'
                    ? 'Daftar Kontrak Desa Sukamaju Dalam Pengawasan BPD'
                    : 'Semua Kontrak & SPK APBDes Berjalan'
                }
              />
            </div>
          )}

          {activeTab === 'verify' && <VerifyTab />}

          {activeTab === 'vendors' && <VendorsTab />}

          {activeTab === 'simulate' && <SimulateTab />}

          {activeTab === 'spk' && <SpkTab userRole={activeRole} />}

          {activeTab === 'termin' && <TerminTab userRole={activeRole} />}

          {activeTab === 'audit' && <AuditReportTab userRole={activeRole} />}

          {activeTab === 'reports' && <CitizenReportsTab />}

          {activeTab === 'settings' && <SettingsTab currentUser={currentUser} />}

          {activeTab === 'help' && <HelpTab />}
        </main>
      </div>

      <AddWidgetDrawer
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onSelectWidget={selectWidget}
      />
    </div>
  )
}

export function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px' }}>Memuat Dashboard SAKSI...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

export default DashboardPage
