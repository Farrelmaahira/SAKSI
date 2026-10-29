'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types/dashboard'
import { DEMO_USERS } from '@/data/dashboard'
import '@/styles/login.css'
import '@/styles/dashboard.css'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setStatusMessage('Silakan lengkapi username dan kata sandi Anda.')
      return
    }
    setStatusMessage('Memproses verifikasi akun ke sistem SAKSI...')
    setTimeout(() => {
      // Route based on username match or default to kades
      let matchedRole: UserRole = 'kades'
      if (username.includes('bpd')) matchedRole = 'bpd'
      else if (username.includes('inspektorat')) matchedRole = 'inspektorat'
      router.push(`/dashboard?role=${matchedRole}`)
    }, 400)
  }

  const handleQuickLogin = (role: UserRole) => {
    const user = DEMO_USERS[role]
    setUsername(user.nip)
    setPassword('••••••••••••')
    setStatusMessage(`Masuk sebagai ${user.roleLabel}...`)
    setTimeout(() => {
      router.push(`/dashboard?role=${role}`)
    }, 450)
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Visual desa SAKSI">
        <Image
          src="/images/hero-village-2400.jpg"
          alt="Pemandangan Desa di Indonesia"
          fill
          priority
          className="login-visual-bg"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="login-visual-overlay" />

        <div className="login-visual-top">
          <Link href="/" className="login-visual-brand" aria-label="SAKSI, ke beranda">
            <Image
              src="/logo-saksi.png"
              alt="Logo SAKSI"
              width={64}
              height={64}
              priority
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span>SAKSI</span>
          </Link>
        </div>

        <div className="login-visual-bottom">
          <div className="login-quote">
            <p>Setiap rupiah dana desa punya saksi.</p>
            <cite>Sistem Audit Kontrak Segel Integritas</cite>
          </div>
        </div>
      </section>

      <section className="login-form-pane">
        <div className="login-card">
          <div className="login-card-nav">
            <Link href="/" className="login-back-link">
              <span aria-hidden="true">←</span>
              <span>Beranda</span>
            </Link>
          </div>

          <header className="login-header">
            <p className="login-kicker">Portal Perangkat Desa</p>
            <h1>Masuk ke SAKSI</h1>
            <p>Akses akun verifikator Anda untuk mengelola kontrak digital dan pengawasan integritas desa.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit}>
            {statusMessage && (
              <div className="login-status-notice">
                {statusMessage}
              </div>
            )}

            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username / NIP Desa
              </label>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Contoh: kades.sukamaju atau 1985..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Masukkan kata sandi akun Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-row-between">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ingat saya</span>
              </label>
              <Link href="/lacak" className="login-forgot">
                Lupa kata sandi?
              </Link>
            </div>

            <button type="submit" className="login-submit-btn">
              Masuk ke Sistem →
            </button>
          </form>

          {/* Quick-Fill Demo Cards */}
          <div className="demo-quick-section">
            <div className="demo-quick-title">Coba Cepat Akun Demo</div>
            <div className="demo-roles-grid">
              <button
                type="button"
                className="demo-role-pill-btn"
                onClick={() => handleQuickLogin('kades')}
              >
                <span className="demo-role-emoji">👨‍💼</span>
                <span className="demo-role-btn-name">Kepala Desa</span>
                <span className="demo-role-btn-nip">kades.sukamaju</span>
              </button>

              <button
                type="button"
                className="demo-role-pill-btn"
                onClick={() => handleQuickLogin('bpd')}
              >
                <span className="demo-role-emoji">🛡️</span>
                <span className="demo-role-btn-name">BPD Pengawas</span>
                <span className="demo-role-btn-nip">bpd.pengawas</span>
              </button>

              <button
                type="button"
                className="demo-role-pill-btn"
                onClick={() => handleQuickLogin('inspektorat')}
              >
                <span className="demo-role-emoji">📋</span>
                <span className="demo-role-btn-name">Inspektorat</span>
                <span className="demo-role-btn-nip">inspektorat.audit</span>
              </button>
            </div>
          </div>

          <p className="login-footer-text" style={{ marginTop: '20px' }}>
            Belum memiliki akun perangkat desa? Hubungi <Link href="/#cakupan">Sekretariat Desa</Link> atau Admin BPD setempat.
          </p>
        </div>
      </section>
    </main>
  )
}
