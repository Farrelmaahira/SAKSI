'use client'

import React from 'react'

export interface VendorItem {
  id: string
  name: string
  category: string
  contractCount: number
  totalValue: number
  rating: number
  status: 'verified' | 'certified'
}

export const VENDOR_DIRECTORY: VendorItem[] = [
  {
    id: 'vnd-01',
    name: 'PT Maju Bangun Mandiri',
    category: 'Konstruksi & Jalan Usaha Tani',
    contractCount: 8,
    totalValue: 480000000,
    rating: 5.0,
    status: 'certified',
  },
  {
    id: 'vnd-02',
    name: 'CV Tani Makmur Sejahtera',
    category: 'Bibit & Pertanian Organik',
    contractCount: 5,
    totalValue: 245000000,
    rating: 4.8,
    status: 'certified',
  },
  {
    id: 'vnd-03',
    name: 'BUMDes Tirta Sukamaju',
    category: 'Unit Usaha Air Bersih & Sanitasi',
    contractCount: 6,
    totalValue: 180000000,
    rating: 4.9,
    status: 'verified',
  },
  {
    id: 'vnd-04',
    name: 'CV Mandiri Cahaya Listrik',
    category: 'Instalasi Tenaga Surya & PJUTS',
    contractCount: 4,
    totalValue: 125000000,
    rating: 4.5,
    status: 'verified',
  },
]

export function VendorsTab() {
  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Direktori Rekanan & Vendor Desa Terverifikasi</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Rekam jejak dan integritas penyelesaian SPK penyedia barang/jasa APBDes.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {VENDOR_DIRECTORY.map((v) => (
          <div
            key={v.id}
            style={{
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid #EBEAEF',
              backgroundColor: '#FAFAFC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#E3F8EB',
                    color: '#178a48',
                  }}
                >
                  Terverifikasi
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F5B82E' }}>
                  ★ {v.rating.toFixed(1)}
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#121318' }}>{v.name}</h4>
              <p style={{ fontSize: '12px', color: '#6B6C6F' }}>{v.category}</p>
            </div>

            <div style={{ borderTop: '1px solid #EBEAEF', paddingTop: '10px', fontSize: '12px', color: '#6B6C6F', display: 'flex', justifyContent: 'space-between' }}>
              <span>{v.contractCount} Kontrak Selesai</span>
              <strong style={{ color: '#121318' }}>Rp {v.totalValue.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

