'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const [financesOpen, setFinancesOpen] = useState(true)

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top-section">
        {/* Brand row */}
        <div className="sidebar-brand-row">
          <Link href="/" className="sidebar-brand">
            <svg
              className="sidebar-logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="SAKSI Logo"
            >
              <rect width="24" height="24" rx="7" fill="#3560D9" />
              <path
                d="M7 12.5L10.5 16L17 8.5"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sidebar-brand-name">SAKSI</span>
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

        {/* Main Nav */}
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-item is-active">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <span>Dashboard</span>
            </div>
          </Link>

          <Link href="/dashboard#kontrak" className="sidebar-item">
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
              <span>Kontrak Aktif</span>
            </div>
            <span className="sidebar-badge">46</span>
          </Link>

          <Link href="/lacak" className="sidebar-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span>Verifikasi Segel</span>
            </div>
          </Link>

          <Link href="/dashboard#rekanan" className="sidebar-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>Rekanan Desa</span>
            </div>
          </Link>

          <Link href="/simulasi" className="sidebar-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <span>Simulasi Draf</span>
            </div>
          </Link>

          <Link href="/" className="sidebar-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span>Portal Publik</span>
            </div>
          </Link>

          {/* Finances Group */}
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
                  <line x1="6" y1="16" x2="6" y2="16.01" />
                  <line x1="10" y1="16" x2="18" y2="16" />
                </svg>
                <span>Keuangan Desa</span>
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
                <button type="button" className="sidebar-sub-item">
                  Surat Perintah Kerja (SPK)
                </button>
                <button type="button" className="sidebar-sub-item">
                  Pencairan Termin APBDes
                </button>
                <button type="button" className="sidebar-sub-item">
                  Laporan Hasil Audit
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom section: Settings & Upgrade card */}
      <div className="sidebar-bottom-section">
        <div className="sidebar-nav" style={{ marginBottom: '8px' }}>
          <button type="button" className="sidebar-item">
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
          <button type="button" className="sidebar-item">
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
        </div>

        {/* Upgrade / Integritas Card */}
        <div className="sidebar-upgrade-card">
          <div className="upgrade-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h4>Integritas Premium!</h4>
          <p>Tingkatkan proteksi enkripsi SHA-256 dan AI audit otomatis tanpa batas.</p>
          <button type="button" className="upgrade-action-btn">
            Tingkatkan Proteksi
          </button>
        </div>
      </div>
    </aside>
  )
}

