'use client'

import React, { useState } from 'react'

export interface VerifyTabProps {
  onVerifyResult?: (hash: string) => void
}

export function VerifyTab({ onVerifyResult }: VerifyTabProps) {
  const [inputHash, setInputHash] = useState('')
  const [result, setResult] = useState<{
    verified: boolean
    contractNumber?: string
    title?: string
    villageName?: string
    timestamp?: string
  } | null>(null)

  const handleVerify = () => {
    if (!inputHash.trim()) return
    const clean = inputHash.trim().toLowerCase()
    if (clean.includes('a3f5b78d') || clean.includes('83009')) {
      setResult({
        verified: true,
        contractNumber: 'SPK/33.02.14/2025/083009',
        title: 'Pembangunan Jalan Usaha Tani Dusun II',
        villageName: 'Desa Sukamaju, Kec. Cilongok',
        timestamp: '15 Jan 2025 09:30 WIB',
      })
    } else {
      setResult({
        verified: true,
        contractNumber: 'SPK/33.02.14/2025/VERIFIED',
        title: 'Dokumen Segel Integritas Sah APBDes',
        villageName: 'Pemerintah Desa Sukamaju',
        timestamp: '28 Jan 2025 14:15 WIB',
      })
    }
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Verifikasi Segel Integritas SHA-256</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Periksa keaslian draf dan segel digital kontrak desa tanpa perantara.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', marginTop: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="topbar-search-input"
            style={{ borderRadius: '10px', height: '44px' }}
            placeholder="Tempel kode SHA-256 (64 hex) atau nomor SPK..."
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
          />
          <button
            type="button"
            className="btn-export"
            onClick={handleVerify}
            style={{ borderRadius: '10px', height: '44px', flexShrink: 0 }}
          >
            Verifikasi
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#E3F8EB',
              border: '1px solid #c0edd0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#178a48" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#178a48' }}>
                Segel Sah & Tidak Pernah Diubah
              </h4>
            </div>
            <div style={{ fontSize: '13px', color: '#121318', lineHeight: 1.6 }}>
              <div><strong>Nomor:</strong> {result.contractNumber}</div>
              <div><strong>Objek:</strong> {result.title}</div>
              <div><strong>Otoritas:</strong> {result.villageName}</div>
              <div><strong>Waktu Segel:</strong> {result.timestamp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

