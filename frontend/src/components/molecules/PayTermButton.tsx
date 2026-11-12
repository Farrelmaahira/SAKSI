'use client'

import Btn from '@/components/atoms/Btn'
import { useConfirm } from '@/hooks/use-confirm'
import type { Term } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'

interface Props {
  term: Term
  overdue: boolean
  disabled: boolean
  onPay: () => void
}

/* "Tandai dibayar", after the user confirms the amount */
export default function PayTermButton({ term, overdue, disabled, onPay }: Props) {
  const confirm = useConfirm()
  return (
    <Btn
      small
      variant={overdue ? 'primary' : 'ghost'}
      disabled={disabled}
      onClick={async () => {
        const ok = await confirm({
          title: `Tandai ${term.label.toLowerCase()} sudah dibayar?`,
          text: `Pembayaran sebesar ${formatRp(term.amount)} akan dicatat sebagai sudah dibayar dan tampil di riwayat kontrak.`,
          confirmLabel: 'Ya, sudah dibayar',
          art: 'all-checked_d3u6',
        })
        if (ok) onPay()
      }}
    >
      Tandai dibayar
    </Btn>
  )
}
