import { DEMO_PASSWORD, seedAccounts } from '@/data/auth'

interface Props {
  onPick: (email: string, password: string) => void
}

/* Seed accounts that stand in for invitations during the demo */
export default function DemoAccounts({ onPick }: Props) {
  return (
    <details className="demo-accounts">
      <summary>
        Akun demo <span>kata sandi semua akun: {DEMO_PASSWORD}</span>
      </summary>
      <ul>
        {seedAccounts.map((a) => (
          <li key={a.email}>
            <button type="button" onClick={() => onPick(a.email, DEMO_PASSWORD)}>
              <strong>{a.label}</strong>
              <code>{a.email}</code>
              <small>{a.note}</small>
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
