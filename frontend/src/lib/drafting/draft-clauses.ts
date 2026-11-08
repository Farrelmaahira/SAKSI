import type { Answers, Clause, Ctx, TemplateKey } from '@/interfaces/drafting'
import { VAGUE_SANCTION, extra, legal, objectLegal, objectText } from '@/data/drafting'
import { formatRp } from '@/lib/contracts/format-rp'
import { fmtDate } from '@/lib/dates/fmt-date'

export function draftClauses(t: TemplateKey, a: Answers, ctx: Ctx): Clause[] {
  const payment =
    a.scheme === 'Sekaligus' || a.terms <= 1
      ? 'Pembayaran dilakukan sekaligus setelah berita acara serah terima ditandatangani.'
      : `Pembayaran dibagi menjadi ${a.terms} termin sesuai kemajuan pekerjaan yang sudah diverifikasi.`
  return [
    {
      key: 'para_pihak',
      title: 'Para Pihak',
      text: `Pemerintah ${ctx.village.name}, diwakili Kepala Desa ${ctx.head}, sebagai Pihak Pertama, dan ${ctx.party.name}, diwakili ${ctx.party.contact}, sebagai Pihak Kedua.`,
      plain: 'Siapa saja yang terikat oleh kontrak ini.',
      legal: legal.sahPerjanjian,
    },
    { key: 'objek', title: 'Objek Perjanjian', text: objectText[t](a), plain: 'Apa yang dikerjakan, diserahkan, atau disewakan.', legal: objectLegal[t] },
    {
      key: 'nilai',
      title: 'Nilai Kontrak',
      text: `Nilai kontrak sebesar ${formatRp(a.value)}${t === 'sewa' ? ' per tahun' : ''}, sudah termasuk pajak.`,
      plain: 'Berapa uang yang dibayarkan dan sudah termasuk apa saja.',
      legal: legal.keuanganDesa,
    },
    {
      key: 'jangka_waktu',
      title: 'Jangka Waktu',
      text: `Perjanjian berlaku sejak ditandatangani sampai ${fmtDate(a.deadline)}.`,
      plain: 'Sampai kapan janji ini harus dipenuhi.',
      legal: legal.kebebasan,
    },
    { key: 'pembayaran', title: 'Cara Pembayaran', text: payment, plain: 'Kapan uang dibayarkan dan dibagi berapa kali.', legal: legal.keuanganDesa },
    ...extra[t],
    { key: 'sanksi', title: 'Sanksi', text: VAGUE_SANCTION, plain: 'Apa akibatnya kalau janji tidak ditepati.', legal: legal.wanprestasi },
    {
      key: 'sengketa',
      title: 'Penyelesaian Perselisihan',
      text: 'Perselisihan diselesaikan secara musyawarah di balai desa. Bila tidak tercapai, diselesaikan melalui Pengadilan Negeri setempat.',
      plain: 'Apa yang dilakukan kalau kedua pihak tidak sepakat.',
      legal: legal.desa,
    },
  ]
}
