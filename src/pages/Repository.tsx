import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { DOCS, CLIENTS } from '../data/mock'
import { CATEGORIES } from '../data/types'
import type { DocCategory } from '../data/types'
import { Card, FileBadge, SectionTitle, Badge } from '../components/ui'
import { IconSearch, IconClock } from '../components/icons'

export function Repository() {
  const { activeClientId } = useSession()
  const navigate = useNavigate()
  const [cat, setCat] = useState<DocCategory | 'all'>('all')
  const [origin, setOrigin] = useState<'all' | 'core' | 'non-core'>('all')
  const [q, setQ] = useState('')
  const client = CLIENTS.find((c) => c.id === activeClientId)

  const docs = useMemo(() => DOCS.filter((d) => d.clientId === activeClientId), [activeClientId])

  const filtered = docs.filter((d) => {
    if (cat !== 'all' && d.category !== cat) return false
    // only data-driven documents have a source, so an origin filter also
    // narrows away contracts, SOWs and the like
    if (origin !== 'all' && (!d.source || d.source.core !== (origin === 'core'))) return false
    if (q) {
      const hay = (d.name + ' ' + d.tags.join(' ')).toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const counts = CATEGORIES.map((c) => ({ c, n: docs.filter((d) => d.category === c).length }))
  const sourced = docs.filter((d) => d.source)
  const coreCount = sourced.filter((d) => d.source!.core).length

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle sub={`${client?.name} · isolated repository — you only see this organization's documents`}>
        Documents
      </SectionTitle>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3">
          <IconSearch className="h-4 w-4 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents and tags…"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>
          All ({docs.length})
        </Chip>
        {counts
          .filter((x) => x.n > 0)
          .map(({ c, n }) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c} ({n})
            </Chip>
          ))}
      </div>

      {sourced.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Data source
          </span>
          <Chip active={origin === 'all'} onClick={() => setOrigin('all')}>
            Any
          </Chip>
          <Chip active={origin === 'core'} onClick={() => setOrigin('core')}>
            {client?.coreSystem ?? 'Core'} ({coreCount})
          </Chip>
          <Chip active={origin === 'non-core'} onClick={() => setOrigin('non-core')}>
            Outside the core ({sourced.length - coreCount})
          </Chip>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-ink-soft">No documents match your filters.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const latest = d.versions[d.versions.length - 1]
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/app/repository/${d.id}`)}
                className="flex flex-col rounded-xl border border-line bg-white p-4 text-left transition hover:border-brand-blue hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <FileBadge type={d.fileType} />
                  <Badge tone="blue">v{latest.v}</Badge>
                </div>
                <div className="mt-3 line-clamp-2 text-sm font-bold text-brand-navy">{d.name}</div>
                <div className="mt-1 text-xs text-ink-soft">{d.category}</div>
                {d.source && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        d.source.core
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {d.source.core ? 'Core' : 'Non-core'}
                    </span>
                    <span className="truncate text-[10px] text-ink-soft">{d.source.system}</span>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                  <IconClock className="h-3.5 w-3.5" />
                  {d.versions.length} version{d.versions.length > 1 ? 's' : ''} · updated {latest.date}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {d.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded bg-canvas px-1.5 py-0.5 text-[10px] text-ink-soft">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-brand-blue text-white' : 'border border-line bg-white text-ink-soft hover:border-brand-blue hover:text-brand-blue'
      }`}
    >
      {children}
    </button>
  )
}
