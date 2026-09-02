// Per-call token usage + cost log, persisted to localStorage.
//
// One record per API call (a single question that triggers a tool round-trip
// produces two records, linked by turnId). The usage dashboard aggregates
// these; nothing here is simulated — every field comes from the API's own
// `usage` object.

import { costOf, totalInputTokens, type TokenUsage } from './pricing'

export interface UsageRecord extends TokenUsage {
  id: string
  turnId: string
  at: string // ISO timestamp
  model: string
  /** which leg of the turn: the initial ask, or the follow-up after tools ran */
  leg: 'initial' | 'after_tools'
  question: string
  toolsCalled: string[]
  latencyMs: number
  costUsd: number
  clientId: string | null
  user: string
  ok: boolean
  error?: string
}

const KEY = 'infoportal.ai.usage'
const MAX_RECORDS = 500

let seq = 0

export function loadUsage(): UsageRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as UsageRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(records: UsageRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS)))
  } catch {
    /* quota exceeded — drop silently rather than break the assistant */
  }
}

export function recordUsage(
  entry: Omit<UsageRecord, 'id' | 'at' | 'costUsd'> & { costUsd?: number },
): UsageRecord {
  seq += 1
  const record: UsageRecord = {
    ...entry,
    id: `u${Date.now().toString(36)}${seq}`,
    at: new Date().toISOString(),
    costUsd: entry.costUsd ?? costOf(entry, entry.model),
  }
  persist([record, ...loadUsage()])
  window.dispatchEvent(new CustomEvent('infoportal:usage'))
  return record
}

export function clearUsage(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('infoportal:usage'))
}

// ---- aggregation for the dashboard --------------------------------------

export interface UsageSummary {
  calls: number
  turns: number
  totalCost: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  avgCostPerTurn: number
  avgLatencyMs: number
  errors: number
  cacheHitRate: number
}

export function summarize(records: UsageRecord[]): UsageSummary {
  const turns = new Set(records.map((r) => r.turnId)).size
  const totalCost = records.reduce((s, r) => s + r.costUsd, 0)
  const cacheRead = records.reduce((s, r) => s + r.cacheReadTokens, 0)
  const allInput = records.reduce((s, r) => s + totalInputTokens(r), 0)
  const okRecords = records.filter((r) => r.ok)
  return {
    calls: records.length,
    turns,
    totalCost,
    inputTokens: records.reduce((s, r) => s + r.inputTokens, 0),
    outputTokens: records.reduce((s, r) => s + r.outputTokens, 0),
    cacheReadTokens: cacheRead,
    cacheCreationTokens: records.reduce((s, r) => s + r.cacheCreationTokens, 0),
    avgCostPerTurn: turns ? totalCost / turns : 0,
    avgLatencyMs: okRecords.length
      ? okRecords.reduce((s, r) => s + r.latencyMs, 0) / okRecords.length
      : 0,
    errors: records.filter((r) => !r.ok).length,
    cacheHitRate: allInput ? cacheRead / allInput : 0,
  }
}

/** Cost per calendar day, oldest first — for the trend chart. */
export function byDay(records: UsageRecord[]): { x: string; y: number }[] {
  const map = new Map<string, number>()
  for (const r of records) {
    const day = r.at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + r.costUsd)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, cost]) => ({
      x: new Date(`${day}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: Number(cost.toFixed(6)),
    }))
}

export function byModel(records: UsageRecord[]): { model: string; calls: number; cost: number }[] {
  const map = new Map<string, { calls: number; cost: number }>()
  for (const r of records) {
    const e = map.get(r.model) ?? { calls: 0, cost: 0 }
    e.calls += 1
    e.cost += r.costUsd
    map.set(r.model, e)
  }
  return [...map.entries()]
    .map(([model, e]) => ({ model, ...e }))
    .sort((a, b) => b.cost - a.cost)
}

export function byTool(records: UsageRecord[]): { tool: string; count: number }[] {
  const map = new Map<string, number>()
  for (const r of records) for (const t of r.toolsCalled) map.set(t, (map.get(t) ?? 0) + 1)
  return [...map.entries()]
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count)
}

/** Project a monthly bill from observed per-turn cost. */
export function projectMonthly(
  avgCostPerTurn: number,
  users: number,
  turnsPerUserPerMonth: number,
): number {
  return avgCostPerTurn * users * turnsPerUserPerMonth
}
