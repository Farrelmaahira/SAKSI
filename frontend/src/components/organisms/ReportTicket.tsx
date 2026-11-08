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
    <div className="bg-soft rounded-[2rem] p-24 md:p-40 [animation:pop_0.4s_ease-out]">
      <p className="text-blue text-[1.3rem] uppercase">Laporan diterima</p>
      <p className="font-code text-[3.6rem] tracking-[-0.02em] mt-8">{ticket.id}</p>
      <p className="text-[1.7rem] leading-[1.5] mt-16 mx-0 mb-30 max-w-560 [&_strong]:font-[500]">
        Simpan nomor ini untuk memantau laporan Anda. Laporan merujuk pasal <strong>{ticket.clause}</strong> pada kontrak {code}.
      </p>
      <ol className="grid gap-16 list-none list-outside mb-24 [&_li]:items-center [&_li]:flex [&_li]:gap-14 [&_li]:opacity-[0.5] [&_strong]:block [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65] ticket-steps">
        {reportStatuses.map((s, i) => (
          <li key={s} className={i <= ticket.status ? '[.strength-bar_span&]:bg-blue [.status-steps_li&]:bg-blue [.status-steps_li&]:border-blue [.status-steps_li&]:text-white [.status-steps_li&]:opacity-[1] [.ticket-steps_li&]:opacity-[1] on' : ''}>
            <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex flex-none h-28 justify-center w-28 [.ticket-steps_li.on_&]:bg-blue [.ticket-steps_li.on_&]:border-blue [.ticket-steps_li.on_&]:text-white">{i <= ticket.status && <Check />}</span>
            <span>
              <strong>{s}</strong>
              <small>{ticketStepNotes[i]}</small>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-[1.4rem] leading-[1.5] opacity-[0.7]">Ini data contoh. Laporan hanya tersimpan di peramban Anda.</p>
      <div className="items-center flex flex-wrap gap-20 justify-between mt-30">
        <PillButton tone="blue" onClick={() => onOpen(code)}>
          Lihat di kontrak
        </PillButton>
        <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onRestart}>
          Buat laporan lain
        </button>
      </div>
    </div>
  )
}
