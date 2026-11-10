import { DEMO_PASSWORD, seedAccounts } from "@/data/auth";

interface Props {
  onPick: (email: string, password: string) => void;
}

/* Seed accounts that stand in for invitations during the demo */
export default function DemoAccounts({ onPick }: Props) {
  return (
    <details className="border-t-[0.1rem] border-t-[#e3e3e0] [border-top-style:solid] text-[1.4rem] mt-24 pt-16 [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:flex-wrap [&_summary]:gap-y-4 [&_summary]:gap-x-10 [&_summary]:list-none [&_summary]:list-outside [&_summary::-webkit-details-marker]:hidden [&_summary::before]:content-['+'] [&_summary::before]:text-blue [&_summary::before]:font-[500] [&[open]_summary::before]:content-['–'] [&_summary_span]:text-[1.3rem] [&_summary_span]:opacity-[0.55] [&_ul]:grid [&_ul]:gap-6 [&_ul]:list-none [&_ul]:list-outside [&_ul]:mt-12 [&_button]:items-baseline [&_button]:[background:none] [&_button]:border-[0.15rem] [&_button]:border-[#e3e3e0] [&_button]:border-solid [&_button]:rounded-[1rem] [&_button]:[color:inherit] [&_button]:grid [&_button]:gap-y-2 [&_button]:gap-x-10 [&_button]:grid-cols-[auto_1fr] [&_button]:py-10 [&_button]:px-12 [&_button]:text-left [&_button]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_button]:w-full [&_button:hover]:border-blue [&_button:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_strong]:font-[400] [&_code]:text-blue [&_code]:font-code [&_code]:text-[1.2rem] [&_code]:[justify-self:end] [&_small]:text-[1.2rem] [&_small]:[grid-column:1_/_-1] [&_small]:opacity-[0.55]">
      <summary>
        Akun demo <span>kata sandi semua akun: {DEMO_PASSWORD}</span>
      </summary>
      <ul>
        {seedAccounts.map((a) => (
          <li key={a.email}>
            <button
              type="button"
              onClick={() => onPick(a.email, DEMO_PASSWORD)}
            >
              <strong>{a.label}</strong>
              <code>{a.email}</code>
              <small>{a.note}</small>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
