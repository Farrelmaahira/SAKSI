'use client'

import React from 'react'

interface PageHeaderProps {
  onOpenAddWidget: () => void
  onExport: () => void
}

export function PageHeader({ onOpenAddWidget, onExport }: PageHeaderProps) {
  return (
    <div className="page-header-row">
      <div className="page-title-wrap">
        <h1>Dashboard</h1>
        <p>Sistem Audit Kontrak Segel Integritas • Pemantauan Dana Desa</p>
      </div>

      <div className="page-controls-wrap">
        {/* Date range picker pill */}
        <div className="date-range-picker">
          <div className="date-segment">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>1 Jan 2025 – 1 Feb 2025</span>
          </div>
          <div className="date-divider" />
          <button type="button" className="date-period-btn">
            <span>30 Hari Terakhir</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Add widget button */}
        <button type="button" className="pill-action-btn" onClick={onOpenAddWidget}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Tambah Widget</span>
        </button>

        {/* Export button */}
        <button type="button" className="btn-export" onClick={onExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Ekspor</span>
        </button>
      </div>
    </div>
  )
}

