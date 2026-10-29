'use client'

import React from 'react'
import { ContractItem } from '@/types/dashboard'
import { CONTRACT_ITEMS } from '@/data/dashboard'

export interface ContractsTableCardProps {
  contracts?: ContractItem[]
  title?: string
}

export function ContractsTableCard({ contracts = CONTRACT_ITEMS, title = 'Kontrak Berjalan Prioritas' }: ContractsTableCardProps) {
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
        </svg>
      )
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#537DFD" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      </svg>
    )
  }

  const getStatusBadge = (status: ContractItem['status']) => {
    switch (status) {
      case 'sealed':
        return { text: 'Tersegel SHA-256', color: '#178a48', bg: '#E3F8EB' }
      case 'audit_complete':
        return { text: 'Audit Lengkap', color: '#3560D9', bg: '#EEF3FD' }
      case 'under_review':
        return { text: 'Tinjauan BPD', color: '#F38D43', bg: '#FFF4EB' }
      default:
        return { text: 'Draf Kontrak', color: '#6B6C6F', bg: '#F1F1F5' }
    }
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <h3 className="card-title">{title}</h3>
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
              <th style={{ width: '90px' }}>ID KONTRAK</th>
              <th>NAMA KONTRAK & REKANAN</th>
              <th>STATUS</th>
              <th>NILAI APBDES</th>
              <th className="align-right">INTEGRITAS</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((item) => {
              const badge = getStatusBadge(item.status)
              return (
                <tr key={item.contractId}>
                  <td>
                    <span className="col-id-text">{item.contractId}</span>
                  </td>
                  <td>
                    <div className="col-contract-name">
                      <div className="contract-icon-box">{getThumbnailIcon(item.title)}</div>
                      <div className="contract-title-wrap">
                        <span className="contract-title-text" title={item.title}>
                          {item.title}
                        </span>
                        <span className="contract-vendor-text">{item.vendorName} • {item.volume}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: badge.color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#121318',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="col-revenue-text">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Rp {item.amount.toLocaleString('id-ID')}</span>
                    </span>
                  </td>
                  <td className="align-right">
                    <span className="col-rating-pill">
                      <span className="col-rating-star">★</span>
                      <span>({item.rating.toFixed(1)})</span>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
