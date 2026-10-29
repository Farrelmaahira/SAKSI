'use client'

import React from 'react'
import Simulator from '@/components/organisms/Simulator'
import '@/styles/sim.css'

export function SimulateTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dash-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-title">Simulasi Draf Kontrak Digital SAKSI</h3>
            <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
              Praktek mandiri penyusunan 5 langkah: Pilih jenis kontrak, susun pasal dengan AI, tanda tangan & e-meterai, segel hash, hingga publikasi warga.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Simulator />
        </div>
      </div>
    </div>
  )
}

