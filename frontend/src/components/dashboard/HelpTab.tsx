'use client'

import React from 'react'

export function HelpTab() {
  const guideSteps = [
    {
      num: '01',
      title: 'Pilih Jenis Kontrak & Rekanan',
      desc: 'Tentukan model perjanjian (Pengadaan, Hibah, Kerja Sama BUMDes, atau Sewa Aset) sesuai RKPDes dan APBDes tahun berjalan.',
    },
    {
      num: '02',
      title: 'Penyusunan & Audit Pasal Otomatis',
      desc: 'AI SAKSI memindai klausul wajib (spesifikasi teknis, termin pembayaran, denda keterlambatan 1/1000 per hari, dan garansi pemeliharaan).',
    },
    {
      num: '03',
      title: 'Penandatanganan Digital & E-Meterai',
      desc: 'Pengesahan bersama oleh Kepala Desa (selaku KPA) dan Direktur Rekanan menggunakan tanda tangan digital bersertifikasi BSrE.',
    },
    {
      num: '04',
      title: 'Segel Kriptografi Hash SHA-256',
      desc: 'Dokumen dikunci secara matematis. Setiap perubahan teks atau angka sekecil apa pun akan membatalkan validitas segel integritas.',
    },
    {
      num: '05',
      title: 'Publikasi & Pengawasan Terbuka',
      desc: 'Ringkasan kontrak dibuka ke portal publik warga dan BPD untuk mencegah markup serta memudahkan audit APIP Inspektorat Daerah.',
    },
  ]

  const regulations = [
    { code: 'Permendagri No. 20/2018', label: 'Pengelolaan Keuangan Desa dan Prosedur SPK' },
    { code: 'Perka LKPP No. 12/2019', label: 'Pedoman Tata Cara Pengadaan Barang/Jasa di Desa' },
    { code: 'UU No. 6/2014', label: 'Kewenangan Desa dan Partisipasi Pengawasan Masyarakat' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dash-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-title">Pusat Bantuan & Panduan Sistem SAKSI</h3>
            <p style={{ fontSize: '13px', color: 'var(--dash-text-secondary)', marginTop: '4px' }}>
              Panduan operasional penyusunan draf kontrak, audit kepatuhan, dan integrasi pengawasan APBDes.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: '12px' }}>
            Alur 5 Langkah Pengawasan Kontrak Desa
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {guideSteps.map((s) => (
              <div
                key={s.num}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--dash-border-subtle)',
                  backgroundColor: 'var(--dash-bg-page)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--dash-accent)',
                    fontFamily: 'monospace',
                  }}
                >
                  {s.num}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                  {s.title}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--dash-text-secondary)', lineHeight: 1.45 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '28px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: '12px' }}>
            Landasan Hukum & Standar Regulasi
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {regulations.map((r) => (
              <div
                key={r.code}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--dash-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--dash-bg-surface)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--dash-accent)',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                    {r.code}
                  </span>
                  <span style={{ fontSize: '12.5px', color: 'var(--dash-text-secondary)' }}>
                    — {r.label}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Berlaku Sah</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '28px',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--dash-accent-soft)',
            border: '1px solid var(--dash-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--dash-accent)' }}>
              Butuh Pendampingan Teknis atau Klarifikasi APIP?
            </div>
            <div style={{ fontSize: '12px', color: 'var(--dash-text-secondary)', marginTop: '2px' }}>
              Layanan konsultasi online Inspektorat Daerah dan Tim Verifikator SAKSI Kabupaten.
            </div>
          </div>
          <button
            type="button"
            className="btn-export"
            onClick={() => alert('Menghubungkan ke Tim Pendamping Desa & APIP Inspektorat Daerah...')}
            style={{ width: 'fit-content', padding: '0 18px', fontSize: '12.5px' }}
          >
            Hubungi Helpdesk
          </button>
        </div>
      </div>
    </div>
  )
}
