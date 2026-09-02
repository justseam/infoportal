import { useState } from 'react'
import { useSession } from '../state/session'
import { PERSONAS, CLIENTS } from '../data/mock'
import { ROLE_LABEL } from '../data/types'
import type { AuditEntry } from '../data/types'
import { Card, SectionTitle, Badge } from '../components/ui'
import { loadSettings, saveSettings, maskKey, type AISettings } from '../lib/aiSettings'
import { MODELS, type ModelId } from '../lib/pricing'
import { testConnection } from '../lib/claudeClient'

const ACTION_TONE: Record<AuditEntry['action'], 'slate' | 'blue' | 'green' | 'amber' | 'teal' | 'red'> = {
  login: 'slate',
  view: 'slate',
  download: 'blue',
  upload: 'green',
  edit: 'amber',
  permission: 'teal',
}

export function Admin() {
  const { persona, audit } = useSession()
  const [tab, setTab] = useState<'users' | 'audit' | 'sso' | 'ai'>('users')
  const isSuper = persona?.role === 'super'

  const users = PERSONAS.map((p) => ({ ...p, client: CLIENTS.find((c) => c.id === p.clientId) }))

  return (
    <div className="mx-auto max-w-5xl">
      <SectionTitle sub="Manage users, permissions, audit activity, and SSO across all client repositories">
        Admin &amp; Audit
      </SectionTitle>

      <div className="mb-5 flex gap-2">
        {(['users', 'audit', ...(isSuper ? (['sso', 'ai'] as const) : [])] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-brand-blue text-white' : 'border border-line bg-white text-ink-soft hover:text-brand-blue'
            }`}
          >
            {t === 'sso'
              ? 'SSO Settings'
              : t === 'ai'
                ? 'AI Settings'
                : t === 'users'
                  ? 'User Management'
                  : 'Audit Log'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-3 py-3 font-semibold">Organization</th>
                <th className="px-3 py-3 font-semibold">Role / Permission</th>
                <th className="px-5 py-3 font-semibold">Access</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line/60 hover:bg-canvas">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-brand-navy">{u.name}</div>
                    <div className="text-xs text-ink-soft">{u.email}</div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{u.client ? u.client.shortName : 'InfoIMAGE (all clients)'}</td>
                  <td className="px-3 py-3">
                    <Badge tone={u.role === 'super' ? 'teal' : u.role === 'admin' ? 'blue' : u.role === 'document' ? 'green' : 'slate'}>
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-soft">
                    {u.role === 'help'
                      ? 'Help site only'
                      : u.role === 'document'
                        ? 'View / download / upload'
                        : 'Manage all content & users'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line bg-canvas px-5 py-3 text-xs text-ink-soft">
            Permission tiers are normally assigned from your IdP groups via SSO. Editing is disabled in this prototype.
          </div>
        </Card>
      )}

      {tab === 'audit' && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-3 py-3 font-semibold">User</th>
                <th className="px-3 py-3 font-semibold">Action</th>
                <th className="px-3 py-3 font-semibold">Target</th>
                <th className="px-5 py-3 font-semibold">Client</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id} className="border-b border-line/60 hover:bg-canvas">
                  <td className="px-5 py-2.5 whitespace-nowrap text-xs text-ink-soft">{new Date(a.time).toLocaleString()}</td>
                  <td className="px-3 py-2.5 font-semibold text-brand-navy">{a.user}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={ACTION_TONE[a.action]}>{a.action}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-ink-soft">{a.target}</td>
                  <td className="px-5 py-2.5 text-xs text-ink-soft">
                    {a.clientId ? CLIENTS.find((c) => c.id === a.clientId)?.shortName : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line bg-canvas px-5 py-3 text-xs text-ink-soft">
            Audit logs capture logins, views, uploads, downloads, edits, and permission changes. Your live actions in this
            session appear here.
          </div>
        </Card>
      )}

      {tab === 'sso' && isSuper && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="p-5">
            <div className="font-bold text-brand-navy">Identity Provider</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Protocol" v="SAML 2.0 / OAuth2 (OIDC)" />
              <Row k="IdP" v="InfoTRAC SSO" />
              <Row k="Status" v="Connected" badge="green" />
              <Row k="Audience URI" v="urn:infoimage:infoportal" />
            </dl>
          </Card>
          <Card className="p-5">
            <div className="font-bold text-brand-navy">Role mapping</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="ip-help" v="Standard Help User" />
              <Row k="ip-docs" v="Document User" />
              <Row k="ip-admin" v="Internal Admin" />
              <Row k="ip-owner" v="Super Admin" />
            </dl>
          </Card>
          <Card className="p-5 sm:col-span-2">
            <div className="font-bold text-brand-navy">Security policy</div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              <li>• Per-client repository isolation enforced server-side (no cross-tenant reads).</li>
              <li>• Audit logging on login, upload, download, edit, and permission changes.</li>
              <li>• SLA target 99.9% uptime · portal loads &lt; 3s · 50+ concurrent users.</li>
            </ul>
          </Card>
        </div>
      )}
      {tab === 'ai' && isSuper && <AISettingsPanel />}
    </div>
  )
}

function AISettingsPanel() {
  const [settings, setSettings] = useState<AISettings>(() => loadSettings())
  const [keyInput, setKeyInput] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  function update(patch: Partial<AISettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
    setResult(null)
  }

  async function runTest() {
    const key = keyInput.trim() || settings.apiKey
    if (!key) {
      setResult({ ok: false, msg: 'Enter an API key first.' })
      return
    }
    setTesting(true)
    setResult(null)
    const r = await testConnection(key, settings.model)
    setTesting(false)
    if (r.ok) {
      update({ apiKey: key })
      setKeyInput('')
      setResult({ ok: true, msg: 'Connected. Key saved to this browser.' })
    } else {
      setResult({ ok: false, msg: r.error })
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-amber-200 bg-amber-50 p-5">
        <div className="font-bold text-amber-900">Prototype only — read this before entering a key</div>
        <ul className="mt-2 space-y-1 text-sm text-amber-900">
          <li>
            • InfoPORTAL is a static app with no backend, so a key entered here is stored in{' '}
            <strong>this browser's localStorage</strong> and sent directly from the browser to
            api.anthropic.com.
          </li>
          <li>
            • Anyone with access to this browser profile can read it. Use a{' '}
            <strong>limited, revocable key</strong> — never a production one.
          </li>
          <li>
            • In a real deployment the call would be proxied through a server so the key never
            reaches the client. That server does not exist yet.
          </li>
        </ul>
      </Card>

      <Card className="p-5">
        <div className="font-bold text-brand-navy">Assistant engine</div>
        <p className="mt-1 text-sm text-ink-soft">
          Simulated is the default and needs no key — it is what the public demo and the sales walkthrough run on.
        </p>
        <div className="mt-4 flex gap-2">
          {(['simulated', 'live'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ mode: m })}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                settings.mode === m
                  ? 'bg-brand-blue text-white'
                  : 'border border-line bg-white text-ink-soft hover:text-brand-blue'
              }`}
            >
              {m === 'live' ? 'Live Claude API' : 'Simulated'}
            </button>
          ))}
        </div>
        {settings.mode === 'live' && !settings.apiKey && (
          <div className="mt-3 text-sm font-semibold text-amber-700">
            Live mode is selected but no key is saved — the assistant will keep using the simulated engine.
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="font-bold text-brand-navy">Model</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => update({ model: m.id as ModelId })}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                settings.model === m.id
                  ? 'border-brand-blue bg-blue-50/50'
                  : 'border-line hover:border-brand-blue'
              }`}
            >
              <div className="text-sm font-bold text-brand-navy">{m.label}</div>
              <div className="mt-0.5 text-xs text-ink-soft">
                ${m.inputPerM}/M in · ${m.outputPerM}/M out
              </div>
              <div className="mt-1 text-xs text-ink-soft">{m.blurb}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-bold text-brand-navy">API key</div>
        <div className="mt-1 text-sm text-ink-soft">
          Saved key: <span className="font-mono text-xs text-brand-navy">{maskKey(settings.apiKey)}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-ant-…"
            autoComplete="off"
            className="min-w-72 flex-1 rounded-lg border border-line bg-white px-3 py-2 font-mono text-sm outline-none focus:border-brand-blue"
          />
          <button
            onClick={runTest}
            disabled={testing}
            className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
          >
            {testing ? 'Testing…' : 'Test & save'}
          </button>
          {settings.apiKey && (
            <button
              onClick={() => {
                update({ apiKey: '', mode: 'simulated' })
                setResult({ ok: true, msg: 'Key removed. Reverted to simulated mode.' })
              }}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-red-300 hover:text-red-600"
            >
              Remove key
            </button>
          )}
        </div>
        {result && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {result.msg}
          </div>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          The test sends one 16-token request to confirm the key works before saving it.
        </p>
      </Card>
    </div>
  )
}

function Row({ k, v, badge }: { k: string; v: string; badge?: 'green' }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-semibold text-brand-navy">{badge ? <Badge tone="green">{v}</Badge> : v}</dd>
    </div>
  )
}
