'use client'

import React from 'react'

interface DayData {
  label: string
  shortDay: string
  height: number
  value?: number
  isPeak?: boolean
}

export function ActivityBarCard() {
  const days: DayData[] = [
    { label: 'Minggu', shortDay: 'Min', height: 42 },
    { label: 'Senin', shortDay: 'Sen', height: 75 },
    { label: 'Selasa', shortDay: 'Sel', height: 118, value: 8162, isPeak: true },
    { label: 'Rabu', shortDay: 'Rab', height: 65 },
    { label: 'Kamis', shortDay: 'Kam', height: 88 },
    { label: 'Jumat', shortDay: 'Jum', height: 96 },
    { label: 'Sabtu', shortDay: 'Sab', height: 50 },
  ]

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <h3 className="card-title">Aktivitas Audit Mingguan</h3>
        <button type="button" className="card-kebab-btn" aria-label="Menu Opsi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div className="days-chart-wrap">
        {days.map((d) => (
          <div key={d.shortDay} className={`day-bar-col ${d.isPeak ? 'is-peak' : ''}`}>
            {d.value && <span className="day-bar-val-badge">{d.value.toLocaleString('id-ID')}</span>}
            <div
              className="day-bar-pill"
              style={{ height: `${d.height}px` }}
            />
            <span className="day-bar-label">{d.shortDay}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

