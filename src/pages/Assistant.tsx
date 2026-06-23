import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { askAI, SUGGESTION_GROUPS } from '../lib/ai'
import type { AIResponse } from '../lib/ai'
import { Card, LineChart, Legend } from '../components/ui'
import { IconSparkles, IconSend, IconChevron } from '../components/icons'

interface Turn {
  q: string
  a: AIResponse
}

/** render **bold** and newline/bullet text from the simulated engine */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return null
        const parts = line.split(/\*\*(.+?)\*\*/g)
        return (
          <p key={i} className={line.trim().startsWith('•') ? 'text-sm text-brand-navy' : 'text-sm text-brand-navy'}>
            {parts.map((p, j) => (j % 2 === 1 ? <strong key={j} className="font-bold">{p}</strong> : <span key={j}>{p}</span>))}
          </p>
        )
      })}
    </div>
  )
}

export function Assistant() {
  const { activeClientId, logActivity } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const handledHandoff = useRef(false)

  function submit(text: string) {
    const q = text.trim()
    if (!q || thinking) return
    setInput('')
    setThinking(true)
    logActivity('view', `AI query: "${q}"`)
    // brief simulated latency so it feels like it's working
    setTimeout(() => {
      const a = askAI(q, activeClientId)
      setTurns((prev) => [...prev, { q, a }])
      setThinking(false)
    }, 480)
  }

  // accept query handed off from the dashboard
  useEffect(() => {
    if (handledHandoff.current) return
    const handed = (location.state as { q?: string } | null)?.q
    if (handed) {
      handledHandoff.current = true
      submit(handed)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns, thinking])

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white">
          <IconSparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-brand-navy">AI Assistant</h1>
          <p className="text-xs text-ink-soft">Scoped to your repository · documents, versions &amp; billing</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4 scroll-thin">
        {turns.length === 0 && !thinking && (
          <Card className="p-5">
            <div className="text-sm font-semibold text-brand-navy">Try asking…</div>
            <div className="mt-4 space-y-4">
              {SUGGESTION_GROUPS.map((group) => (
                <div key={group.category}>
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">{group.category}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.prompts.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="rounded-lg border border-line px-3 py-2.5 text-left text-sm text-brand-navy transition hover:border-brand-blue hover:bg-blue-50/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {turns.map((t, i) => (
          <div key={i} className="space-y-3">
            {/* user */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-blue px-4 py-2.5 text-sm font-medium text-white">{t.q}</div>
            </div>
            {/* assistant */}
            <div className="flex gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white">
                <IconSparkles className="h-4 w-4" />
              </div>
              <Card className="max-w-[88%] flex-1 p-4">
                <RichText text={t.a.text} />

                {t.a.chart && (
                  <div className="mt-4 rounded-lg border border-line p-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-soft">{t.a.chart.title}</div>
                    <LineChart series={t.a.chart.series} unit={t.a.chart.unit} />
                    <Legend items={t.a.chart.series.map((s) => s.label)} />
                  </div>
                )}

                {t.a.table && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                          {t.a.table.headers.map((h) => (
                            <th key={h} className="px-2 py-1.5 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.a.table.rows.map((r, ri) => (
                          <tr key={ri} className="border-b border-line/60">
                            {r.map((c, ci) => (
                              <td key={ci} className={`px-2 py-1.5 ${ci === 0 ? 'font-semibold text-brand-navy' : 'text-ink-soft'}`}>{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {t.a.cites.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wide text-ink-soft">Referenced documents</div>
                    {t.a.cites.map((c, ci) => (
                      <button
                        key={ci}
                        onClick={() => navigate(`/app/repository/${c.docId}`)}
                        className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-brand-blue hover:bg-blue-50/40"
                      >
                        <span className="font-semibold text-brand-navy">
                          {c.name}
                          {c.v != null && <span className="ml-1.5 text-xs font-normal text-ink-soft">v{c.v}</span>}
                        </span>
                        <IconChevron className="h-4 w-4 text-ink-soft" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-brand-teal text-white">
              <IconSparkles className="h-4 w-4" />
            </div>
            <Card className="p-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-brand-blue/50" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            </Card>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 border-t border-line bg-canvas pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(input)}
          placeholder="Ask about your documents, versions, or billing…"
          className="flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue"
        />
        <button
          onClick={() => submit(input)}
          disabled={!input.trim() || thinking}
          className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          <IconSend className="h-4 w-4" /> Send
        </button>
      </div>
    </div>
  )
}
