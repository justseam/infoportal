// Live-AI settings: engine mode, model, and API key.
//
// SECURITY: this is a prototype with no backend. A key entered here is stored
// in this browser's localStorage and sent directly from the browser to
// api.anthropic.com. That is acceptable for local evaluation with a
// throwaway/limited key and is NOT how this would ship — production would
// proxy through a server so the key never reaches the client. The UI says so
// too; do not remove that warning.

import { DEFAULT_MODEL, type ModelId } from './pricing'

export type EngineMode = 'simulated' | 'live'

export interface AISettings {
  mode: EngineMode
  model: ModelId
  apiKey: string
}

const KEY = 'infoportal.ai.settings'

const DEFAULTS: AISettings = {
  // Simulated is the default on purpose: the public demo must work with no
  // key and no network, and the sales demo flow must never depend on one.
  mode: 'simulated',
  model: DEFAULT_MODEL,
  apiKey: '',
}

export function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AISettings>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(s: AISettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* storage unavailable — settings stay in memory for this session */
  }
}

export function clearApiKey(): void {
  const s = loadSettings()
  saveSettings({ ...s, apiKey: '', mode: 'simulated' })
}

/** Live mode only actually engages when a key is present. */
export function isLive(s: AISettings = loadSettings()): boolean {
  return s.mode === 'live' && s.apiKey.trim().length > 0
}

/** Mask a key for display — never render the whole thing. */
export function maskKey(key: string): string {
  if (!key) return '—'
  if (key.length <= 12) return '••••'
  return `${key.slice(0, 7)}…${key.slice(-4)}`
}
