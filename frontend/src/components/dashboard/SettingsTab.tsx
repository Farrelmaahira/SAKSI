'use client'

import React, { useState } from 'react'
import { UserProfile } from '@/types/dashboard'

export interface SettingsTabProps {
  currentUser: UserProfile
  onSave?: () => void
}

export function SettingsTab({ currentUser, onSave }: SettingsTabProps) {
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [nip, setNip] = useState(currentUser.nip)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    onSave?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dash-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-title">Pengaturan Profil & Kredensial Instansi</h3>
            <p style={{ fontSize: '13px', color: 'var(--dash-text-secondary)', marginTop: '4px' }}>
              Informasi identitas verifikator desa dan sertifikasi tanda tangan digital resmi.
            </p>
          </div>
          {saved && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--dash-success)',
                backgroundColor: 'var(--dash-success-bg)',
                padding: '4px 12px',
                borderRadius: '999px',
              }}
            >
              Perubahan berhasil disimpan!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                NAMA LENGKAP & GELAR
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid var(--dash-border-subtle)',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  background: 'var(--dash-bg-surface)',
                  color: 'var(--dash-text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                NOMOR INDUK PEGAWAI (NIP) / REGISTER DESA
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid var(--dash-border-subtle)',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  background: 'var(--dash-bg-surface)',
                  color: 'var(--dash-text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                EMAIL DINAS / NOTIFIKASI AUDIT
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid var(--dash-border-subtle)',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  background: 'var(--dash-bg-surface)',
                  color: 'var(--dash-text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                INSTANSI / WILAYAH HUKUM
              </label>
              <input
                type="text"
                value={currentUser.villageName}
                disabled
                style={{
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid var(--dash-border-subtle)',
                  padding: '0 14px',
                  fontSize: '13.5px',
                  background: 'var(--dash-bg-page)',
                  color: 'var(--dash-text-muted)',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '18px',
              borderRadius: '12px',
              border: '1px solid var(--dash-border-subtle)',
              backgroundColor: 'var(--dash-bg-page)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                Sertifikat Digital BSrE & Kunci Enkripsi SHA-256
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--dash-success)',
                  backgroundColor: 'var(--dash-success-bg)',
                  padding: '3px 9px',
                  borderRadius: '999px',
                }}
              >
                Aktif & Terverifikasi
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--dash-text-secondary)', lineHeight: 1.5 }}>
              Kunci kriptografi publik digunakan untuk menyegel berkas draf kontrak dan Surat Perintah Kerja (SPK)
              agar integritas dokumen terjamin dari pemalsuan pasal dan markup anggaran.
            </p>
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '11.5px',
                color: 'var(--dash-accent)',
                wordBreak: 'break-all',
              }}
            >
              PUB-KEY: 3a9f04b2c89e1d74a055ffbc912389e02319fbbd781290aa3902fcd2e118ba90
            </code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn-export"
              style={{ width: 'fit-content', padding: '0 24px' }}
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
