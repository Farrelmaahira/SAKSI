'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import '@/styles/login.css'
import '@/styles/dashboard.css'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Logic extracted into custom hook
  const { statusMessage, isLoading, login, quickLogin } = useAuth('kades')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  const handleDemoClick = (role: 'kades' | 'bpd' | 'inspektorat') => {
    quickLogin(role)
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Visual desa SAKSI">
        <Image
          src="/images/desa-indonesia.webp"
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
              width={72}
              height={72}
              priority
              style={{ filter: 'brightness(0) invert(1)', width: 'auto', height: '56px' }}
            />
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
                placeholder="Contoh: 197204121998031004 atau kades.sukamaju"
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

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Quick-fill accounts with clean badges (zero emojis) */}
          <div className="demo-quick-section">
            <div className="demo-quick-title">Coba Cepat Akun Demo</div>
            <div className="demo-roles-grid">
              <button
                type="button"
                className="demo-role-pill-btn"
                onClick={() => handleDemoClick('kades')}
              >
                Kepala Desa
              </button>

              <button
                type="button"
                className="demo-role-pill-btn"
                onClick={() => handleDemoClick('bpd')}
              >
                BPD Pengawas
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

export default LoginPage
