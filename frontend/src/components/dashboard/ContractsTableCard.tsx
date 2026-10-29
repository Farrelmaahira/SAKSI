'use client'

import React from 'react'
import type { ContractRow } from '@/types/dashboard'
import { CONTRACT_ROWS } from '@/data/dashboard'

interface ContractsTableCardProps {
  contracts?: ContractRow[]
}

export function ContractsTableCard({ contracts = CONTRACT_ROWS }: ContractsTableCardProps) {
  // Map icons for thumbnail
  const getThumbnailIcon = (name: string) => {
    if (name.includes('Jalan') || name.includes('Renovasi')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3560D9" strokeWidth="2">
          <path d="M3 21h18M5 21V7l8-4v18M13 11l6-3v13" />
        </svg>
      )
    }
    if (name.includes('Jagung') || name.includes('Tani')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#178a48" strokeWidth="2">
          <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
          <path d="M12 2v20" />
        </svg>
      )
    }
    if (name.includes('Lampu') || name.includes('Surya')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5B82E" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        </svg>
      )
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#537DFD" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      </svg>
    )
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <h3 className="card-title">Kontrak Berjalan Prioritas</h3>
        <button type="button" className="card-kebab-btn" aria-label="Menu Opsi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="contracts-table">
          <thead>
            <tr>
              <th style={{ width: '85px' }}>ID</th>
              <th>NAMA KONTRAK & REKANAN</th>
              <th>VOLUME</th>
              <th>NILAI KONTRAK</th>
              <th className="align-right">RATING</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((item) => (
              <tr key={item.id}>
                {/* ID */}
                <td>
                  <span className="col-id-text">{item.id}</span>
                </td>

                {/* Name & Vendor */}
                <td>
                  <div className="col-contract-name">
                    <div className="contract-icon-box">{getThumbnailIcon(item.name)}</div>
                    <div className="contract-title-wrap">
                      <span className="contract-title-text" title={item.name}>
                        {item.name}
                      </span>
                      <span className="contract-vendor-text">{item.vendor}</span>
                    </div>
                  </div>
                </td>

                {/* Volume Sold */}
                <td>
                  <span className="col-sold-text">
                    {item.soldQty ? `${item.soldQty.toLocaleString('id-ID')} unit` : '–'}
                  </span>
                </td>

                {/* Amount / Nilai */}
                <td>
                  <span className="col-revenue-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Rp {item.amount.toLocaleString('id-ID')}</span>
                  </span>
                </td>

                {/* Rating */}
                <td className="align-right">
                  <span className="col-rating-pill">
                    <span className="col-rating-star">★</span>
                    <span>({item.rating.toFixed(1)})</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

