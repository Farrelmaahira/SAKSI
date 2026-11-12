import Btn from '@/components/atoms/Btn'
import Icon from '@/components/atoms/Icon'
import FormAlert from '@/components/atoms/FormAlert'
import SignaturePad from '@/components/molecules/SignaturePadLazy'
import type { useContractSigning } from '@/hooks/use-contract-signing'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import type { SignKey, SignStep } from '@/lib/dash/sign-steps'

interface Props {
  step: SignStep
  index: number
  c: DContract
  session: Session
  sg: ReturnType<typeof useContractSigning>
}

/* One signing step: who, whether it is done or waiting, and the pad or button to do it */
export default function SignStepRow({ step, index, c, session, sg }: Props) {
  return (
    <li className={step.done ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done' : step.can ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}>
                <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex h-36 justify-center w-36 [.d-sign_li.is-on_&]:bg-blue [.d-sign_li.is-on_&]:border-blue [.d-sign_li.is-on_&]:text-white [.d-sign_li.is-done_&]:bg-ink! [.d-sign_li.is-done_&]:border-ink! [.d-sign_li.is-done_&]:text-white!">{step.done ? <Icon name="check" /> : index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <small>{step.who}</small>
                  {step.done ? <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok">{step.done}</p> : step.wait && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{step.wait}</p>}
                </div>
                {step.can && step.key === 'meterai' && <Btn onClick={() => sg.act(step.key as SignKey)}>{step.label}</Btn>}
                {step.can && step.key !== 'meterai' && (
                  <section className="col-span-full grid gap-10 justify-items-start md:col-span-1 md:col-start-2">
                    <div className="w-full max-w-520">
                      <SignaturePad name={session.name} onChange={sg.setImage} />
                    </div>
                    <Btn onClick={() => sg.act(step.key as SignKey)} disabled={!sg.image || !c.apiId || sg.signing}>
                      {sg.signing ? 'Menyimpan...' : step.label}
                    </Btn>
                    {!c.apiId && <p className="text-[1.35rem] leading-[1.5] text-dim">Kontrak ini hanya tersimpan di perangkat ini, belum di server SAKSI, jadi tanda tangan elektronik belum bisa dibubuhkan.</p>}
                    {sg.signError && <FormAlert>{sg.signError}</FormAlert>}
                  </section>
                )}
              </li>
  )
}
