'use client'

import React from 'react'
import { KpiMetric } from '@/types/dashboard'

export interface KpiCardsProps {
  metrics: KpiMetric[]
}

export function KpiCards({ metrics }: KpiCardsProps) {
  const formatNumber = (num: number, prefix = '', suffix = '') => {
    const formatted = num.toLocaleString('id-ID')
    return `${prefix}${formatted}${suffix}`
  }

  const renderIcon = (type: KpiMetric['iconType']) => {
    switch (type) {
      case 'document':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )
      case 'wallet':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        )
      case 'alert':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      case 'shield':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
    }
  }

  return (
    <div className="kpi-row">
      {metrics.map((kpi) => {
        const isUp = kpi.changePercent >= 0
        const absChange = Math.abs(kpi.changePercent).toFixed(1).replace('.', ',')

        return (
          <div key={kpi.id} className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
              <div className="kpi-icon-pill">{renderIcon(kpi.iconType)}</div>
            </div>

            <div className="kpi-metric-row">
              <span className="kpi-number">
                {formatNumber(kpi.value, kpi.prefix, kpi.suffix)}
              </span>
              <span className={`kpi-chip ${isUp ? 'is-up' : 'is-down'}`}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  {isUp ? (
                    <polygon points="4,1 7,7 1,7" />
                  ) : (
                    <polygon points="4,7 7,1 1,1" />
                  )}
                </svg>
                <span>{isUp ? `+${absChange}%` : `−${absChange}%`}</span>
              </span>
            </div>

            <div className="kpi-comparison">{kpi.comparisonText}</div>
          </div>
        )
      })}
    </div>
  )
}

