'use client'

import React, { useState, useEffect, useRef } from 'react'
import { UserProfile } from '@/types/dashboard'
import { DEMO_PROFILES } from '@/data/dashboard'

export interface SystemNotification {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
  category: 'spk' | 'review' | 'security'
}

export interface TopbarProps {
  currentUser: UserProfile
  onRoleChange: (role: 'kades' | 'bpd' | 'inspektorat') => void
  searchQuery?: string
  onSearchChange?: (val: string) => void
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Validasi SPK Baru',
    desc: 'SPK Pembangunan Jalan Dusun Krajan (#SPK/33.02.14/083009) siap diverifikasi Kades.',
    time: '5 menit lalu',
    read: false,
    category: 'spk',
  },
  {
    id: 'notif-2',
    title: 'Verifikasi Fisik BPD Sukamaju',
    desc: 'Hasil inspeksi lapangan termin II tercatat memenuhi standar spesifikasi beton 15 cm.',
    time: '42 menit lalu',
    read: false,
    category: 'review',
  },
  {
    id: 'notif-3',
    title: 'Segel Integritas SHA-256 Sesuai',
    desc: '46 kontrak aktif desa terverifikasi valid tanpa anomali kriptografi.',
    time: '2 jam lalu',
    read: false,
    category: 'security',
  },
]

export function Topbar({ currentUser, onRoleChange, searchQuery = '', onSearchChange }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const topbarRef = useRef<HTMLDivElement>(null)
  const roles: Array<'kades' | 'bpd' | 'inspektorat'> = ['kades', 'bpd', 'inspektorat']

  // Load and apply initial theme
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('saksi-theme') as 'light' | 'dark' | null
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const active = savedTheme || (prefersDark ? 'dark' : 'light')
      setTheme(active)
      document.documentElement.setAttribute('data-theme', active)
      document.documentElement.classList.toggle('dark', active === 'dark')
    } catch {
      // Fallback if localStorage or window is restricted
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topbarRef.current && !topbarRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    try {
      localStorage.setItem('saksi-theme', nextTheme)
    } catch {
      // ignore storage error
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  return (
    <header className="dashboard-topbar" ref={topbarRef}>
      <div className="topbar-search-wrap">
        <svg
          className="topbar-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Cari kontrak, rekanan, atau NIP..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        <span className="topbar-shortcut-badge">⌘K</span>
      </div>

      <div className="topbar-actions">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          className="topbar-circle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* Notifications Button & Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-circle-btn"
            onClick={() => {
              setNotifOpen(!notifOpen)
              setDropdownOpen(false)
            }}
            aria-label="Notifikasi Pengawasan"
            title="Notifikasi Pengawasan APBDes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="topbar-notif-dot" />}
          </button>

          {notifOpen && (
            <div
              className="topbar-dropdown-panel"
              style={{
                position: 'absolute',
                top: '100%',
                right: '-30px',
                marginTop: '10px',
                background: 'var(--dash-bg-surface)',
                border: '1px solid var(--dash-border-subtle)',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(18, 19, 24, 0.16)',
                width: '330px',
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--dash-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--dash-text-primary)' }}>
                    Notifikasi
                  </span>
                  {unreadCount > 0 ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'var(--dash-accent-soft)',
                        color: 'var(--dash-accent)',
                        padding: '2px 7px',
                        borderRadius: '999px',
                      }}
                    >
                      {unreadCount} baru
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--dash-text-muted)' }}>Semua dibaca</span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--dash-accent)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markSingleAsRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--dash-border-subtle)',
                      display: 'flex',
                      gap: '10px',
                      cursor: 'pointer',
                      backgroundColor: n.read ? 'transparent' : 'rgba(53, 96, 217, 0.05)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: n.read ? 'transparent' : 'var(--dash-accent)',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: n.read ? 500 : 600,
                          color: 'var(--dash-text-primary)',
                          lineHeight: 1.35,
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--dash-text-secondary)',
                          marginTop: '3px',
                          lineHeight: 1.4,
                        }}
                      >
                        {n.desc}
                      </div>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: 'var(--dash-text-muted)',
                          marginTop: '4px',
                        }}
                      >
                        {n.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '10px 16px',
                  textAlign: 'center',
                  background: 'var(--dash-bg-page)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  color: 'var(--dash-text-muted)',
                }}
              >
                Pusat Pengawasan Digital SAKSI
              </div>
            </div>
          )}
        </div>

        {/* Role Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-role-selector"
            onClick={() => {
              setDropdownOpen(!dropdownOpen)
              setNotifOpen(false)
            }}
            aria-label="Ganti Akun Verifikator"
          >
            <div
              className="role-avatar"
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--dash-accent)',
                backgroundColor: 'var(--dash-accent-soft)',
                border: '1px solid var(--dash-border-subtle)',
              }}
            >
              {currentUser.avatarInitial}
            </div>
            <div className="role-text-wrap">
              <span className="role-name">{currentUser.name}</span>
              <span className="role-tag">{currentUser.roleLabel}</span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                marginLeft: '4px',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="topbar-dropdown-panel"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'var(--dash-bg-surface)',
                border: '1px solid var(--dash-border-subtle)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(18, 19, 24, 0.12)',
                padding: '8px',
                minWidth: '230px',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--dash-text-muted)',
                  padding: '6px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Ganti Peran Pengguna
              </div>
              {roles.map((r) => {
                const u = DEMO_PROFILES[r]
                const isActive = currentUser.role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRoleChange(r)
                      setDropdownOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'var(--dash-accent-soft)' : 'none',
                      color: isActive ? 'var(--dash-accent)' : 'var(--dash-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? 'var(--dash-accent)' : 'var(--dash-border-subtle)',
                        color: isActive ? '#FFFFFF' : 'var(--dash-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {u.avatarInitial}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{u.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--dash-text-secondary)' }}>{u.roleLabel}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
