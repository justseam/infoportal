import { useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { PERSONAS, CLIENTS } from '../data/mock'
import { ROLE_LABEL } from '../data/types'
import { Logo } from '../components/Logo'
import { IconLock, IconChevron } from '../components/icons'

export function Login() {
  const { login } = useSession()
  const navigate = useNavigate()

  function pick(id: string) {
    login(id)
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-deep to-brand-slate">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
              <Logo variant="light" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Secure Client Document Portal</h1>
          <p className="mt-2 max-w-xl text-white/70">
            A smarter repository for your contracts, statement &amp; notice designs, tax forms, and billing — with a
            built-in AI assistant. Sign in with your InfoTRAC credentials.
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <IconLock className="h-4 w-4 text-brand-blue" />
            Sign in via SSO (InfoTRAC · SAML/OAuth2)
          </div>
          <p className="mb-4 text-sm text-ink-soft">Choose a demo persona to explore role-based access:</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {PERSONAS.map((p) => {
              const client = CLIENTS.find((c) => c.id === p.clientId)
              return (
                <button
                  key={p.id}
                  onClick={() => pick(p.id)}
                  className="group flex items-center gap-3 rounded-xl border border-line p-3.5 text-left transition hover:border-brand-blue hover:bg-blue-50/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                    {p.name.split(' ').map((x) => x[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-brand-navy">{p.name}</div>
                    <div className="truncate text-xs text-ink-soft">{ROLE_LABEL[p.role]}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-soft">{client ? client.shortName : 'InfoIMAGE Staff · all clients'}</div>
                  </div>
                  <IconChevron className="h-4 w-4 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                </button>
              )
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          Prototype — all clients, documents, and figures are fictitious and simulated client-side.
        </p>
      </div>
    </div>
  )
}
