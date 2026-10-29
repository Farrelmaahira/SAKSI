'use client'

import React, { useState } from 'react'

interface PointData {
  date: string
  current: number
  previous: number
  x: number
  y: number
  prevY: number
}

export function MainChartCard() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(2) // default on Jan 18

  // Sample weekly points
  const points: PointData[] = [
    { date: '1 Jan 2025', current: 4800, previous: 3200, x: 20, y: 125, prevY: 135 },
    { date: '8 Jan 2025', current: 7200, previous: 4100, x: 95, y: 95, prevY: 120 },
    { date: '15 Jan 2025', current: 12324, previous: 5563, x: 170, y: 48, prevY: 105 },
    { date: '22 Jan 2025', current: 9800, previous: 6400, x: 245, y: 72, prevY: 90 },
    { date: '29 Jan 2025', current: 14100, previous: 8100, x: 320, y: 32, prevY: 75 },
  ]

  // Construct smooth SVG path string
  const currentPath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
  const areaPath = `${currentPath} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`
  const prevPath = `M ${points[0].x} ${points[0].prevY} ` + points.slice(1).map((p) => `L ${p.x} ${p.prevY}`).join(' ')

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <h3 className="card-title">Total Realisasi Kontrak</h3>
        <button type="button" className="card-kebab-btn" aria-label="Menu Opsi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="profit-content-grid">
        {/* Left Stats Block */}
        <div className="profit-stat-block">
          <div className="profit-main-val">Rp 446,7 Jt</div>
          <div className="profit-growth-row">
            <span className="kpi-chip is-up">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <polygon points="4,1 7,7 1,7" />
              </svg>
              <span>+24,4%</span>
            </span>
            <span>vs. periode lalu</span>
          </div>
        </div>

        {/* Right Chart Canvas */}
        <div className="chart-container">
          <svg
            className="svg-chart"
            viewBox="0 0 340 170"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#395ED5" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#395ED5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="10" y1="30" x2="330" y2="30" stroke="#EBEAEF" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="70" x2="330" y2="70" stroke="#EBEAEF" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="110" x2="330" y2="110" stroke="#EBEAEF" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="150" x2="330" y2="150" stroke="#EBEAEF" strokeWidth="1" />

            {/* Y Axis Labels */}
            <text x="6" y="34" fontSize="9" fill="#838489">15K</text>
            <text x="6" y="74" fontSize="9" fill="#838489">10K</text>
            <text x="8" y="114" fontSize="9" fill="#838489">5K</text>
            <text x="12" y="153" fontSize="9" fill="#838489">0</text>

            {/* Filled Area */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Previous Period Line (grey dashed) */}
            <path
              d={prevPath}
              fill="none"
              stroke="#B3B5BD"
              strokeWidth="1.8"
              strokeDasharray="4 4"
            />

            {/* Current Period Line (blue solid) */}
            <path
              d={currentPath}
              fill="none"
              stroke="#395ED5"
              strokeWidth="2.4"
            />

            {/* Interactive Points */}
            {points.map((p, idx) => (
              <g key={p.date} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoverIndex(idx)}>
                {/* Invisible wide hit area */}
                <rect
                  x={p.x - 20}
                  y="0"
                  width="40"
                  height="170"
                  fill="transparent"
                />

                {/* Point dot when active */}
                {hoverIndex === idx && (
                  <>
                    <line
                      x1={p.x}
                      y1="20"
                      x2={p.x}
                      y2="150"
                      stroke="#395ED5"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={p.x} cy={p.y} r="5" fill="#395ED5" stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx={p.x} cy={p.prevY} r="4" fill="#A4A5AC" stroke="#FFFFFF" strokeWidth="2" />
                  </>
                )}
              </g>
            ))}

            {/* X Axis Labels */}
            <text x="20" y="166" fontSize="9.5" fill="#838489" textAnchor="middle">1 Jan</text>
            <text x="95" y="166" fontSize="9.5" fill="#838489" textAnchor="middle">8 Jan</text>
            <text x="170" y="166" fontSize="9.5" fill="#838489" textAnchor="middle">15 Jan</text>
            <text x="245" y="166" fontSize="9.5" fill="#838489" textAnchor="middle">22 Jan</text>
            <text x="320" y="166" fontSize="9.5" fill="#838489" textAnchor="middle">29 Jan</text>
          </svg>

          {/* Floating Tooltip */}
          {activePoint && (
            <div
              className="chart-tooltip-box"
              style={{
                left: `${(activePoint.x / 340) * 100}%`,
                top: `${(activePoint.y / 170) * 100}%`,
              }}
            >
              <div className="tooltip-date">{activePoint.date}</div>
              <div className="tooltip-val-row" style={{ color: '#3560D9' }}>
                <span className="tooltip-dot blue" />
                <span>Rp {activePoint.current.toLocaleString('id-ID')} bulan ini</span>
              </div>
              <div className="tooltip-val-row" style={{ color: '#6B6C6F', marginTop: '2px' }}>
                <span className="tooltip-dot grey" />
                <span>Rp {activePoint.previous.toLocaleString('id-ID')} bulan lalu</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-panel Alokasi Bidang Desa */}
      <div className="sub-panel-segments">
        <div className="sub-panel-head">
          <span>Bidang Kegiatan Desa</span>
          <button type="button" className="card-kebab-btn" aria-label="Menu Segmentasi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        <div className="segments-cols-3">
          <div className="segment-col">
            <div className="segment-num-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#537DFD" strokeWidth="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>2.884</span>
            </div>
            <span className="segment-label">Pengadaan Fisik</span>
            <div className="segment-bar-line retailer" />
          </div>

          <div className="segment-col">
            <div className="segment-num-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#65D18D" strokeWidth="2.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>1.432</span>
            </div>
            <span className="segment-label">Unit Usaha BUMDes</span>
            <div className="segment-bar-line distributor" />
          </div>

          <div className="segment-col">
            <div className="segment-num-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F38D43" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>562</span>
            </div>
            <span className="segment-label">Sewa & Hibah Aset</span>
            <div className="segment-bar-line wholesaler" />
          </div>
        </div>
      </div>
    </div>
  )
}

