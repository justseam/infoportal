import type { Doc, DocVersion } from '../data/types'
import { CLIENTS } from '../data/mock'
import { IconClose, IconDownload } from './icons'
import { FileBadge } from './ui'
import { useSession } from '../state/session'

/** A faux document preview — renders a believable page for the demo. */
export function DocViewer({ doc, version, onClose }: { doc: Doc; version: DocVersion; onClose: () => void }) {
  const { logActivity } = useSession()
  const client = CLIENTS.find((c) => c.id === doc.clientId)
  const accent = client?.accent ?? '#2463d0'
  const isDesign = doc.category.includes('Design')
  const isTax = doc.category === 'Tax Forms'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
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
              onClick={() => logActivity('download', `${doc.name} v${version.v}`)}
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

        {/* faux page */}
        <div className="overflow-y-auto bg-canvas p-8 scroll-thin">
          <div className="mx-auto w-full max-w-[640px] rounded-md bg-white p-10 shadow-md ring-1 ring-line">
            <div className="flex items-start justify-between border-b-2 pb-4" style={{ borderColor: accent }}>
              <div>
                <div className="text-lg font-extrabold" style={{ color: accent }}>
                  {client?.name}
                </div>
                <div className="text-xs text-ink-soft">{doc.category}</div>
              </div>
              <div className="text-right text-xs text-ink-soft">
                <div className="font-semibold text-brand-navy">{isTax ? 'TAX YEAR 2025' : 'STATEMENT PERIOD'}</div>
                <div>{version.date}</div>
                <div className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">v{version.v} · DRAFT PREVIEW</div>
              </div>
            </div>

            {isDesign && (
              <div className="mt-6 space-y-3">
                <div className="h-3 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {['Beginning Balance', 'Deposits', 'Ending Balance'].map((l) => (
                    <div key={l} className="rounded-md border border-line p-3">
                      <div className="text-[10px] uppercase tracking-wide text-ink-soft">{l}</div>
                      <div className="mt-1 h-4 w-3/4 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                      <div className="h-2.5 w-16 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isTax && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['Payer TIN', 'Recipient TIN', 'Box 1 — Interest income', 'Box 4 — Fed. tax withheld'].map((l) => (
                  <div key={l} className="rounded-md border border-line p-3">
                    <div className="text-[10px] uppercase tracking-wide text-ink-soft">{l}</div>
                    <div className="mt-1 h-4 w-2/3 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            )}

            {!isDesign && !isTax && (
              <div className="mt-6 space-y-2.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-2.5 rounded bg-slate-100" style={{ width: `${90 - (i % 3) * 18}%` }} />
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-line pt-3 text-center text-[10px] text-ink-soft">
              Powered by InfoIMAGE · This is a simulated preview for prototype purposes only
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-[640px] rounded-lg border border-line bg-white p-3 text-sm">
            <span className="font-semibold text-brand-navy">v{version.v} change note: </span>
            <span className="text-ink-soft">{version.note}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
