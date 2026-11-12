import Icon from '@/components/atoms/Icon'
import Panel from '@/components/molecules/Panel'
import SignStepRow from '@/components/organisms/SignStepRow'
import { useContractSigning } from '@/hooks/use-contract-signing'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { signSteps } from '@/lib/dash/sign-steps'

interface Props {
  c: DContract
  session: Session
}

/* Signing in order: Kepala Desa, e-meterai, then the second party */
export default function SignStepsPanel({ c, session }: Props) {
  const sg = useContractSigning(c, session)
  const s = c.signatures
  return (
    <Panel title="Tanda tangan elektronik" desc="Urutan: Kepala Desa, e-meterai, lalu pihak kedua. Tanda tangan dan e-meterai di prototipe ini adalah simulasi.">
      <ol className="grid gap-10 list-none list-outside [&_li]:items-center [&_li]:border-[0.15rem] [&_li]:border-[#ececea] [&_li]:border-solid [&_li]:rounded-[1.6rem] [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[auto_minmax(0,1fr)] [&_li]:p-16 [&_li>div]:grid [&_li>div]:gap-3 [&_li_strong]:text-[1.6rem] [&_li_strong]:font-[420] [&_li_small]:text-[1.3rem]! [&_li_small]:text-dim md:[&_li]:grid-cols-[auto_minmax(0,1fr)_auto] d-sign">
        {signSteps(c, session.role.role).map((step, i) => (
          <SignStepRow key={step.key} step={step} index={i} c={c} session={session} sg={sg} />
        ))}
      </ol>
{s.desa && s.pihak && s.meterai && <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok"><Icon name="check" /> Tanda tangan lengkap. Kontrak sah dan siap disegel.</p>}
    </Panel>
  )
}
