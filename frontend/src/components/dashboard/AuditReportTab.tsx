'use client'

import React from 'react'
import { AuditFinding } from '@/types/dashboard'
import { AUDIT_FINDINGS } from '@/data/dashboard'

export interface AuditReportTabProps {
  userRole?: 'kades' | 'bpd' | 'inspektorat'
}

export function AuditReportTab({ userRole = 'inspektorat' }: AuditReportTabProps) {
  const getRiskBadge = (level: AuditFinding['riskLevel']) => {
    switch (level) {
      case 'high':
        return { text: 'Risiko Tinggi', color: '#d92550', bg: '#FDE8EE' }
      case 'medium':
        return { text: 'Risiko Sedang', color: '#F38D43', bg: '#FFF4EB' }
      default:
        return { text: 'Risiko Rendah', color: '#178a48', bg: '#E3F8EB' }
    }
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Laporan Hasil Audit & Pengawasan (LHA / LHP)</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Hasil uji kepatuhan kontrak APBDes oleh BPD dan Auditor APIP Inspektorat Daerah.
          </p>
        </div>
        {userRole === 'inspektorat' && (
          <button
            type="button"
            className="btn-export"
            onClick={() => alert('Terbitkan Rekomendasi Audit Resmi LHP: Dokumen disahkan dengan TTE Bersertifikat BSrE.')}
          >
            + Terbitkan LHP Resmi
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0' }}>
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFA', border: '1px solid #EBEAEF' }}>
          <span style={{ fontSize: '12px', color: '#6B6C6F' }}>Indeks Kepatuhan Regulasi</span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#3560D9', marginTop: '4px' }}>94,8%</div>
          <span style={{ fontSize: '11px', color: '#178a48' }}>+5,6% vs standar kab</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFA', border: '1px solid #EBEAEF' }}>
          <span style={{ fontSize: '12px', color: '#6B6C6F' }}>Total Temuan Aktif</span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F38D43', marginTop: '4px' }}>3 Temuan</div>
          <span style={{ fontSize: '11px', color: '#6B6C6F' }}>1 perlu tindak lanjut cepat</span>
        </div>
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFA', border: '1px solid #EBEAEF' }}>
          <span style={{ fontSize: '12px', color: '#6B6C6F' }}>Status Penyelesaian</span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#178a48', marginTop: '4px' }}>88,0%</div>
          <span style={{ fontSize: '11px', color: '#178a48' }}>Tindak lanjut tuntas</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#121318', marginBottom: '4px' }}>
          Daftar Catatan Temuan & Rekomendasi
        </h4>
        {AUDIT_FINDINGS.map((f) => {
          const badge = getRiskBadge(f.riskLevel)
          return (
            <div
              key={f.id}
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
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#121318' }}>{f.findingNumber}</span>
                  <span style={{ fontSize: '12px', color: '#6B6C6F' }}>({f.contractNumber})</span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: badge.color,
                    backgroundColor: badge.bg,
                  }}
                >
                  {badge.text}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#121318' }}><strong>Temuan:</strong> {f.issue}</p>
              <p style={{ fontSize: '12.5px', color: '#3560D9' }}><strong>Rekomendasi APIP:</strong> {f.recommendation}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

