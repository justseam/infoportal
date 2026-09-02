// Live Claude API integration: manual tool-use loop with per-call usage capture.
//
// A manual loop rather than the SDK's beta tool runner, because we need to
// record `usage` from every individual API call for the cost dashboard, and
// the loop is short enough that owning it is cheaper than working around the
// runner's abstraction.

import Anthropic from '@anthropic-ai/sdk'
import { runTool, SYSTEM_PROMPT, TOOL_SCHEMAS } from './tools'
import { recordUsage } from './usageStore'
import { costOf } from './pricing'
import type { AISettings } from './aiSettings'
import type { AICite, AIResponse } from './ai'
import { DOCS } from '../data/mock'

const MAX_TOOL_ROUNDS = 5
/** Non-streaming: keep max_tokens under the SDK's HTTP timeout comfort zone. */
const MAX_TOKENS = 8000

function client(apiKey: string) {
  return new Anthropic({
    apiKey,
    // No backend exists in this prototype, so the call goes browser -> API.
    // See aiSettings.ts for why this is acceptable here and not in production.
    dangerouslyAllowBrowser: true,
  })
}

/** Documents the tools surfaced, so the answer can link to them like the simulated engine does. */
function citesFromToolResults(results: unknown[], clientId: string | null): AICite[] {
  const ids = new Set<string>()
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) return v.forEach(walk)
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>
      if (typeof o.id === 'string' && o.id.startsWith('d-')) ids.add(o.id)
      Object.values(o).forEach(walk)
    }
  }
  results.forEach(walk)
  return [...ids]
    .map((id) => DOCS.find((d) => d.id === id && (!clientId || d.clientId === clientId)))
    .filter((d): d is NonNullable<typeof d> => !!d)
    .slice(0, 8)
    .map((d) => ({ docId: d.id, name: d.name, v: d.versions[d.versions.length - 1].v }))
}

export interface LiveAskOptions {
  settings: AISettings
  clientId: string | null
  user: string
}

/**
 * Ask Claude with tools. Loops until the model stops requesting tools, logging
 * a usage record per API call. Throws on API failure so the caller can fall
 * back to the simulated engine.
 */
export async function askClaude(
  question: string,
  { settings, clientId, user }: LiveAskOptions,
): Promise<AIResponse> {
  const anthropic = client(settings.apiKey)
  const turnId = `t${Date.now().toString(36)}`
  const model = settings.model

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: question }]
  const toolResults: unknown[] = []
  const toolsCalled: string[] = []

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const started = performance.now()
    let response: Anthropic.Message
    try {
      response = await anthropic.messages.create({
        model,
        max_tokens: MAX_TOKENS,
        // Cache the system prompt + tool schemas: stable across every call, so
        // after the first request this prefix bills at ~10% of input rate.
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        tools: TOOL_SCHEMAS as unknown as Anthropic.Tool[],
        messages,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      recordUsage({
        turnId,
        model,
        leg: round === 0 ? 'initial' : 'after_tools',
        question,
        toolsCalled,
        latencyMs: Math.round(performance.now() - started),
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        clientId,
        user,
        ok: false,
        error: message,
      })
      throw err
    }

    const usage = {
      inputTokens: response.usage.input_tokens ?? 0,
      outputTokens: response.usage.output_tokens ?? 0,
      cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    }
    const roundTools = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((b) => b.name)
    toolsCalled.push(...roundTools)

    recordUsage({
      turnId,
      model,
      leg: round === 0 ? 'initial' : 'after_tools',
      question,
      toolsCalled: roundTools,
      latencyMs: Math.round(performance.now() - started),
      ...usage,
      costUsd: costOf(usage, model),
      clientId,
      user,
      ok: true,
    })

    // A server-side tool loop can pause; re-send to resume. No extra user turn.
    if (response.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: response.content })
      continue
    }

    if (response.stop_reason === 'refusal') {
      return {
        text: 'I was not able to answer that request. Try rephrasing it, or ask about your documents, versions, or billing.',
        cites: [],
        suggestions: [],
      }
    }

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )

    if (toolUses.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim()
      return {
        text: text || 'I did not get a usable answer back. Please try again.',
        cites: citesFromToolResults(toolResults, clientId),
        suggestions: [],
      }
    }

    // Execute every requested tool, then return ALL results in one user turn —
    // splitting them across messages trains the model out of parallel calls.
    messages.push({ role: 'assistant', content: response.content })
    const resultBlocks: Anthropic.ToolResultBlockParam[] = toolUses.map((t) => {
      let result: unknown
      try {
        result = runTool(t.name, (t.input ?? {}) as Record<string, unknown>, clientId)
      } catch (err) {
        result = { error: err instanceof Error ? err.message : 'Tool failed.' }
      }
      toolResults.push(result)
      return {
        type: 'tool_result',
        tool_use_id: t.id,
        content: JSON.stringify(result),
      }
    })
    messages.push({ role: 'user', content: resultBlocks })
  }

  return {
    text: 'That question needed more lookups than I am allowed to run in one turn. Try narrowing it down.',
    cites: citesFromToolResults(toolResults, clientId),
    suggestions: [],
  }
}

/** Cheap credential check — one tiny call, so a bad key fails fast in settings. */
export async function testConnection(
  apiKey: string,
  model: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await client(apiKey).messages.create({
      model,
      max_tokens: 16,
      messages: [{ role: 'user', content: 'Reply with the single word: ready' }],
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
