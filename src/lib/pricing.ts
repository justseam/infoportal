// Claude API pricing + cost math for the usage dashboard.
//
// Rates are $ per 1,000,000 tokens, from the Anthropic pricing page. They are
// hardcoded on purpose: the app has no server to fetch them from, and a demo
// should never silently reprice itself. Update MODELS when rates change.

export type ModelId = 'claude-opus-5' | 'claude-sonnet-5' | 'claude-haiku-4-5'

export interface ModelInfo {
  id: ModelId
  label: string
  inputPerM: number
  outputPerM: number
  /** Minimum cacheable prefix. A shorter prefix silently does NOT cache. */
  cacheMinTokens: number
  blurb: string
}

export const MODELS: ModelInfo[] = [
  {
    id: 'claude-opus-5',
    label: 'Claude Opus 5',
    inputPerM: 5,
    outputPerM: 25,
    cacheMinTokens: 512,
    blurb: 'Most capable. Best judgment on ambiguous questions.',
  },
  {
    id: 'claude-sonnet-5',
    label: 'Claude Sonnet 5',
    inputPerM: 3,
    outputPerM: 15,
    cacheMinTokens: 1024,
    blurb: 'Strong quality at ~60% of Opus cost. Good default.',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    inputPerM: 1,
    outputPerM: 5,
    cacheMinTokens: 4096,
    blurb: 'Cheapest and fastest. Note the 4,096-token cache floor.',
  },
]

export const DEFAULT_MODEL: ModelId = 'claude-sonnet-5'

export function modelInfo(id: string): ModelInfo {
  return MODELS.find((m) => m.id === id) ?? MODELS[1]
}

/** Cache reads bill at ~10% of the base input rate. */
const CACHE_READ_MULTIPLIER = 0.1
/** Cache writes bill at 1.25x (5-minute TTL) or 2x (1-hour TTL). */
export const CACHE_WRITE_MULTIPLIER_5M = 1.25
export const CACHE_WRITE_MULTIPLIER_1H = 2.0

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
}

/**
 * Dollar cost of one API call. `input_tokens` from the API is the *uncached
 * remainder* — cached tokens are reported separately and must be priced at
 * their own rates, not folded into the input count.
 */
export function costOf(usage: TokenUsage, model: string, cacheTtlHours = 1): number {
  const m = modelInfo(model)
  const writeMult = cacheTtlHours >= 1 ? CACHE_WRITE_MULTIPLIER_1H : CACHE_WRITE_MULTIPLIER_5M
  return (
    (usage.inputTokens / 1e6) * m.inputPerM +
    (usage.cacheCreationTokens / 1e6) * m.inputPerM * writeMult +
    (usage.cacheReadTokens / 1e6) * m.inputPerM * CACHE_READ_MULTIPLIER +
    (usage.outputTokens / 1e6) * m.outputPerM
  )
}

/** Total prompt size = uncached + cache-write + cache-read. */
export function totalInputTokens(u: TokenUsage): number {
  return u.inputTokens + u.cacheCreationTokens + u.cacheReadTokens
}

export function formatUSD(n: number): string {
  if (n === 0) return '$0.00'
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1) return `$${n.toFixed(3)}`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(2)}M`
}
