'use client'

import React from 'react'

export interface IntegritasGaugeProps {
  score?: number
}

export function IntegritasGaugeCard({ score = 68 }: IntegritasGaugeProps) {
  const totalSegments = 40
  const activeCount = Math.round((score / 100) * totalSegments)

  const cx = 130
  const cy = 125
  const r1 = 84
  const r2 = 104

  // Generate 40 radial segments
  const segments = Array.from({ length: totalSegments }).map((_, i) => {
    // theta from 180 deg (left) to 0 deg (right)
    const angleDeg = 180 - (i / (totalSegments - 1)) * 180
    const rad = (angleDeg * Math.PI) / 180

    const x1 = cx + r1 * Math.cos(rad)
    const y1 = cy - r1 * Math.sin(rad)
    const x2 = cx + r2 * Math.cos(rad)
    const y2 = cy - r2 * Math.sin(rad)

    const isActive = i < activeCount

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      color: isActive ? '#65D18D' : '#ECEDF2',
    }
  })

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <h3 className="card-title">Indeks Integritas Desa</h3>
        <button type="button" className="card-kebab-btn" aria-label="Menu Opsi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 260 140">
          {segments.map((seg) => (
            <line
              key={seg.id}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={seg.color}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div className="gauge-value-overlay">
          <span className="gauge-pct">{score}%</span>
          <span className="gauge-status-sub">Sesuai target standar 80%</span>
          <button type="button" className="gauge-details-btn">
            Lihat Rincian
          </button>
        </div>
      </div>
    </div>
  )
}

