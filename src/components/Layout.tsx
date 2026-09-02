import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { CLIENTS } from '../data/mock'
import type { Role } from '../data/types'
import { ROLE_LABEL } from '../data/types'
import {
  IconBell,
  IconFolder,
  IconGauge,
  IconGrid,
  IconLifebuoy,
  IconLogout,
  IconReceipt,
  IconShield,
  IconSparkles,
} from './icons'
import { Logo } from './Logo'

interface NavItem {
  to: string
  label: string
  icon: (p: { className?: string }) => React.ReactElement
  roles: Role[]
}

const NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: IconGrid, roles: ['help', 'document', 'admin', 'super'] },
  { to: '/app/repository', label: 'Documents', icon: IconFolder, roles: ['document', 'admin', 'super'] },
  { to: '/app/assistant', label: 'AI Assistant', icon: IconSparkles, roles: ['document', 'admin', 'super'] },
  { to: '/app/billing', label: 'Invoicing & Billing', icon: IconReceipt, roles: ['document', 'admin', 'super'] },
  { to: '/app/help', label: 'Help Site', icon: IconLifebuoy, roles: ['help', 'document', 'admin', 'super'] },
  { to: '/app/admin', label: 'Admin & Audit', icon: IconShield, roles: ['admin', 'super'] },
  // Super Admin only — AI spend is not exposed to Internal Admin.
  { to: '/app/ai-usage', label: 'AI Usage & Cost', icon: IconGauge, roles: ['super'] },
]

export function Layout() {
  const { persona, isStaff, activeClientId, setActiveClientId, notifications, markAllRead, logout } = useSession()
  const navigate = useNavigate()
  const [bellOpen, setBellOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length
  const role = persona?.role ?? 'help'
  const activeClient = CLIENTS.find((c) => c.id === activeClientId)

  function doLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-brand-navy text-white">
        <div className="px-5 py-5">
          <Logo variant="light" />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.filter((n) => n.roles.includes(role)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4 text-xs text-white/50">
          InfoPORTAL · Prototype
          <div className="mt-1 text-white/35">All data fictitious & simulated</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div className="flex items-center gap-3">
            {isStaff ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Viewing client</span>
                <select
                  value={activeClientId ?? ''}
                  onChange={(e) => setActiveClientId(e.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy outline-none focus:border-brand-blue"
                >
                  {CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: activeClient?.accent }} />
                <span className="text-sm font-semibold text-brand-navy">{activeClient?.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((o) => !o)
                  if (!bellOpen) markAllRead()
                }}
                className="relative rounded-lg p-2 text-ink-soft hover:bg-canvas"
              >
                <IconBell />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-line bg-white p-2 shadow-lg">
                  <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">Notifications</div>
                  {notifications.map((n) => (
                    <div key={n.id} className="rounded-lg px-2 py-2 text-sm hover:bg-canvas">
                      <div className="text-brand-navy">{n.text}</div>
                      <div className="mt-0.5 text-xs text-ink-soft">{new Date(n.time).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Persona */}
            <div className="flex items-center gap-3 border-l border-line pl-3">
              <div className="text-right">
                <div className="text-sm font-semibold leading-tight text-brand-navy">{persona?.name}</div>
                <div className="text-xs leading-tight text-ink-soft">{ROLE_LABEL[role]}</div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                {persona?.name.split(' ').map((p) => p[0]).join('')}
              </div>
              <button onClick={doLogout} title="Sign out" className="rounded-lg p-2 text-ink-soft hover:bg-canvas">
                <IconLogout />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto px-6 py-6 scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
