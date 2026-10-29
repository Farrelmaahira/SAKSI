'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface SidebarProps {
  activeTab: 'dashboard' | 'contracts' | 'verify' | 'vendors' | 'simulate' | 'spk' | 'termin' | 'audit' | 'reports' | 'settings' | 'help'
  onSelectTab: (tab: 'dashboard' | 'contracts' | 'verify' | 'vendors' | 'simulate' | 'spk' | 'termin' | 'audit' | 'reports' | 'settings' | 'help') => void
  userRole?: 'kades' | 'bpd' | 'inspektorat'
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  activeTab,
  onSelectTab,
  userRole = 'kades',
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [financesOpen, setFinancesOpen] = useState(true)

  const getRoleHeader = () => {
    switch (userRole) {
      case 'bpd':
        return {
          title: 'BPD Pengawas',
          subtitle: 'Desa Sukamaju',
          groupTitle: 'Pengawasan APBDes',
        }
      case 'inspektorat':
        return {
          title: 'Auditor APIP',
          subtitle: 'Wilayah Kab. Banyumas',
          groupTitle: 'Audit & Penindakan APIP',
        }
      default:
        return {
          title: 'Kepala Desa (KPA)',
          subtitle: 'Desa Sukamaju',
          groupTitle: 'Keuangan & APBDes',
        }
    }
  }

  const roleMeta = getRoleHeader()

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top-section">
        <div className="sidebar-brand-row">
          <Link href="/" className="sidebar-brand" aria-label="SAKSI, ke beranda">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--dash-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo-saksi.png"
                alt="Logo SAKSI"
                width={26}
                height={26}
                priority
                style={{
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label="Toggle Sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        <div
          style={{
            margin: '4px 0 16px 0',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFA',
            border: '1px solid #EBEAEF',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#3560D9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {roleMeta.title}
          </div>
          <div style={{ fontSize: '12px', color: '#6B6C6F', marginTop: '2px' }}>
            {roleMeta.subtitle}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'dashboard' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <span>
                {userRole === 'inspektorat' ? 'Dashboard Audit' : userRole === 'bpd' ? 'Pengawasan BPD' : 'Dashboard'}
              </span>
            </div>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'contracts' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('contracts')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <span>
                {userRole === 'inspektorat' ? 'Audit Kontrak (33 Desa)' : userRole === 'bpd' ? 'Kontrak Diawasi' : 'Kontrak Aktif'}
              </span>
            </div>
            <span className="sidebar-badge">{userRole === 'inspektorat' ? '142' : '46'}</span>
          </button>

          {userRole === 'bpd' && (
            <button
              type="button"
              className={`sidebar-item ${activeTab === 'reports' ? 'is-active' : ''}`}
              onClick={() => onSelectTab('reports')}
            >
              <div className="sidebar-item-left">
                <span className="sidebar-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span>Laporan Warga</span>
              </div>
              <span className="sidebar-badge" style={{ backgroundColor: '#FFF4EB', color: '#F38D43' }}>3 Baru</span>
            </button>
          )}

          {userRole === 'kades' && (
            <button
              type="button"
              className={`sidebar-item ${activeTab === 'simulate' ? 'is-active' : ''}`}
              onClick={() => onSelectTab('simulate')}
            >
              <div className="sidebar-item-left">
                <span className="sidebar-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span>Simulasi Draf</span>
              </div>
              <span className="sidebar-badge" style={{ backgroundColor: '#EEF3FD', color: '#3560D9' }}>5 Tahap</span>
            </button>
          )}

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'verify' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('verify')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span>{userRole === 'inspektorat' ? 'Verifikasi Forensik' : 'Verifikasi Segel'}</span>
            </div>
          </button>

          <button
            type="button"
            className={`sidebar-item ${activeTab === 'vendors' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('vendors')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>{userRole === 'inspektorat' ? 'Analisis Rekanan' : 'Rekanan Desa'}</span>
            </div>
          </button>

          <div className="sidebar-group">
            <div
              className="sidebar-group-header"
              onClick={() => setFinancesOpen(!financesOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="6" y1="8" x2="6" y2="8.01" />
                  <line x1="10" y1="8" x2="18" y2="8" />
                  <line x1="6" y1="12" x2="6" y2="12.01" />
                  <line x1="10" y1="12" x2="18" y2="12" />
                </svg>
                <span>{roleMeta.groupTitle}</span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: financesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {financesOpen && (
              <div className="sidebar-sub-list">
                <button
                  type="button"
                  className={`sidebar-sub-item ${activeTab === 'spk' ? 'is-active' : ''}`}
                  onClick={() => onSelectTab('spk')}
                >
                  {userRole === 'inspektorat' ? 'Uji Petik Dokumen SPK' : 'Surat Perintah Kerja (SPK)'}
                </button>
                <button
                  type="button"
                  className={`sidebar-sub-item ${activeTab === 'termin' ? 'is-active' : ''}`}
                  onClick={() => onSelectTab('termin')}
                >
                  {userRole === 'inspektorat' ? 'Realisasi Termin APBDes' : userRole === 'bpd' ? 'Pantau Termin APBDes' : 'Pencairan Termin APBDes'}
                </button>
                <button
                  type="button"
                  className={`sidebar-sub-item ${activeTab === 'audit' ? 'is-active' : ''}`}
                  onClick={() => onSelectTab('audit')}
                >
                  {userRole === 'inspektorat' ? 'Laporan Hasil Pemeriksaan (LHP)' : 'Laporan Hasil Audit'}
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="sidebar-bottom-section">
        <div className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'settings' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('settings')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              <span>Pengaturan</span>
            </div>
          </button>
          <button
            type="button"
            className={`sidebar-item ${activeTab === 'help' ? 'is-active' : ''}`}
            onClick={() => onSelectTab('help')}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <span>Bantuan & Panduan</span>
            </div>
          </button>
          <Link href="/" className="sidebar-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>Beranda</span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  )
}
