import { useState } from 'react'
import type { Doc, DocVersion } from '../data/types'
import { CLIENTS } from '../data/mock'
import { getFieldMap, TEMPLATE_KEYS } from '../data/fieldMaps'
import type { FieldMapping } from '../data/fieldMaps'
import { IconClose, IconDownload, IconLock } from './icons'
import { FileBadge } from './ui'
import { useSession } from '../state/session'

type Mode = 'sample' | 'mapping'

/** A variable field rendered either as its sample value or as a data token. */
function Var({ field, mode }: { field: FieldMapping; mode: Mode }) {
  if (mode === 'mapping') {
    return (
      <span className="rounded bg-blue-50 px-1 py-0.5 font-mono text-[11px] font-semibold text-brand-blue ring-1 ring-blue-100">
        {`{{${field.key}}}`}
      </span>
    )
  }
  return (
    <span className="rounded bg-amber-50 px-1 py-0.5 text-ink underline decoration-dotted decoration-amber-300 underline-offset-2">
      {field.sample}
    </span>
  )
}

const INTRO: Record<string, string> = {
  'Notice Designs': 'This notice concerns the account identified below.',
  'Statement Designs': 'Account summary for the statement period shown.',
  'Tax Forms': 'This form reports the amounts below for the tax year shown.',
}

/** The faux document, rendered with live variable fields. */
function DocTemplate({ doc, version, fields, mode }: { doc: Doc; version: DocVersion; fields: FieldMapping[]; mode: Mode }) {
  const client = CLIENTS.find((c) => c.id === doc.clientId)
  const accent = client?.accent ?? '#2463d0'
  const byKey = (k: string) => fields.find((f) => f.key === k)
  const name = byKey('member_name')
  const addr = byKey('member_address')
  const acct = byKey('acct_masked')
  const acctType = byKey('acct_type')
  const date = byKey('run_date')
  const details = fields.filter((f) => !TEMPLATE_KEYS.includes(f.key))
  const dateLabel = doc.category === 'Tax Forms' ? 'TAX YEAR' : doc.category === 'Statement Designs' ? 'STATEMENT DATE' : 'NOTICE DATE'

  return (
    <div className="mx-auto w-full max-w-[640px] rounded-md bg-white p-9 shadow-md ring-1 ring-line">
      <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: accent }}>
        <div>
          <div className="text-lg font-extrabold" style={{ color: accent }}>
            {client?.name}
          </div>
          <div className="text-xs text-ink-soft">{doc.name.replace(' — Design', '').replace(' — Layout', '')}</div>
        </div>
        <div className="text-right text-xs text-ink-soft">
          <div className="font-semibold text-brand-navy">{dateLabel}</div>
          <div>{date ? <Var field={date} mode={mode} /> : version.date}</div>
          <div className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">
            v{version.v} · {mode === 'mapping' ? 'MAPPED' : 'SAMPLE'}
          </div>
        </div>
      </div>

      {/* recipient block */}
      <div className="mt-5 text-sm leading-relaxed text-ink">
        {name && (
          <div className="font-semibold text-brand-navy">
            <Var field={name} mode={mode} />
          </div>
        )}
        {addr && (
          <div className="mt-0.5">
            <Var field={addr} mode={mode} />
          </div>
        )}
        {(acct || acctType) && (
          <div className="mt-2 text-ink-soft">
            Account: {acct && <Var field={acct} mode={mode} />}
            {acctType && (
              <>
                {' · '}
                <Var field={acctType} mode={mode} />
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-5 text-sm text-ink">{INTRO[doc.category] ?? ''}</p>

      {/* detail fields */}
      {details.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {details.map((field) => (
            <div key={field.key} className="rounded-md border border-line p-3">
              <div className="text-[10px] uppercase tracking-wide text-ink-soft">{field.label}</div>
              <div className="mt-1 text-sm">
                <Var field={field} mode={mode} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-line pt-3 text-center text-[10px] text-ink-soft">
        Powered by InfoIMAGE · Simulated {mode === 'mapping' ? 'field-mapping' : 'sample'} preview for prototype purposes only
      </div>
    </div>
  )
}

/** Plain skeleton for static documents (contracts, legal, assets, statement runs). */
function PlainDoc({ doc, version }: { doc: Doc; version: DocVersion }) {
  const client = CLIENTS.find((c) => c.id === doc.clientId)
  const accent = client?.accent ?? '#2463d0'
  return (
    <div className="mx-auto w-full max-w-[640px] rounded-md bg-white p-9 shadow-md ring-1 ring-line">
      <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: accent }}>
        <div>
          <div className="text-lg font-extrabold" style={{ color: accent }}>
            {client?.name}
          </div>
          <div className="text-xs text-ink-soft">{doc.category}</div>
        </div>
        <div className="text-right text-xs text-ink-soft">
          <div>{version.date}</div>
          <div className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">v{version.v}</div>
        </div>
      </div>
      <div className="mt-6 space-y-2.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-2.5 rounded bg-slate-100" style={{ width: `${90 - (i % 3) * 18}%` }} />
        ))}
      </div>
      <div className="mt-8 border-t border-line pt-3 text-center text-[10px] text-ink-soft">
        Powered by InfoIMAGE · Simulated preview for prototype purposes only
      </div>
    </div>
  )
}

function FieldTable({ fields }: { fields: FieldMapping[] }) {
  return (
    <div className="mx-auto mt-4 max-w-[640px] overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-blue-50/60 px-4 py-2.5">
        <IconLock className="h-4 w-4 text-brand-blue" />
        <span className="text-sm font-bold text-brand-navy">Field mapping</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-blue">
          Internal only
        </span>
        <span className="ml-auto text-xs text-ink-soft">{fields.length} fields</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-2 font-semibold">Field</th>
              <th className="px-3 py-2 font-semibold">Token</th>
              <th className="px-3 py-2 font-semibold">Source</th>
              <th className="px-3 py-2 font-semibold">Format</th>
              <th className="px-4 py-2 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.key} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-2 font-semibold text-brand-navy">{f.label}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] text-brand-blue">{`{{${f.key}}}`}</span>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-ink-soft">{f.source}</td>
                <td className="px-3 py-2 font-mono text-xs text-ink-soft">{f.format}</td>
                <td className="px-4 py-2 text-ink-soft">{f.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DocViewer({
  doc,
  version,
  onClose,
  initialMode = 'sample',
}: {
  doc: Doc
  version: DocVersion
  onClose: () => void
  initialMode?: Mode
}) {
  const { isStaff, logActivity } = useSession()
  const fields = getFieldMap(doc, version.v)
  const canMap = isStaff && !!fields
  const [mode, setMode] = useState<Mode>(canMap && initialMode === 'mapping' ? 'mapping' : 'sample')

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-3">
            <FileBadge type={doc.fileType} />
            <div>
              <div className="text-sm font-bold text-brand-navy">{doc.name}</div>
              <div className="text-xs text-ink-soft">
                Version {version.v} · {version.date} · {version.sizeKB.toLocaleString()} KB
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => logActivity('download', `${doc.name} v${version.v} (${mode === 'mapping' ? 'field map' : 'sample'})`)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <IconDownload className="h-4 w-4" />
              Download
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-ink-soft hover:bg-canvas">
              <IconClose />
            </button>
          </div>
        </div>

        {/* mode toggle (internal staff only, data-driven docs only) */}
        {canMap && (
          <div className="flex items-center gap-3 border-b border-line bg-canvas px-5 py-2.5">
            <div className="inline-flex rounded-lg border border-line bg-white p-0.5">
              <button
                onClick={() => setMode('sample')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${mode === 'sample' ? 'bg-brand-blue text-white' : 'text-ink-soft hover:text-brand-blue'}`}
              >
                Sample
              </button>
              <button
                onClick={() => setMode('mapping')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${mode === 'mapping' ? 'bg-brand-blue text-white' : 'text-ink-soft hover:text-brand-blue'}`}
              >
                <IconLock className="h-3.5 w-3.5" /> Field Mapping
              </button>
            </div>
            <span className="text-xs text-ink-soft">
              {mode === 'mapping' ? 'Internal view — clients see only the Sample' : 'Client-facing view'}
            </span>
          </div>
        )}

        {/* body */}
        <div className="overflow-y-auto bg-canvas p-6 scroll-thin">
          {/* mode banner */}
          {fields && (
            <div
              className={`mx-auto mb-4 flex max-w-[640px] items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                mode === 'mapping' ? 'border-blue-200 bg-blue-50 text-brand-deep' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {mode === 'mapping' ? <IconLock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
              <span>
                {mode === 'mapping'
                  ? 'Field mapping (internal only) — variable spots show as data tokens with their source and format. Clients only see the Sample.'
                  : 'Sample document — variable fields are highlighted and filled with example values, exactly as the member would receive it.'}
              </span>
            </div>
          )}

          {fields ? <DocTemplate doc={doc} version={version} fields={fields} mode={mode} /> : <PlainDoc doc={doc} version={version} />}

          {mode === 'mapping' && fields && <FieldTable fields={fields} />}

          <div className="mx-auto mt-4 max-w-[640px] rounded-lg border border-line bg-white p-3 text-sm">
            <span className="font-semibold text-brand-navy">v{version.v} change note: </span>
            <span className="text-ink-soft">{version.note}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
