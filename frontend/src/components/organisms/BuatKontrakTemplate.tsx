'use client'

import { useRouter } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { useEffect, useMemo, useState } from 'react'
import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import type { Counterparty, CounterpartyType } from '@/interfaces/master'
import { emptyAnswers } from '@/lib/dash/empty-answers'
import { auditDraft } from '@/lib/drafting/audit-draft'
import { villageById } from '@/lib/master/village-by-id'
import { methods, templates } from '@/data/drafting'
import { draftContext } from '@/lib/db/draft-context'
import { draftClauses } from '@/lib/drafting/draft-clauses'
import NotAllowed from '@/components/molecules/NotAllowed'
import { isEmail } from '@/lib/auth/is-email'
import { addCounterparty } from '@/lib/master/add-counterparty'
import { addAudit } from '@/lib/audit/add-audit'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { applyFinding } from '@/lib/drafting/apply-finding'
import { reaudit } from '@/lib/drafting/reaudit'
import { createContract } from '@/lib/db/create-contract'
import { regionRules } from '@/data/master'
import PageHead from '@/components/molecules/PageHead'
import { buatKontrakSteps } from '@/data/dash'
import Icon from '@/components/atoms/Icon'
import Panel from '@/components/molecules/Panel'
import Illustration from '@/components/atoms/Illustration'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import { formatRp } from '@/lib/contracts/format-rp'
import AuditPanel from '@/components/organisms/AuditPanel'
import { fmtDate } from '@/lib/dates/fmt-date'
import { nowIso } from '@/lib/dates/now-iso'
import { newMeteraiSerial } from '@/lib/db/new-meterai-serial'
import { titleFor } from '@/lib/db/title-for'
import type { Meterai, Signature } from '@/interfaces/db'
import LetterPreview from '@/components/organisms/LetterPreview'
import SignaturePad from '@/components/molecules/SignaturePad'
import { createContractAPI, fetchCounterparties, type CreateContractPayload } from '@/lib/api/contracts'

export default function BuatKontrakTemplate() {
  const { session } = useDash()
  const router = useRouter()
  const parties = counterpartyStore.use()
  const [step, setStep] = useState(0)
  const [template, setTemplate] = useState<TemplateKey | null>(null)
  const [partyId, setPartyId] = useState('')
  const [invite, setInvite] = useState<{ open: boolean; name: string; type: CounterpartyType; email: string; contact: string; error: string }>({
    open: false,
    name: '',
    type: 'Penyedia',
    email: '',
    contact: '',
    error: '',
  })
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [valueText, setValueText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clauses, setClauses] = useState<Clause[]>([])
  const [audit, setAudit] = useState<ReturnType<typeof auditDraft> | null>(null)
  const [thinking, setThinking] = useState(false)
  const [openClause, setOpenClause] = useState<string | null>(null)
  const [letterDate, setLetterDate] = useState('')
  const [desaSig, setDesaSig] = useState<Signature | null>(null)
  const [meterai, setMeterai] = useState<Meterai | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Sinkronkan rekanan dari backend API saat pertama kali dimuat
  useEffect(() => {
    fetchCounterparties().then((apiList) => {
      if (apiList && apiList.length > 0) {
        counterpartyStore.set((list) => {
          const existingIds = new Set(list.map((x) => x.id))
          const additions: Counterparty[] = apiList
            .filter((c) => !existingIds.has(String(c.id)))
            .map((c) => ({
              id: String(c.id),
              name: c.nama,
              type: c.jenis === 'penyedia' ? 'Penyedia' : 'UMKM',
              email: `${c.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@rekanan.id`,
              contact: c.nama,
              address: c.alamat || '-',
              invited: false,
            }))
          return [...list, ...additions]
        })
      }
    })
  }, [])

  const role = session.role
  const regionId = villageById(role.villageId)?.regionId ?? ''
  const t = template ? templates[template] : null
  const choices = useMemo(() => (t ? parties.filter((p) => t.partyTypes.includes(p.type)) : []), [parties, t])

  // Simulated AI drafting: short delay so the step feels like work is being done
  useEffect(() => {
    if (!thinking || !template) return
    const id = window.setTimeout(() => {
      const ctx = draftContext(role.villageId!, partyId)
      const draft = draftClauses(template, answers, ctx)
      setClauses(draft)
      setAudit(auditDraft(template, answers, draft, regionId))
      setThinking(false)
    }, 1400)
    return () => window.clearTimeout(id)
  }, [thinking, template, answers, partyId, regionId, role.villageId])

  if (role.role !== 'perangkat_desa') return <NotAllowed />

  const pickTemplate = (k: TemplateKey) => {
    setTemplate(k)
    setPartyId('')
    setAnswers((a) => ({ ...a, method: k === 'pengadaan' ? a.method : 'Penunjukan langsung' }))
    setInvite((i) => ({ ...i, type: templates[k].partyTypes[0] }))
  }

  const sendInvite = () => {
    const name = invite.name.trim()
    if (name.length < 3) return setInvite({ ...invite, error: 'Tulis nama usaha atau kelompok, minimal 3 huruf.' })
    if (!isEmail(invite.email)) return setInvite({ ...invite, error: 'Email belum benar. Contoh: nama@usaha.id' })
    if (invite.contact.trim().length < 3) return setInvite({ ...invite, error: 'Tulis nama penanggung jawab.' })
    if (parties.some((p) => p.email.toLowerCase() === invite.email.trim().toLowerCase())) return setInvite({ ...invite, error: 'Email ini sudah terdaftar. Pilih dari daftar di atas.' })
    const cp = addCounterparty({ name, type: invite.type, email: invite.email.trim(), contact: invite.contact.trim(), address: '-', invited: true })
    addAudit({ actor: session.name, role: 'Perangkat Desa', action: 'Mengundang pihak kedua', detail: `${cp.name} · ${cp.email}`, villageId: role.villageId, regionId })
    setPartyId(cp.id)
    setInvite({ open: false, name: '', type: invite.type, email: '', contact: '', error: '' })
  }

  const validateAnswers = () => {
    const e: Record<string, string> = {}
    if (answers.work.trim().length < 8) e.work = 'Jelaskan lebih rinci, minimal 8 huruf.'
    if (!answers.value || answers.value < 100_000) e.value = 'Isi nilai kontrak, minimal Rp100.000.'
    if (!answers.deadline || answers.deadline <= daysFromNow(0)) e.deadline = 'Tenggat harus setelah hari ini.'
    if (answers.scheme === 'Termin' && (answers.terms < 2 || answers.terms > 6)) e.terms = 'Pilih 2 sampai 6 termin.'
    setErrors(e)
    return !Object.keys(e).length
  }

  const next = () => {
    if (step === 0 && !template) return setErrors({ step: 'Pilih salah satu jenis kontrak.' })
    if (step === 1 && !partyId) return setErrors({ step: 'Pilih pihak kedua, atau undang yang baru.' })
    if (step === 2) {
      if (!validateAnswers()) return
      setThinking(true)
    }
    setErrors({})
    if (step === 3) setLetterDate(nowIso())
    setStep((s) => s + 1)
  }

  const drawSignature = (image: string | null) => {
    if (image) setDesaSig({ by: session.name, at: nowIso(), image })
    else {
      setDesaSig(null)
      setMeterai(null)
    }
  }

  const applyAI = (id: string) => {
    if (!template || !audit) return
    const out = applyFinding(template, answers, clauses, id)
    setAnswers(out.answers)
    setClauses(out.clauses)
    setAudit(reaudit(template, out.answers, out.clauses, regionId, audit))
  }

  const editClause = (key: string, text: string) => {
    const list = clauses.map((c) => (c.key === key ? { ...c, text } : c))
    setClauses(list)
    if (template) setAudit(reaudit(template, answers, list, regionId, audit ?? undefined))
  }

  const critical = audit?.findings.filter((f) => f.severity === 'kritis' && !f.applied).length ?? 0
  const finish = async (send: boolean) => {
    if (!template || !audit || submitting) return
    setSubmitting(true)

    // 1. Simpan di local store untuk persistensi UI instan
    const localCode = createContract(
      { template, answers, counterpartyId: partyId, clauses, audit, send, signatures: desaSig ? { desa: desaSig, ...(meterai ? { meterai } : {}) } : undefined },
      session,
    )

    // 2. Simpan ke Backend API PostgreSQL
    const cpNumericId = parseInt(partyId, 10) || 1
    const backendJenis =
      template === 'pengadaan'
        ? 'pengadaan'
        : template === 'sewa'
        ? 'sewa_aset'
        : template === 'bumdes'
        ? 'kerja_sama_bumdes'
        : 'hibah'

    const payload: CreateContractPayload = {
      counterpartyId: cpNumericId,
      jenis: backendJenis,
      judul: titleFor(template, answers.work),
      nilai: answers.value,
      tenggat: answers.deadline,
      skemaPembayaran: answers.scheme.toLowerCase(),
      metodePemilihan: answers.method === 'Pengadaan langsung' ? 'pengadaan_langsung' : 'lelang_terbatas',
      jawabanForm: {
        ...answers,
        work: answers.work,
        clauses: clauses.map((c) => ({ key: c.key, title: c.title, text: c.text })),
      },
      drafTeksOverride: clauses.map((c) => `[${c.title}]\n${c.text}`).join('\n\n'),
    }

    try {
      await createContractAPI(payload)
    } catch (err) {
      console.warn('Backend contract creation failed, using local copy:', err)
    }

    setSubmitting(false)
    router.push(`/dashboard/kontrak/${localCode}`)
  }

  const party = parties.find((p) => p.id === partyId)
  const letter = template && step === 4 ? draftContext(role.villageId!, partyId) : null
  const rule = regionRules[regionId]

  return (
    <>
      <PageHead label="Buat kontrak" title="Kontrak baru" desc="Jawab beberapa pertanyaan sederhana. SAKSI menyusun drafnya dan memeriksa dengan AI sebelum dikirim." />
      <ol className="flex gap-6 list-none list-outside -mb-4 overflow-x-auto pb-4 [&_li]:items-center [&_li]:flex [&_li]:flex-none [&_li]:text-[1.35rem] [&_li]:gap-8 [&_li]:text-dim [&_li]:pr-14 [&_li_span]:items-center [&_li_span]:border-[0.15rem] [&_li_span]:border-current [&_li_span]:border-solid [&_li_span]:rounded-[50%] [&_li_span]:flex [&_li_span]:text-[1.25rem] [&_li_span]:h-30 [&_li_span]:justify-center [&_li_span]:w-30 max-md:[&_li:not(.is-on)]:[font-size:0] max-md:[&_li:not(.is-on)]:gap-0 max-md:[&_li:not(.is-on)]:pr-0 d-wizard-steps" aria-label="Langkah">
        {buatKontrakSteps.map((s, i) => (
          <li key={s} className={i < step ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done' : i === step ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <Icon name="check" /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <Panel className="gap-24 p-24">
        {step === 0 && (
          <div>
            <h2 className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">Kontrak apa yang ingin dibuat?</h2>
            <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] mt-16 md:grid-cols-[repeat(4,minmax(0,1fr))]">
              {(Object.keys(templates) as TemplateKey[]).map((k) => (
                <button key={k} type="button" className={`bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[1.8rem] [color:inherit] grid gap-6 justify-items-start p-16 text-left [transition:border-color_0.2s,_box-shadow_0.2s,_transform_0.2s] [&_img]:h-80 [&_img]:mb-8 [&_img]:w-auto [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_span]:text-[1.35rem]! [&_span]:leading-[1.4] [&_span]:text-dim [&:hover]:border-ink [&.is-on]:border-blue! [&.is-on]:[box-shadow:0.5rem_0.5rem_0_var(--color-blue)] [&.is-on]:[transform:translate(-0.2rem,_-0.2rem)] ${template === k ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}`} aria-pressed={template === k} onClick={() => pickTemplate(k)}>
                  <Illustration name={templates[k].art} />
                  <strong>{templates[k].label}</strong>
                  <span>{templates[k].desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && t && (
          <div>
            <h2 className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">Siapa pihak keduanya?</h2>
            <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Untuk kontrak {t.label.toLowerCase()}, pihak kedua bertipe {t.partyTypes.join(' atau ')}.</p>
            <div className="grid gap-8 my-16 mx-0" role="radiogroup">
              {choices.map((p) => (
                <label key={p.id} className={`items-center border-[0.15rem] border-[#dcdcd8] border-solid rounded-[1.4rem] cursor-pointer grid gap-12 grid-cols-[auto_minmax(0,1fr)_auto] py-12 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] [&_input]:[accent-color:var(--color-blue)] [&_input]:h-18 [&_input]:w-18 [&_span]:grid [&_span]:gap-2 [&_span]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.25rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [&:hover]:border-ink [&.is-on]:border-blue! [&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] ${partyId === p.id ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}`}>
                  <input type="radio" name="party" checked={partyId === p.id} onChange={() => setPartyId(p.id)} />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.type} · {p.contact} · {p.email}
                    </small>
                  </span>
                  {p.invited && <Badge tone="tint">Diundang</Badge>}
                </label>
              ))}
              {!choices.length && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada pihak kedua dengan tipe ini. Undang yang baru di bawah.</p>}
            </div>
            {invite.open ? (
              <div className="bg-soft rounded-[1.6rem] grid gap-14 p-20 [&_h3]:text-[1.9rem] [&_h3]:font-[400]">
                <h3>Undang pihak kedua baru</h3>
                <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Undangan dikirim lewat email. Mereka membuat sandi sendiri dan langsung melihat kontrak ini.</p>
                <div className="[.d-form>&]:w-full grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
                  <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                    <span>Nama usaha atau kelompok</span>
                    <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value, error: '' })} placeholder="Contoh: CV Sumber Rejeki" />
                  </label>
                  <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                    <span>Tipe</span>
                    <select value={invite.type} onChange={(e) => setInvite({ ...invite, type: e.target.value as CounterpartyType })}>
                      {t.partyTypes.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                    <span>Email</span>
                    <input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value, error: '' })} placeholder="nama@usaha.id" />
                  </label>
                  <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                    <span>Penanggung jawab</span>
                    <input value={invite.contact} onChange={(e) => setInvite({ ...invite, contact: e.target.value, error: '' })} placeholder="Nama lengkap" />
                  </label>
                </div>
                {invite.error && <p className="text-red text-[1.35rem] not-italic">{invite.error}</p>}
                <div className="items-center flex flex-wrap gap-10">
                  <Btn onClick={sendInvite} icon="check">
                    Kirim undangan
                  </Btn>
                  <Btn variant="ghost" onClick={() => setInvite({ ...invite, open: false, error: '' })}>
                    Batal
                  </Btn>
                </div>
              </div>
            ) : (
              <Btn variant="ghost" icon="plus" onClick={() => setInvite({ ...invite, open: true })}>
                Undang pihak kedua baru
              </Btn>
            )}
          </div>
        )}

        {step === 2 && t && (
          <div>
            <h2 className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">Beberapa pertanyaan</h2>
            <div className="[.d-form>&]:w-full grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
              <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis md:[grid-column:span_2]">
                <span>{t.workLabel}</span>
                <textarea rows={2} value={answers.work} onChange={(e) => setAnswers({ ...answers, work: e.target.value })} placeholder={t.workPlaceholder} />
                {errors.work && <em className="text-red text-[1.35rem] not-italic">{errors.work}</em>}
              </label>
              <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                <span>Nilai kontrak{template === 'sewa' ? ' per tahun' : ''}</span>
                <div className="items-center flex relative [&_b]:text-[1.4rem] [&_b]:font-[400] [&_b]:left-14 [&_b]:text-dim [&_b]:absolute [&_input]:pl-42!">
                  <b>Rp</b>
                  <input
                    inputMode="numeric"
                    value={valueText}
                    onChange={(e) => {
                      const n = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0
                      setValueText(n ? n.toLocaleString('id-ID') : '')
                      setAnswers({ ...answers, value: n })
                    }}
                    placeholder="0"
                  />
                </div>
                {errors.value && <em className="text-red text-[1.35rem] not-italic">{errors.value}</em>}
              </label>
              <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                <span>Tenggat selesai</span>
                <input type="date" value={answers.deadline} min={daysFromNow(1)} onChange={(e) => setAnswers({ ...answers, deadline: e.target.value })} />
                {errors.deadline && <em className="text-red text-[1.35rem] not-italic">{errors.deadline}</em>}
              </label>
              <fieldset className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                <legend>Cara pembayaran</legend>
                <div className="[align-self:start] bg-soft rounded-[3rem] grid gap-4 [grid-auto-columns:1fr] grid-flow-col p-4 [&_button]:[background:none] [&_button]:border-0 [&_button]:border-none [&_button]:rounded-[3rem] [&_button]:[color:inherit] [&_button]:text-[1.4rem] [&_button]:min-h-40 [&_button]:py-0 [&_button]:px-20 [&_button]:[transition:background_0.2s] d-seg">
                  {(['Sekaligus', 'Termin'] as const).map((x) => (
                    <button key={x} type="button" className={answers.scheme === x ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''} aria-pressed={answers.scheme === x} onClick={() => setAnswers({ ...answers, scheme: x })}>
                      {x}
                    </button>
                  ))}
                </div>
              </fieldset>
              {answers.scheme === 'Termin' && (
                <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                  <span>Jumlah termin</span>
                  <input type="number" min={2} max={6} value={answers.terms} onChange={(e) => setAnswers({ ...answers, terms: Number(e.target.value) })} />
                  {errors.terms && <em className="text-red text-[1.35rem] not-italic">{errors.terms}</em>}
                </label>
              )}
              {template === 'pengadaan' && (
                <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
                  <span>Metode pengadaan</span>
                  <select value={answers.method} onChange={(e) => setAnswers({ ...answers, method: e.target.value })}>
                    {methods.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  {rule && <small className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Batas pengadaan langsung di wilayah ini {formatRp(rule.directMax)}.</small>}
                </label>
              )}
            </div>
          </div>
        )}

        {step === 3 &&
          (thinking || !audit ? (
            <div className="items-center flex gap-20 justify-center min-h-300 [&_p]:grid [&_p]:gap-4 [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_small]:text-[1.35rem]! [&_small]:text-dim" role="status">
              <span className="[animation:d-spin_0.9s_linear_infinite] border-[0.3rem] border-line border-solid rounded-[50%] border-t-blue h-44 w-44" aria-hidden="true" />
              <p>
                <strong>AI sedang menyusun draf dan memeriksa pasal…</strong>
                <small>Mencocokkan dengan aturan pengadaan desa dan contoh pasal.</small>
              </p>
            </div>
          ) : (
            <div className="[align-items:start] grid gap-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(32rem,1fr)] d-draft">
              <div className="d-draft-main">
                <h2 className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">Draf kontrak</h2>
                <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Klik pasal untuk mengubah isinya. Hasil audit diperbarui otomatis.</p>
                <ol className="[&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] grid gap-8 list-none list-outside [&>li]:border-[0.15rem]! [&>li]:border-[#ececea]! [&>li]:border-solid! [&>li]:rounded-[1.4rem]! [&>li]:grid [&>li]:gap-8 [&>li]:py-14! [&>li]:px-16! [&>li_p]:text-[1.5rem] [&>li_p]:leading-[1.6] [&.is-editing>li]:[border-style:dashed] [&.is-editing_label]:grid [&.is-editing_label]:gap-8 d-clauses">
                  {clauses.map((c, i) => (
                    <li key={c.key} className={audit.findings.some((f) => f.clauseKey === c.key && !f.applied && f.severity === 'kritis') ? '[.d-clauses>li&]:border-red' : ''}>
                      <button type="button" className="items-center [background:none] border-0 border-none [color:inherit] flex gap-10 p-0 text-left w-full [&_span]:text-[1.2rem] [&_span]:tracking-[0.04em] [&_span]:text-dim [&_span]:uppercase [&_strong]:flex-1 [&_strong]:font-[450] [&:not(.is-static):hover_strong]:text-blue" aria-expanded={openClause === c.key} onClick={() => setOpenClause(openClause === c.key ? null : c.key)}>
                        <span>Pasal {i + 1}</span>
                        <strong>{c.title}</strong>
                        <Icon name={openClause === c.key ? 'close' : 'doc'} />
                      </button>
                      {openClause === c.key ? (
                        <div className="grid gap-6">
                          <textarea rows={4} value={c.text} onChange={(e) => editClause(c.key, e.target.value)} aria-label={`Isi pasal ${c.title}`} />
                          <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">
                            {c.plain} Dasar: {c.legal}.
                          </p>
                        </div>
                      ) : (
                        <p>{c.text}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <AuditPanel audit={audit} onApply={applyAI} />
            </div>
          ))}

        {step === 4 && t && audit && (
          <div>
            <h2 className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">Periksa lalu simpan</h2>
            <dl className="grid [&>div]:border-t-[0.1rem] [&>div]:border-t-[#ececea] [&>div]:[border-top-style:solid] [&>div]:grid [&>div]:gap-3 [&>div]:py-10 [&>div]:px-0 [&>div:first-child]:border-t-0 [&>div:first-child]:[border-top-style:none] [&>div:first-child]:pt-0 [&_dt]:text-[1.25rem] [&_dt]:text-dim [&_dd]:text-[1.5rem]! [&_dd]:leading-[1.45] md:[&>div]:gap-20 md:[&>div]:grid-cols-[16rem_minmax(0,1fr)]">
              <div>
                <dt>Jenis</dt>
                <dd>{t.label}</dd>
              </div>
              <div>
                <dt>Pihak kedua</dt>
                <dd>{party?.name}</dd>
              </div>
              <div>
                <dt>Pekerjaan</dt>
                <dd>{answers.work}</dd>
              </div>
              <div>
                <dt>Nilai</dt>
                <dd>{formatRp(answers.value)}</dd>
              </div>
              <div>
                <dt>Tenggat</dt>
                <dd>{fmtDate(answers.deadline)}</dd>
              </div>
              <div>
                <dt>Pembayaran</dt>
                <dd>{answers.scheme === 'Termin' ? `${answers.terms} termin` : 'Sekaligus'}</dd>
              </div>
              <div>
                <dt>Skor audit AI</dt>
                <dd>
                  {audit.score}/100 {critical > 0 && <Badge tone="red">{critical} temuan kritis</Badge>}
                </dd>
              </div>
              <div>
                <dt>Jumlah pasal</dt>
                <dd>{clauses.length}</dd>
              </div>
            </dl>
            {critical > 0 && (
              <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
                <Icon name="alert" />
                Masih ada temuan kritis. Draf bisa disimpan, tetapi baru bisa dikirim ke pihak kedua setelah temuan diperbaiki.
              </p>
            )}
            {letter && template && (
              <section className="grid gap-16 pt-30" aria-labelledby="pratinjau-surat">
                <div>
                  <h2 id="pratinjau-surat" className="text-[2.6rem] font-[340] tracking-[-0.025em] mb-6">
                    Pratinjau surat
                  </h2>
                  <p className="text-[1.4rem] text-dim">Tanda tangan dan e-meterai boleh dibubuhkan sekarang atau nanti setelah disetujui. Kalau isi draf diubah lagi, keduanya dihapus dan perlu dibubuhkan ulang.</p>
                </div>
                <LetterPreview
                  title={titleFor(template, answers.work)}
                  village={letter.village.name}
                  head={letter.head}
                  second={letter.party.name}
                  date={letterDate}
                  clauses={clauses}
                  signatures={{ desa: desaSig ?? undefined, meterai: meterai ?? undefined }}
                />
                <div className="grid gap-12 max-w-780">
                  <strong className="text-[1.6rem] font-[500]">Tanda tangan Kepala Desa</strong>
                  <SignaturePad name={session.name} initial={desaSig?.image} onChange={drawSignature} />
                  <div>
                    <Btn icon="check" disabled={!desaSig || Boolean(meterai)} onClick={() => setMeterai({ serial: newMeteraiSerial(), at: nowIso() })}>
                      {meterai ? 'E-meterai sudah dibubuhkan' : 'Bubuhkan e-meterai Rp10.000'}
                    </Btn>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {errors.step && <p className="text-red text-[1.35rem] not-italic">{errors.step}</p>}
        <footer className="items-center border-t-[0.1rem] border-t-[#ececea] [border-top-style:solid] flex flex-wrap gap-10 justify-between pt-20">
          {step > 0 && !thinking ? (
            <Btn variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Kembali
            </Btn>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <Btn onClick={next} disabled={thinking} icon="arrow">
              {step === 2 ? 'Susun draf dengan AI' : 'Lanjut'}
            </Btn>
          ) : (
            <div className="items-center flex flex-wrap gap-10">
              <Btn variant="ghost" onClick={() => finish(false)} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan sebagai draf'}
              </Btn>
              <Btn onClick={() => finish(true)} disabled={critical > 0 || submitting}>
                {submitting ? 'Mengirim...' : 'Simpan dan kirim ke pihak kedua'}
              </Btn>
            </div>
          )}
        </footer>
      </Panel>
    </>
  )
}
