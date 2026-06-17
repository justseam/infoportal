import { useState } from 'react'
import { HELP } from '../data/mock'
import { Card, SectionTitle, Badge } from '../components/ui'
import { IconSearch, IconLifebuoy, IconChevron } from '../components/icons'

export function Help() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const filtered = HELP.filter((h) => {
    if (!q) return true
    const hay = (h.title + ' ' + h.category + ' ' + h.tags.join(' ') + ' ' + h.body).toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <div className="mx-auto max-w-4xl">
      <SectionTitle sub="How-tos, FAQs, and product guides — available to all portal users">Help Site</SectionTitle>

      <div className="mb-5 flex items-center gap-2 rounded-lg border border-line bg-white px-3">
        <IconSearch className="h-4 w-4 text-ink-soft" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the help site…"
          className="flex-1 bg-transparent py-3 text-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((h) => (
          <Card key={h.id}>
            <button onClick={() => setOpen(open === h.id ? null : h.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                <IconLifebuoy className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-brand-navy">{h.title}</div>
                <div className="text-xs text-ink-soft">{h.excerpt}</div>
              </div>
              <Badge tone="blue">{h.category}</Badge>
              <IconChevron className={`h-4 w-4 text-ink-soft transition ${open === h.id ? 'rotate-90' : ''}`} />
            </button>
            {open === h.id && (
              <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">{h.body}</div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && <Card className="p-10 text-center text-ink-soft">No articles match “{q}”.</Card>}
      </div>
    </div>
  )
}
