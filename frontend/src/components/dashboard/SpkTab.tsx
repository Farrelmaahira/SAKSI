'use client'

import React, { useState } from 'react'
import { SpkItem } from '@/types/dashboard'
import { SPK_ITEMS } from '@/data/dashboard'

export interface SpkTabProps {
  userRole?: 'kades' | 'bpd' | 'inspektorat'
}

export function SpkTab({ userRole = 'kades' }: SpkTabProps) {
  const [selectedSpk, setSelectedSpk] = useState<SpkItem | null>(null)

  const getStatusBadge = (status: SpkItem['status']) => {
    switch (status) {
      case 'completed':
        return { text: 'Selesai 100%', color: '#178a48', bg: '#E3F8EB' }
      case 'in_progress':
        return { text: 'Pelaksanaan Fisik', color: '#3560D9', bg: '#EEF3FD' }
      case 'issued':
        return { text: 'Diterbitkan (SPK Sah)', color: '#178a48', bg: '#E3F8EB' }
      default:
        return { text: 'Draf SPK', color: '#6B6C6F', bg: '#F1F1F5' }
    }
  }

  return (
    <div className="dash-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">Daftar Surat Perintah Kerja (SPK) APBDes</h3>
          <p style={{ fontSize: '13px', color: '#6B6C6F', marginTop: '4px' }}>
            Dokumen resmi perikatan pengadaan barang/jasa desa sesuai Permendagri No. 20/2018.
          </p>
        </div>
        {userRole === 'kades' && (
          <button
            type="button"
            className="btn-export"
            onClick={() => alert('Fitur Penerbitan SPK Baru: Siap disinkronkan dengan Draf Kontrak.')}
          >
            + Terbitkan SPK Baru
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table className="contracts-table">
          <thead>
            <tr>
              <th style={{ width: '220px' }}>NOMOR SPK</th>
              <th>PEKERJAAN & REKANAN</th>
              <th>NILAI SPK</th>
              <th>JANGKA WAKTU</th>
              <th>STATUS</th>
              <th className="align-right">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {SPK_ITEMS.map((item) => {
              const badge = getStatusBadge(item.status)
              return (
                <tr key={item.spkNumber}>
                  <td>
                    <span className="col-id-text" style={{ fontWeight: 600 }}>{item.spkNumber}</span>
                  </td>
                  <td>
                    <div className="col-contract-name">
                      <div className="contract-title-wrap">
                        <span className="contract-title-text">{item.title}</span>
                        <span className="contract-vendor-text">{item.vendorName}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="col-revenue-text">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#6B6C6F' }}>
                      {item.issuedDate} s.d. {item.dueDate}
                    </span>
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
                  <td className="align-right">
                    <button
                      type="button"
                      className="gauge-details-btn"
                      onClick={() => setSelectedSpk(item)}
                    >
                      Lihat SPK
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedSpk && (
        <div
          style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#F8FAFA',
            border: '1px solid #EBEAEF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#121318' }}>
              Rincian Lembar Surat Perintah Kerja
            </h4>
            <button
              type="button"
              className="gauge-details-btn"
              onClick={() => setSelectedSpk(null)}
            >
              Tutup
            </button>
          </div>
          <div style={{ fontSize: '13px', color: '#121318', lineHeight: 1.8 }}>
            <div><strong>Nomor Berkas:</strong> {selectedSpk.spkNumber}</div>
            <div><strong>Pihak Pertama (KPA):</strong> H. Sudirman, S.IP (Kepala Desa Sukamaju)</div>
            <div><strong>Pihak Kedua (Penyedia):</strong> {selectedSpk.vendorName}</div>
            <div><strong>Total Pagu Anggaran:</strong> Rp {selectedSpk.amount.toLocaleString('id-ID')} (Termasuk PPh & PPN)</div>
            <div><strong>Masa Pelaksanaan:</strong> {selectedSpk.issuedDate} sampai {selectedSpk.dueDate}</div>
            <div><strong>Sumber Dana:</strong> APBDes Tahun Anggaran 2025 (Bidang Pelaksanaan Pembangunan Desa)</div>
          </div>
        </div>
      )}
    </div>
  )
}

