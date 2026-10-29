import Check from '@/components/atoms/Check'
import PillButton from '@/components/atoms/PillButton'
import { ticketStepNotes } from '@/data/report-form'
import { reportStatuses } from '@/data/report-statuses'
import type { Report } from '@/interfaces/contract'

interface Props {
  ticket: Report
  code: string
  onOpen: (code: string) => void
  onRestart: () => void
}

export default function ReportTicket({ ticket, code, onOpen, onRestart }: Props) {
  return (
    <div className="report-card ticket">
      <p className="ticket-label">Laporan diterima</p>
      <p className="ticket-id">{ticket.id}</p>
      <p className="ticket-text">
        Simpan nomor ini untuk memantau laporan Anda. Laporan merujuk pasal <strong>{ticket.clause}</strong> pada kontrak {code}.
      </p>
      <ol className="ticket-steps">
        {reportStatuses.map((s, i) => (
          <li key={s} className={i <= ticket.status ? 'on' : ''}>
            <span className="ts-dot">{i <= ticket.status && <Check />}</span>
            <span>
              <strong>{s}</strong>
              <small>{ticketStepNotes[i]}</small>
            </span>
          </li>
        ))}
      </ol>
      <p className="form-note">Ini data contoh. Laporan hanya tersimpan di peramban Anda.</p>
      <div className="form-actions">
        <PillButton tone="blue" onClick={() => onOpen(code)}>
          Lihat di kontrak
        </PillButton>
        <button type="button" className="text-btn" onClick={onRestart}>
          Buat laporan lain
        </button>
      </div>
    </div>
  )
}
