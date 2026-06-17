import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { DOCS, INVOICES, HELP, CLIENTS, MONTH_LABEL } from '../data/mock'
import { Card, FileBadge, SectionTitle, Badge } from '../components/ui'
import { IconSparkles, IconSearch, IconChevron } from '../components/icons'

export function Dashboard() {
  const { persona, activeClientId, isStaff } = useSession()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const role = persona?.role ?? 'help'
  const client = CLIENTS.find((c) => c.id === activeClientId)

  const docs = DOCS.filter((d) => d.clientId === activeClientId)
  const recent = [...docs]
    .map((d) => ({ d, latest: d.versions[d.versions.length - 1] }))
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date))
    .slice(0, 5)
  const invoices = INVOICES.filter((i) => i.clientId === activeClientId).sort((a, b) => a.period.localeCompare(b.period))
  const latestInv = invoices[invoices.length - 1]
  const prevInv = invoices[invoices.length - 2]

  const canDocs = role !== 'help'

  function ask() {
    navigate('/app/assistant', { state: { q } })
  }

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle sub={isStaff ? `Viewing ${client?.name}` : client?.name}>
        {greet}, {persona?.name.split(' ')[0]}
      </SectionTitle>

      {canDocs && (
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-navy to-brand-deep px-5 py-4">
            <div className="flex items-center gap-2 text-white">
              <IconSparkles className="h-5 w-5 text-brand-teal" />
              <span className="font-bold">Ask the InfoPORTAL assistant</span>
            </div>
            <p className="mt-0.5 text-sm text-white/60">
              “Show previous versions of the monthly statement” · “Compare our print vs postage spend”
            </p>
          </div>
          <div className="flex items-center gap-2 p-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-line px-3">
              <IconSearch className="h-4 w-4 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
                placeholder="Ask about your documents, versions, or billing…"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <button onClick={ask} className="rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Ask
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent documents */}
        {canDocs && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="font-bold text-brand-navy">Recent documents</h2>
              <button onClick={() => navigate('/app/repository')} className="flex items-center gap-1 text-sm font-semibold text-brand-blue">
                View all <IconChevron className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-line">
              {recent.map(({ d, latest }) => (
                <button
                  key={d.id}
                  onClick={() => navigate(`/app/repository/${d.id}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-canvas"
                >
                  <FileBadge type={d.fileType} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-brand-navy">{d.name}</div>
                    <div className="text-xs text-ink-soft">
                      {d.category} · updated {latest.date}
                    </div>
                  </div>
                  <Badge tone="blue">v{latest.v}</Badge>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Side column */}
        <div className="space-y-6">
          {canDocs && latestInv && (
            <Card>
              <div className="border-b border-line px-5 py-3.5">
                <h2 className="font-bold text-brand-navy">Latest invoice</h2>
              </div>
              <div className="px-5 py-4">
                <div className="text-xs uppercase tracking-wide text-ink-soft">{MONTH_LABEL[latestInv.period]}</div>
                <div className="text-3xl font-extrabold text-brand-navy">${latestInv.total.toLocaleString()}</div>
                {prevInv && (
                  <div className="mt-1 text-sm">
                    {latestInv.total < prevInv.total ? (
                      <span className="font-semibold text-emerald-600">
                        ↓ {Math.round((1 - latestInv.total / prevInv.total) * 100)}% vs {MONTH_LABEL[prevInv.period]}
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700">
                        ↑ {Math.round((latestInv.total / prevInv.total - 1) * 100)}% vs {MONTH_LABEL[prevInv.period]}
                      </span>
                    )}
                  </div>
                )}
                <button onClick={() => navigate('/app/billing')} className="mt-3 w-full rounded-lg border border-line py-2 text-sm font-semibold text-brand-blue hover:bg-canvas">
                  View billing
                </button>
              </div>
            </Card>
          )}

          <Card>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="font-bold text-brand-navy">Help &amp; resources</h2>
            </div>
            <div className="divide-y divide-line">
              {HELP.slice(0, 3).map((h) => (
                <button key={h.id} onClick={() => navigate('/app/help')} className="block w-full px-5 py-3 text-left hover:bg-canvas">
                  <div className="text-sm font-semibold text-brand-navy">{h.title}</div>
                  <div className="text-xs text-ink-soft">{h.category}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {!canDocs && (
        <Card className="mt-6 p-5 text-sm text-ink-soft">
          You have <span className="font-semibold text-brand-navy">Help-only</span> access. Document repositories and
          billing are not available for your role. Contact your administrator to request document access.
        </Card>
      )}
    </div>
  )
}
