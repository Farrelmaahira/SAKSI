'use client'

import React, { useState } from 'react'
import type { UserProfile, UserRole } from '@/types/dashboard'
import { DEMO_USERS } from '@/data/dashboard'

interface TopbarProps {
  currentUser: UserProfile
  onRoleChange: (role: UserRole) => void
  searchQuery?: string
  onSearchChange?: (val: string) => void
}

export function Topbar({ currentUser, onRoleChange, searchQuery = '', onSearchChange }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const roles: UserRole[] = ['kades', 'bpd', 'inspektorat']

  return (
    <header className="dashboard-topbar">
      {/* Search Input */}
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

      {/* Topbar Actions */}
      <div className="topbar-actions">
        {/* Theme button */}
        <button type="button" className="topbar-circle-btn" aria-label="Ganti Tema">
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
        </button>

        {/* Notifications button */}
        <button type="button" className="topbar-circle-btn" aria-label="Notifikasi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="topbar-notif-dot" />
        </button>

        {/* User Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-role-selector"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Ganti Akun Verifikator"
          >
            <div className="role-avatar">{currentUser.avatar}</div>
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
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: '#ffffff',
                border: '1px solid #EBEAEF',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(18, 19, 24, 0.12)',
                padding: '8px',
                minWidth: '220px',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#838489',
                  padding: '6px 10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Ganti Peran Pengguna
              </div>
              {roles.map((r) => {
                const u = DEMO_USERS[r]
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
                      background: isActive ? '#EEF3FD' : 'none',
                      color: isActive ? '#3560D9' : '#121318',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <span>{u.avatar}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{u.name}</span>
                      <span style={{ fontSize: '11px', color: '#6B6C6F' }}>{u.roleLabel}</span>
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

