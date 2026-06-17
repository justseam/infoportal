import { useState } from 'react'
import { useSession } from '../state/session'
import { PERSONAS, CLIENTS } from '../data/mock'
import { ROLE_LABEL } from '../data/types'
import type { AuditEntry } from '../data/types'
import { Card, SectionTitle, Badge } from '../components/ui'

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
  const [tab, setTab] = useState<'users' | 'audit' | 'sso'>('users')
  const isSuper = persona?.role === 'super'

  const users = PERSONAS.map((p) => ({ ...p, client: CLIENTS.find((c) => c.id === p.clientId) }))

  return (
    <div className="mx-auto max-w-5xl">
      <SectionTitle sub="Manage users, permissions, audit activity, and SSO across all client repositories">
        Admin &amp; Audit
      </SectionTitle>

      <div className="mb-5 flex gap-2">
        {(['users', 'audit', ...(isSuper ? (['sso'] as const) : [])] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-brand-blue text-white' : 'border border-line bg-white text-ink-soft hover:text-brand-blue'
            }`}
          >
            {t === 'sso' ? 'SSO Settings' : t === 'users' ? 'User Management' : 'Audit Log'}
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
