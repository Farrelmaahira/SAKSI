'use client'

import React, { useState } from 'react'
import { TerminItem } from '@/types/dashboard'
import { TERMIN_ITEMS } from '@/data/dashboard'

export interface TerminTabProps {
  userRole?: 'kades' | 'bpd' | 'inspektorat'
}

export function TerminTab({ userRole = 'kades' }: TerminTabProps) {
  const [items, setItems] = useState<TerminItem[]>(TERMIN_ITEMS)

  const handleApprove = (index: number) => {
    const updated = [...items]
    updated[index].status = 'disbursed'
    updated[index].sp2dNumber = `SP2D-33.02.14-00${Math.floor(200 + Math.random() * 800)}`
    updated[index].disbursementDate = 'Hari ini'
    setItems(updated)
    alert('Termin berhasil disetujui dan dicairkan ke rekening penyedia via CMS Bank Jateng.')
  }

  const getStatusBadge = (status: TerminItem['status']) => {
    switch (status) {
      case 'disbursed':
        return { text: 'Telah Dicairkan', color: '#178a48', bg: '#E3F8EB' }
      case 'verified':
        return { text: 'Verifikasi Fisik Lolos', color: '#3560D9', bg: '#EEF3FD' }
      default:
        return { text: 'Menunggu Persyaratan', color: '#6B6C6F', bg: '#F1F1F5' }
    }
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Pencairan Termin Anggaran APBDes</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Tahapan pencairan dana desa berbasis verifikasi progres fisik dan berita acara serah terima.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {items.map((t, idx) => {
          const badge = getStatusBadge(t.status)
          return (
            <div
              key={t.terminNumber}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #EBEAEF',
                backgroundColor: '#FAFAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#EEF3FD',
                      color: '#3560D9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    T{t.terminNumber}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#121318' }}>{t.label}</h4>
                    <span style={{ fontSize: '12px', color: '#6B6C6F' }}>
                      Porsi Anggaran: {t.percentage}% • Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: badge.color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#121318' }}>
                      {badge.text}
                    </span>
                  </div>
                  {userRole === 'kades' && t.status === 'verified' && (
                    <button
                      type="button"
                      className="btn-export"
                      style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                      onClick={() => handleApprove(idx)}
                    >
                      Setujui Pencairan (KPA)
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#6B6C6F', marginBottom: '6px' }}>
                  <span>Progres Fisik Lapangan</span>
                  <strong>{t.physicalProgress}%</strong>
                </div>
                <div style={{ height: '6px', backgroundColor: '#EBEAEF', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${t.physicalProgress}%`,
                      backgroundColor: t.physicalProgress >= 70 ? '#178a48' : '#3560D9',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#6B6C6F', lineHeight: 1.5, borderTop: '1px solid #ECECF0', paddingTop: '10px' }}>
                <p>{t.notes}</p>
                {t.sp2dNumber && (
                  <p style={{ marginTop: '4px', color: '#121318', fontWeight: 500 }}>
                    Nomor SP2D: <code style={{ backgroundColor: '#ECECF0', padding: '2px 6px', borderRadius: '4px' }}>{t.sp2dNumber}</code> • Dicairkan: {t.disbursementDate}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

