import type { CSSProperties } from 'react'
import FolderPenIcon from '@/components/atoms/FolderPenIcon'
import type { ScopeFolderItem } from '@/interfaces/content'

export interface ScopeFolderProps {
  folder: ScopeFolderItem
  index: number
}

/* One stacked folder; ScopeFolders animates the classes inside it with GSAP. */
export default function ScopeFolder({ folder: f, index: i }: ScopeFolderProps) {
  return (
    <article className={`folder folder-${i + 1}`} style={{ '--i': i } as CSSProperties}>
      <div className="folder-sheet">
        <div className="folder-tab">
          <span>0{i + 1}</span>
          <b>{f.title}</b>
        </div>
        <div className="folder-body">
          <div className="folder-copy">
            <p className="folder-kicker">Kontrak 0{i + 1}</p>
            <h3>{f.title}</h3>
            <p>{f.note}</p>
          </div>

          <div className="doc-wrap">
            <div className="doc">
              <div className="doc-head">
                <span>{f.doc}</span>
                <span className="doc-status">
                  <em>Draf</em>
                  <em>Pasal ditambahkan</em>
                </span>
              </div>
              <p className="doc-label">Pasal 1. Para Pihak</p>
              <span className="doc-bar" style={{ width: '92%' }} />
              <span className="doc-bar" style={{ width: '74%' }} />
              <p className="doc-label">Pasal 2. Objek Perjanjian</p>
              <span className="doc-bar" style={{ width: '86%' }} />
              <span className="doc-bar" style={{ width: '58%' }} />
              <p className="doc-label strong">{f.clause}</p>
              <p className="doc-typed">
                <svg className="doodle margin-mark" viewBox="0 0 12 60" preserveAspectRatio="none" aria-hidden="true">
                  <path pathLength={1} d="M7 2c-3 8 2 14-1 22s3 15 0 24c-1 4 0 7 1 10" />
                </svg>
                <span className="typed" data-text={f.text}>
                  {f.text}
                </span>
                <i className="caret" />
              </p>
              <span className="doc-bar" style={{ width: '66%' }} />
            </div>

            <div className="ai-card">
              <p className="ai-tag">
                <FolderPenIcon />
                Rekomendasi AI
              </p>
              <p className="ai-text">{f.suggestion}</p>
              <span className="ai-apply">Terapkan</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
