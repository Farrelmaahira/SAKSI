'use client'

import React from 'react'
import { CITIZEN_REPORTS } from '@/data/dashboard'

export function CitizenReportsTab() {
  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Kanal Laporan Pengawasan & Aspirasi Warga</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Aduan masyarakat desa terkait kesesuaian fisik pengerjaan proyek APBDes di lapangan.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
        {CITIZEN_REPORTS.map((r) => (
          <div
            key={r.reportId}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #EBEAEF',
              backgroundColor: '#FAFAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.reportId}</span>
                <span style={{ fontSize: '12px', color: '#6B6C6F' }}>• {r.projectTitle}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: r.status === 'resolved' ? '#E3F8EB' : '#FFF4EB',
                  color: r.status === 'resolved' ? '#178a48' : '#F38D43',
                }}
              >
                {r.status === 'resolved' ? 'Telah Ditindaklanjuti' : 'Sedang Investigasi Lapangan'}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#121318' }}>&ldquo;{r.issueText}&rdquo;</p>
            <div style={{ fontSize: '11.5px', color: '#838489', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pelapor: {r.reporterCategory} ({r.location})</span>
              <span>Diterima: {r.submittedDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

