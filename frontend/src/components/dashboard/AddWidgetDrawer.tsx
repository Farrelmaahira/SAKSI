'use client'

import React from 'react'
import { WidgetOption } from '@/types/dashboard'
import { WIDGET_OPTIONS } from '@/data/dashboard'

export interface AddWidgetDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelectWidget?: (widget: WidgetOption) => void
}

export function AddWidgetDrawer({ isOpen, onClose, onSelectWidget }: AddWidgetDrawerProps) {
  const renderThumbnail = (id: string) => {
    switch (id) {
      case 'w-devices':
        return (
          <svg width="40" height="40" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#EBEAEF" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#3560D9"
              strokeWidth="4"
              strokeDasharray="50 100"
              strokeDashoffset="25"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#65D18D"
              strokeWidth="4"
              strokeDasharray="25 100"
              strokeDashoffset="-25"
            />
          </svg>
        )
      case 'w-overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '48px' }}>
            <div style={{ height: '6px', width: '28px', background: '#3560D9', borderRadius: '3px' }} />
            <div style={{ height: '4px', width: '40px', background: '#EBEAEF', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '32px', background: '#65D18D', borderRadius: '2px' }} />
          </div>
        )
      case 'w-orders':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px' }}>
            <div style={{ width: '8px', height: '16px', background: '#ECEDF2', borderRadius: '2px' }} />
            <div style={{ width: '8px', height: '28px', background: '#3560D9', borderRadius: '2px' }} />
            <div style={{ width: '8px', height: '20px', background: '#ECEDF2', borderRadius: '2px' }} />
          </div>
        )
      case 'w-trends':
        return (
          <svg width="42" height="28" viewBox="0 0 42 28" fill="none">
            <path
              d="M2 24 L14 16 L24 20 L38 4"
              stroke="#F38D43"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#537EF9" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Slide-out Sheet */}
      <aside className={`add-widget-sheet ${isOpen ? 'is-open' : ''}`}>
        <div className="sheet-header">
          <h3 className="sheet-title">Tambah Widget</h3>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Tutup Panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          {WIDGET_OPTIONS.map((widget) => (
            <div
              key={widget.id}
              className="widget-option-card"
              onClick={() => onSelectWidget?.(widget)}
            >
              <div className="widget-preview-thumb">{renderThumbnail(widget.id)}</div>
              <div className="widget-info">
                <div>
                  <h4>{widget.title}</h4>
                  <p>{widget.description}</p>
                </div>
                <div className="widget-footer-row">
                  <span className="widget-tag">{widget.tag}</span>
                  <button
                    type="button"
                    className="widget-select-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectWidget?.(widget)
                    }}
                  >
                    Pilih
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

