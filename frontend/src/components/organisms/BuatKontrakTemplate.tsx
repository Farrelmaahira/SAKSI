'use client'

import { useRouter } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { counterpartyStore } from '@/lib/master/counterparty-store'
import { useEffect, useMemo, useState } from 'react'
import type { Answers, Clause, TemplateKey } from '@/interfaces/drafting'
import type { CounterpartyType } from '@/interfaces/master'
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
    setStep((s) => s + 1)
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
  const finish = (send: boolean) => {
    if (!template || !audit) return
    const code = createContract({ template, answers, counterpartyId: partyId, clauses, audit, send }, session)
    router.push(`/dashboard/kontrak/${code}`)
  }

  const party = parties.find((p) => p.id === partyId)
  const rule = regionRules[regionId]

  return (
    <>
      <PageHead label="Buat kontrak" title="Kontrak baru" desc="Jawab beberapa pertanyaan sederhana. SAKSI menyusun drafnya dan memeriksa dengan AI sebelum dikirim." />
      <ol className="d-wizard-steps" aria-label="Langkah">
        {buatKontrakSteps.map((s, i) => (
          <li key={s} className={i < step ? 'is-done' : i === step ? 'is-on' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <Icon name="check" /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <Panel className="d-wizard">
        {step === 0 && (
          <div>
            <h2 className="d-step-title">Kontrak apa yang ingin dibuat?</h2>
            <div className="d-cards">
              {(Object.keys(templates) as TemplateKey[]).map((k) => (
                <button key={k} type="button" className={`d-card-pick ${template === k ? 'is-on' : ''}`} aria-pressed={template === k} onClick={() => pickTemplate(k)}>
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
            <h2 className="d-step-title">Siapa pihak keduanya?</h2>
            <p className="d-muted">Untuk kontrak {t.label.toLowerCase()}, pihak kedua bertipe {t.partyTypes.join(' atau ')}.</p>
            <div className="d-party-list" role="radiogroup">
              {choices.map((p) => (
                <label key={p.id} className={`d-party ${partyId === p.id ? 'is-on' : ''}`}>
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
              {!choices.length && <p className="d-muted">Belum ada pihak kedua dengan tipe ini. Undang yang baru di bawah.</p>}
            </div>
            {invite.open ? (
              <div className="d-invite">
                <h3>Undang pihak kedua baru</h3>
                <p className="d-muted">Undangan dikirim lewat email. Mereka membuat sandi sendiri dan langsung melihat kontrak ini.</p>
                <div className="d-form-grid">
                  <label className="d-field">
                    <span>Nama usaha atau kelompok</span>
                    <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value, error: '' })} placeholder="Contoh: CV Sumber Rejeki" />
                  </label>
                  <label className="d-field">
                    <span>Tipe</span>
                    <select value={invite.type} onChange={(e) => setInvite({ ...invite, type: e.target.value as CounterpartyType })}>
                      {t.partyTypes.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="d-field">
                    <span>Email</span>
                    <input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value, error: '' })} placeholder="nama@usaha.id" />
                  </label>
                  <label className="d-field">
                    <span>Penanggung jawab</span>
                    <input value={invite.contact} onChange={(e) => setInvite({ ...invite, contact: e.target.value, error: '' })} placeholder="Nama lengkap" />
                  </label>
                </div>
                {invite.error && <p className="d-field-error">{invite.error}</p>}
                <div className="d-btn-row">
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
            <h2 className="d-step-title">Beberapa pertanyaan</h2>
            <div className="d-form-grid">
              <label className="d-field d-span-2">
                <span>{t.workLabel}</span>
                <textarea rows={2} value={answers.work} onChange={(e) => setAnswers({ ...answers, work: e.target.value })} placeholder={t.workPlaceholder} />
                {errors.work && <em className="d-field-error">{errors.work}</em>}
              </label>
              <label className="d-field">
                <span>Nilai kontrak{template === 'sewa' ? ' per tahun' : ''}</span>
                <div className="d-input-prefix">
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
                {errors.value && <em className="d-field-error">{errors.value}</em>}
              </label>
              <label className="d-field">
                <span>Tenggat selesai</span>
                <input type="date" value={answers.deadline} min={daysFromNow(1)} onChange={(e) => setAnswers({ ...answers, deadline: e.target.value })} />
                {errors.deadline && <em className="d-field-error">{errors.deadline}</em>}
              </label>
              <fieldset className="d-field">
                <legend>Cara pembayaran</legend>
                <div className="d-seg">
                  {(['Sekaligus', 'Termin'] as const).map((x) => (
                    <button key={x} type="button" className={answers.scheme === x ? 'is-on' : ''} aria-pressed={answers.scheme === x} onClick={() => setAnswers({ ...answers, scheme: x })}>
                      {x}
                    </button>
                  ))}
                </div>
              </fieldset>
              {answers.scheme === 'Termin' && (
                <label className="d-field">
                  <span>Jumlah termin</span>
                  <input type="number" min={2} max={6} value={answers.terms} onChange={(e) => setAnswers({ ...answers, terms: Number(e.target.value) })} />
                  {errors.terms && <em className="d-field-error">{errors.terms}</em>}
                </label>
              )}
              {template === 'pengadaan' && (
                <label className="d-field">
                  <span>Metode pengadaan</span>
                  <select value={answers.method} onChange={(e) => setAnswers({ ...answers, method: e.target.value })}>
                    {methods.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  {rule && <small className="d-muted">Batas pengadaan langsung di wilayah ini {formatRp(rule.directMax)}.</small>}
                </label>
              )}
            </div>
          </div>
        )}

        {step === 3 &&
          (thinking || !audit ? (
            <div className="d-thinking" role="status">
              <span className="d-spinner" aria-hidden="true" />
              <p>
                <strong>AI sedang menyusun draf dan memeriksa pasal…</strong>
                <small>Mencocokkan dengan aturan pengadaan desa dan contoh pasal.</small>
              </p>
            </div>
          ) : (
            <div className="d-draft">
              <div className="d-draft-main">
                <h2 className="d-step-title">Draf kontrak</h2>
                <p className="d-muted">Klik pasal untuk mengubah isinya. Hasil audit diperbarui otomatis.</p>
                <ol className="d-clauses">
                  {clauses.map((c, i) => (
                    <li key={c.key} className={audit.findings.some((f) => f.clauseKey === c.key && !f.applied && f.severity === 'kritis') ? 'has-issue' : ''}>
                      <button type="button" className="d-clause-head" aria-expanded={openClause === c.key} onClick={() => setOpenClause(openClause === c.key ? null : c.key)}>
                        <span>Pasal {i + 1}</span>
                        <strong>{c.title}</strong>
                        <Icon name={openClause === c.key ? 'close' : 'doc'} />
                      </button>
                      {openClause === c.key ? (
                        <div className="d-clause-edit">
                          <textarea rows={4} value={c.text} onChange={(e) => editClause(c.key, e.target.value)} aria-label={`Isi pasal ${c.title}`} />
                          <p className="d-muted">
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
            <h2 className="d-step-title">Periksa lalu simpan</h2>
            <dl className="d-summary">
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
              <p className="d-callout">
                <Icon name="alert" />
                Masih ada temuan kritis. Draf bisa disimpan, tetapi baru bisa dikirim ke pihak kedua setelah temuan diperbaiki.
              </p>
            )}
          </div>
        )}

        {errors.step && <p className="d-field-error">{errors.step}</p>}
        <footer className="d-wizard-foot">
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
            <div className="d-btn-row">
              <Btn variant="ghost" onClick={() => finish(false)}>
                Simpan sebagai draf
              </Btn>
              <Btn onClick={() => finish(true)} disabled={critical > 0}>
                Simpan dan kirim ke pihak kedua
              </Btn>
            </div>
          )}
        </footer>
      </Panel>
    </>
  )
}
