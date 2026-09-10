import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSession } from '../state/session'
import { DOCS } from '../data/mock'
import { hasFieldMap } from '../data/fieldMaps'
import type { DocVersion } from '../data/types'
import { Card, FileBadge, Badge } from '../components/ui'
import { DocViewer } from '../components/DocViewer'
import { IconChevron, IconClock, IconDownload, IconLock } from '../components/icons'

type ViewMode = 'sample' | 'mapping'

export function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeClientId, isStaff, logActivity } = useSession()
  const [viewing, setViewing] = useState<{ version: DocVersion; mode: ViewMode } | null>(null)
  const [compare, setCompare] = useState<[number, number] | null>(null)

  const doc = DOCS.find((d) => d.id === id)

  // enforce client isolation — staff switch clients via the topbar
  if (!doc || doc.clientId !== activeClientId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-10 text-center">
          <div className="text-lg font-bold text-brand-navy">Document not available</div>
          <p className="mt-1 text-sm text-ink-soft">
            This document doesn’t exist in the current client’s repository. Access is siloed per client.
          </p>
          <button onClick={() => navigate('/app/repository')} className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
            Back to Documents
          </button>
        </Card>
      </div>
    )
  }

  const ordered = [...doc.versions].sort((a, b) => b.v - a.v)
  const latest = ordered[0]
  const mappable = isStaff && hasFieldMap(doc) // staff-only field-mapping affordances

  const cmpA = compare ? doc.versions.find((v) => v.v === compare[0]) : null
  const cmpB = compare ? doc.versions.find((v) => v.v === compare[1]) : null

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate('/app/repository')} className="mb-3 flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-brand-blue">
        <IconChevron className="h-4 w-4 rotate-180" /> Documents
      </button>

      <Card className="mb-6 p-5">
        <div className="flex items-start gap-4">
          <FileBadge type={doc.fileType} />
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-brand-navy">{doc.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <span>{doc.category}</span>
              <span>·</span>
              <Badge tone="blue">current v{latest.v}</Badge>
              <span>·</span>
              <span className="flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" /> {doc.versions.length} versions
              </span>
              {mappable && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    <IconLock className="h-3 w-3" /> Field mapping · internal
                  </span>
                </>
              )}
            </div>
            {doc.source && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
                <span className="shrink-0 whitespace-nowrap">
                  <Badge tone={doc.source.core ? 'teal' : 'amber'}>
                    {doc.source.core ? 'Core' : 'Non-core'}
                  </Badge>
                </span>
                <div className="text-xs text-ink-soft">
                  <span className="font-semibold text-brand-navy">{doc.source.system}</span>
                  {' — '}
                  {doc.source.note}
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doc.tags.map((t) => (
                <span key={t} className="rounded bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setViewing({ version: latest, mode: 'sample' })}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Open latest
            </button>
            {mappable && (
              <button
                onClick={() => setViewing({ version: latest, mode: 'mapping' })}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-blue-50/50"
              >
                <IconLock className="h-3.5 w-3.5" /> Field mapping
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* compare result */}
      {cmpA && cmpB && (
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-blue-50/50 px-5 py-3">
            <div className="font-bold text-brand-navy">
              Comparing v{cmpA.v} → v{cmpB.v}
            </div>
            <button onClick={() => setCompare(null)} className="text-sm font-semibold text-ink-soft hover:text-brand-blue">
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 divide-x divide-line">
            {[cmpA, cmpB].map((v) => (
              <div key={v.v} className="p-5">
                <Badge tone="slate">v{v.v}</Badge>
                <div className="mt-2 text-xs text-ink-soft">{v.date}</div>
                <p className="mt-2 text-sm text-brand-navy">{v.note}</p>
                <div className="mt-3 text-xs text-ink-soft">{v.sizeKB.toLocaleString()} KB · {v.author}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* version timeline */}
      <h2 className="mb-3 font-bold text-brand-navy">Version history</h2>
      <Card>
        <div className="divide-y divide-line">
          {ordered.map((v, idx) => (
            <div key={v.v} className="flex items-start gap-4 px-5 py-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-brand-blue text-white' : 'bg-canvas text-ink-soft'}`}>
                  v{v.v}
                </div>
                {idx < ordered.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-line" style={{ minHeight: 24 }} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-navy">{v.date}</span>
                  {idx === 0 && <Badge tone="green">current</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{v.note}</p>
                <div className="mt-1 text-xs text-ink-soft">{v.author} · {v.sizeKB.toLocaleString()} KB</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={() => setViewing({ version: v, mode: 'sample' })} className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-brand-blue hover:bg-canvas">
                    View sample
                  </button>
                  {mappable && (
                    <button
                      onClick={() => setViewing({ version: v, mode: 'mapping' })}
                      className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-brand-blue hover:bg-blue-50/50"
                    >
                      <IconLock className="h-3.5 w-3.5" /> Field map
                    </button>
                  )}
                  <button
                    onClick={() => logActivity('download', `${doc.name} v${v.v}`)}
                    className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-canvas"
                  >
                    <IconDownload className="h-3.5 w-3.5" /> Download
                  </button>
                  {idx < ordered.length - 1 && (
                    <button
                      onClick={() => setCompare([ordered[idx + 1].v, v.v])}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-canvas"
                    >
                      Compare to v{ordered[idx + 1].v}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {viewing && (
        <DocViewer doc={doc} version={viewing.version} initialMode={viewing.mode} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}
