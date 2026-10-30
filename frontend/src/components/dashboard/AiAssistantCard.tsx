'use client'

import React, { useState } from 'react'

export function AiAssistantCard() {
  const [query, setQuery] = useState('')
  const [responseMsg, setResponseMsg] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)

  const handleSend = (textToSend?: string) => {
    const text = textToSend || query
    if (!text.trim()) return

    setIsThinking(true)
    setResponseMsg(null)

    setTimeout(() => {
      setIsThinking(false)
      if (text.includes('83004') || text.includes('Renovasi')) {
        setResponseMsg('Draf #SKS-83004 terverifikasi aman: 8 dari 8 klausul wajib UU Desa terpenuhi, tidak ada selisih termin.')
      } else {
        setResponseMsg('Analisis selesai: Semua klausul kontrak dana desa sinkron dengan pagu APBDes 2025.')
      }
    }, 600)
  }

  return (
    <div className="dash-card ai-assistant-card">
      <div className="card-header-row" style={{ marginBottom: '10px' }}>
        <h3 className="card-title">AI Assistant</h3>
        <button type="button" className="card-kebab-btn" aria-label="Perluas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>

      {/* 3D Breathing Sphere */}
      <div className="ai-sphere-stage">
        <div className="ai-3d-sphere" />
      </div>

      {/* AI Output preview */}
      {isThinking && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#3560D9', marginBottom: '12px', fontWeight: 500 }}>
          Menganalisis integritas klausul...
        </div>
      )}
      {responseMsg && (
        <div
          style={{
            fontSize: '12px',
            color: '#121318',
            backgroundColor: '#EEF3FD',
            border: '1px solid #ccd9fc',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '12px',
            lineHeight: 1.4,
          }}
        >
          {responseMsg}
        </div>
      )}

      {/* Suggestions Chips */}
      <div className="ai-suggestions-grid">
        <button
          type="button"
          className="ai-suggestion-chip"
          onClick={() => {
            setQuery('Audit draf #SKS-83004')
            handleSend('Audit draf #SKS-83004')
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3560D9" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span>Audit #SKS-83004</span>
        </button>

        <button
          type="button"
          className="ai-suggestion-chip"
          onClick={() => {
            setQuery('Cek selisih pagu APBDes')
            handleSend('Cek selisih pagu APBDes')
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#65D18D" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Cek pagu APBDes</span>
        </button>
      </div>

      {/* Input bar */}
      <div className="ai-input-bar">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#838489"
          strokeWidth="2"
          style={{ marginRight: '8px', cursor: 'pointer' }}
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>

        <input
          type="text"
          className="ai-input-field"
          placeholder="Tanyakan analisis kontrak desa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#838489"
          strokeWidth="2"
          style={{ marginRight: '8px', cursor: 'pointer' }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>

        <button
          type="button"
          className="ai-send-btn"
          onClick={() => handleSend()}
          aria-label="Kirim Pertanyaan AI"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

