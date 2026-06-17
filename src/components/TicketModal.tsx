import { useState } from 'react'
import { useSession } from '../state/session'
import { IconClose, IconChat } from './icons'

const TYPES = ['New document request', 'Design change', 'Question / issue', 'Other'] as const
const PRIORITIES = ['Low', 'Normal', 'High'] as const

type TicketType = (typeof TYPES)[number]

export function TicketModal({ initialType, onClose }: { initialType?: TicketType; onClose: () => void }) {
  const { persona, activeClientId, logActivity } = useSession()
  const [type, setType] = useState<TicketType>(initialType ?? 'New document request')
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Normal')
  const [subject, setSubject] = useState('')
  const [desc, setDesc] = useState('')
  const [ticketId, setTicketId] = useState<string | null>(null)

  function submit() {
    if (!subject.trim()) return
    // simulated ticket id — TeamSupport-style
    const seq = String(40 + Math.floor((Date.now() / 1000) % 60)).padStart(4, '0')
    const id = `INFOCARE-2026-${seq}`
    setTicketId(id)
    logActivity('edit', `Opened ticket ${id}: ${subject.trim()}`)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white">
              <IconChat className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-sm font-bold text-brand-navy">Open a ticket</div>
              <div className="text-xs text-ink-soft">InfoCARE · one-click via TeamSupport</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-ink-soft hover:bg-canvas">
            <IconClose />
          </button>
        </div>

        {ticketId ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-brand-navy">Ticket submitted</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Your request was created as <span className="font-mono font-semibold text-brand-navy">{ticketId}</span>.
              Your InfoIMAGE team will follow up and you'll be notified of updates.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-canvas">
                Close
              </button>
              <button
                onClick={() => {
                  setTicketId(null)
                  setSubject('')
                  setDesc('')
                }}
                className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Open another
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4">
            <Field label="Request type">
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      type === t ? 'bg-brand-blue text-white' : 'border border-line text-ink-soft hover:text-brand-blue'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your request"
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </Field>

            <Field label="Priority">
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      priority === p ? 'bg-brand-navy text-white' : 'border border-line text-ink-soft hover:text-brand-blue'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Details">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="Describe what you need. Attach references in the next step."
                className="w-full resize-none rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
              />
            </Field>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-ink-soft">
                Submitting as {persona?.name}
                {activeClientId ? '' : ' (staff)'}
              </span>
              <button
                onClick={submit}
                disabled={!subject.trim()}
                className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                Submit ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</div>
      {children}
    </div>
  )
}
