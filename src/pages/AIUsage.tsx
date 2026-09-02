// AI usage & cost dashboard. Super Admin only — see the guard in App.tsx and
// the nav filter in Layout.tsx. Every figure here comes from the `usage` object
// the Claude API returned on a real call; nothing on this page is simulated.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { CLIENTS } from '../data/mock'
import {
  byDay,
  byModel,
  byTool,
  clearUsage,
  loadUsage,
  projectMonthly,
  summarize,
  type UsageRecord,
} from '../lib/usageStore'
import { formatTokens, formatUSD, modelInfo, MODELS } from '../lib/pricing'
import { loadSettings, isLive, maskKey } from '../lib/aiSettings'
import { Card, SectionTitle, Badge, LineChart } from '../components/ui'

type Range = 7 | 30 | 0 // 0 = all time

export function AIUsage() {
  const { persona } = useSession()
  const [records, setRecords] = useState<UsageRecord[]>(() => loadUsage())
  const [range, setRange] = useState<Range>(30)
  const [users, setUsers] = useState(25)
  const [turnsPer, setTurnsPer] = useState(8)

  const refresh = useCallback(() => setRecords(loadUsage()), [])

  useEffect(() => {
    window.addEventListener('infoportal:usage', refresh)
    return () => window.removeEventListener('infoportal:usage', refresh)
  }, [refresh])

  const settings = loadSettings()
  const live = isLive(settings)

  const scoped = useMemo(() => {
    if (range === 0) return records
    const cutoff = Date.now() - range * 86_400_000
    return records.filter((r) => new Date(r.at).getTime() >= cutoff)
  }, [records, range])

  const s = useMemo(() => summarize(scoped), [scoped])
  const trend = useMemo(() => byDay(scoped), [scoped])
  const models = useMemo(() => byModel(scoped), [scoped])
  const tools = useMemo(() => byTool(scoped), [scoped])

  // Defence in depth: the route guard is the real gate, but a component that
  // renders cost data should refuse to render for the wrong role on its own.
  if (persona?.role !== 'super') return <Navigate to="/app" replace />

  const projected = projectMonthly(s.avgCostPerTurn, users, turnsPer)

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle sub="Token consumption and spend for the live Claude API integration · visible to Super Admin only">
        AI Usage &amp; Cost
      </SectionTitle>

      {/* status strip */}
      <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={live ? 'green' : 'slate'}>{live ? 'Live mode active' : 'Simulated mode'}</Badge>
          <span className="text-sm text-ink-soft">
            Model <span className="font-semibold text-brand-navy">{modelInfo(settings.model).label}</span>
          </span>
          <span className="text-sm text-ink-soft">
            Key <span className="font-mono text-xs text-brand-navy">{maskKey(settings.apiKey)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30, 0] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                range === r ? 'bg-brand-blue text-white' : 'border border-line bg-white text-ink-soft hover:text-brand-blue'
              }`}
            >
              {r === 0 ? 'All time' : `${r} days`}
            </button>
          ))}
        </div>
      </Card>

      {!live && (
        <Card className="mb-5 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Live mode is off, so no new usage is being recorded. Turn it on under{' '}
          <span className="font-semibold">Admin &amp; Audit → AI Settings</span> with an API key. Any
          figures below are from earlier live sessions.
        </Card>
      )}

      {records.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-sm font-semibold text-brand-navy">No API calls recorded yet</div>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            Enable live mode in Admin &amp; Audit, then ask the AI Assistant a question. Every call
            logs its real token usage and cost here.
          </p>
        </Card>
      ) : (
        <>
          {/* headline stats */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total spend" value={formatUSD(s.totalCost)} sub={`${s.calls} API calls`} />
            <Stat
              label="Cost per question"
              value={formatUSD(s.avgCostPerTurn)}
              sub={`${s.turns} question${s.turns === 1 ? '' : 's'}`}
              tone="blue"
            />
            <Stat
              label="Cache hit rate"
              value={`${Math.round(s.cacheHitRate * 100)}%`}
              sub={`${formatTokens(s.cacheReadTokens)} tokens read from cache`}
              tone={s.cacheHitRate > 0.5 ? 'green' : 'amber'}
            />
            <Stat
              label="Avg latency"
              value={`${(s.avgLatencyMs / 1000).toFixed(1)}s`}
              sub={s.errors ? `${s.errors} failed call${s.errors === 1 ? '' : 's'}` : 'no failures'}
              tone={s.errors ? 'red' : 'slate'}
            />
          </div>

          <div className="mb-5 grid gap-5 lg:grid-cols-3">
            {/* spend trend */}
            <Card className="p-5 lg:col-span-2">
              <div className="mb-1 text-sm font-bold text-brand-navy">Spend by day</div>
              <div className="mb-3 text-xs text-ink-soft">Actual billed cost per calendar day</div>
              {trend.length > 1 ? (
                <LineChart series={[{ label: 'Cost', points: trend }]} unit="$" height={190} />
              ) : (
                <div className="py-10 text-center text-sm text-ink-soft">
                  Need at least two days of activity to plot a trend.
                </div>
              )}
            </Card>

            {/* token split */}
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold text-brand-navy">Token breakdown</div>
              <TokenBar
                rows={[
                  { label: 'Input (uncached)', value: s.inputTokens, color: '#2463d0' },
                  { label: 'Cache read', value: s.cacheReadTokens, color: '#0ea5e9' },
                  { label: 'Cache write', value: s.cacheCreationTokens, color: '#7c3aed' },
                  { label: 'Output', value: s.outputTokens, color: '#0e7c5a' },
                ]}
              />
              <p className="mt-3 text-xs text-ink-soft">
                Cache reads bill at ~10% of the input rate. A high cache-read share is what keeps
                cost per question low.
              </p>
            </Card>
          </div>

          {/* projection */}
          <Card className="mb-5 p-5">
            <div className="mb-1 text-sm font-bold text-brand-navy">Monthly projection</div>
            <div className="mb-4 text-xs text-ink-soft">
              Based on your measured {formatUSD(s.avgCostPerTurn)} per question — not an estimate.
            </div>
            <div className="flex flex-wrap items-end gap-5">
              <NumberField label="Users" value={users} onChange={setUsers} min={1} max={5000} />
              <NumberField
                label="Questions / user / month"
                value={turnsPer}
                onChange={setTurnsPer}
                min={1}
                max={500}
              />
              <div className="rounded-xl bg-brand-navy px-5 py-3 text-white">
                <div className="text-[11px] uppercase tracking-wide text-white/60">Projected / month</div>
                <div className="text-2xl font-extrabold">{formatUSD(projected)}</div>
                <div className="text-[11px] text-white/60">
                  {(users * turnsPer).toLocaleString()} questions
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {MODELS.map((m) => {
                const ratio = m.inputPerM / modelInfo(settings.model).inputPerM
                return (
                  <div
                    key={m.id}
                    className={`rounded-lg border px-3 py-2.5 text-sm ${
                      m.id === settings.model ? 'border-brand-blue bg-blue-50/50' : 'border-line'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-navy">{m.label}</span>
                      {m.id === settings.model && <Badge tone="blue">current</Badge>}
                    </div>
                    <div className="mt-0.5 text-ink-soft">≈ {formatUSD(projected * ratio)} / month</div>
                    <div className="mt-1 text-[11px] text-ink-soft">{m.blurb}</div>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              Other-model figures scale your observed usage by the published input-rate ratio — a
              planning guide, not a quote. Output-heavy workloads will differ.
            </p>
          </Card>

          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 text-sm font-bold text-brand-navy">By model</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-2 font-semibold">Model</th>
                    <th className="py-2 text-right font-semibold">Calls</th>
                    <th className="py-2 text-right font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.model} className="border-b border-line/60">
                      <td className="py-2 font-semibold text-brand-navy">{modelInfo(m.model).label}</td>
                      <td className="py-2 text-right text-ink-soft">{m.calls}</td>
                      <td className="py-2 text-right text-ink-soft">{formatUSD(m.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="p-5">
              <div className="mb-3 text-sm font-bold text-brand-navy">Tools called</div>
              {tools.length === 0 ? (
                <div className="py-6 text-sm text-ink-soft">No tool calls recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {tools.map((t) => (
                    <div key={t.tool} className="flex items-center gap-3">
                      <span className="w-52 shrink-0 truncate font-mono text-xs text-brand-navy">{t.tool}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                        <div
                          className="h-full rounded-full bg-brand-teal"
                          style={{ width: `${(t.count / tools[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-ink-soft">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* raw call log */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="text-sm font-bold text-brand-navy">Call log</div>
              <button
                onClick={() => {
                  if (confirm('Clear all recorded usage history? This cannot be undone.')) clearUsage()
                }}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-red-300 hover:text-red-600"
              >
                Clear history
              </button>
            </div>
            <div className="max-h-96 overflow-auto scroll-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-2.5 font-semibold">Time</th>
                    <th className="px-3 py-2.5 font-semibold">Question</th>
                    <th className="px-3 py-2.5 font-semibold">Tools</th>
                    <th className="px-3 py-2.5 text-right font-semibold">In</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Cached</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Out</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {scoped.map((r) => (
                    <tr key={r.id} className="border-b border-line/60 hover:bg-canvas">
                      <td className="whitespace-nowrap px-5 py-2 text-xs text-ink-soft">
                        {new Date(r.at).toLocaleTimeString()}
                        {!r.ok && <span className="ml-1 font-semibold text-red-600">failed</span>}
                      </td>
                      <td className="max-w-xs truncate px-3 py-2 text-brand-navy" title={r.question}>
                        {r.question}
                        {r.clientId && (
                          <span className="ml-1.5 text-xs text-ink-soft">
                            · {CLIENTS.find((c) => c.id === r.clientId)?.shortName}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-ink-soft">
                        {r.toolsCalled.join(', ') || '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-ink-soft">{formatTokens(r.inputTokens)}</td>
                      <td className="px-3 py-2 text-right text-ink-soft">{formatTokens(r.cacheReadTokens)}</td>
                      <td className="px-3 py-2 text-right text-ink-soft">{formatTokens(r.outputTokens)}</td>
                      <td className="px-5 py-2 text-right font-semibold text-brand-navy">
                        {formatUSD(r.costUsd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line bg-canvas px-5 py-3 text-xs text-ink-soft">
              One row per API call. A question that triggers a tool produces two rows — the model's
              tool request, then its answer once the result comes back. Usage is stored in this
              browser only; it is not sent anywhere.
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  tone = 'slate',
}: {
  label: string
  value: string
  sub: string
  tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red'
}) {
  const color: Record<string, string> = {
    slate: 'text-brand-navy',
    blue: 'text-brand-blue',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  }
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${color[tone]}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-soft">{sub}</div>
    </Card>
  )
}

function TokenBar({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1
  return (
    <div>
      <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-canvas">
        {rows.map((r) => (
          <div key={r.label} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} />
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-semibold text-brand-navy">{formatTokens(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))))
        }}
        className="w-40 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
      />
    </label>
  )
}
