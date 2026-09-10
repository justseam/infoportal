// Tool definitions + local executors for the live Claude integration.
//
// The whole point of this layer is that the model never receives the document
// catalog. It asks a question, the tool runs locally against the repository,
// and only the answer goes back into context. That keeps a session's token
// cost flat as the repository grows — a client with 10,000 documents costs the
// same per question as one with 126.

import { DOCS, INVOICES, CLIENTS, MONTH_LABEL } from '../data/mock'
import { HELP_DOCS, productName } from '../data/help'
import type { Doc } from '../data/types'

const DAY_MS = 86_400_000

export interface ToolSchema {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

/** Every tool the assistant can call, with the trigger condition spelled out. */
export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    name: 'find_stale_documents',
    description:
      'Find documents that have NOT been updated within a given number of days. Call this whenever the user asks what is stale, overdue, missed, out of date, or "not updated in the last N days" — for example after a bulk compliance update, to find the documents that were skipped.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'integer', description: 'Window in days. Default 30.' },
        category: {
          type: 'string',
          description:
            'Optional category filter, e.g. "Notice Designs", "Statement Designs", "Tax Forms", "Contracts".',
        },
      },
    },
  },
  {
    name: 'find_recently_updated',
    description:
      'Find documents that HAVE been updated within a given number of days, newest first. Call this for "what changed recently", "what was updated this month", or to show evidence that a remediation actually happened.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'integer', description: 'Window in days. Default 30.' },
        category: { type: 'string', description: 'Optional category filter.' },
        limit: { type: 'integer', description: 'Max documents to return. Default 15.' },
      },
    },
  },
  {
    name: 'search_documents',
    description:
      'Search the client repository by document name, tag, or category. Call this to locate a specific document before asking about its versions.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search over name and tags.' },
        category: { type: 'string', description: 'Optional category filter.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_version_history',
    description:
      'Get the full version history of one document — every version with its date, author, and changelog note. Call this when the user asks when something last changed or what its history looks like.',
    input_schema: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: 'The document id from search_documents, e.g. "d-summit-notice-nsf".',
        },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'compare_versions',
    description:
      'Compare two versions of one document and return what changed between them.',
    input_schema: {
      type: 'object',
      properties: {
        document_id: { type: 'string' },
        from_version: { type: 'integer' },
        to_version: { type: 'integer' },
      },
      required: ['document_id', 'from_version', 'to_version'],
    },
  },
  {
    name: 'get_documents_by_source',
    description:
      "Group data-driven documents (notices, statement designs, tax forms) by the SYSTEM that produces their data file, and say whether that system is the FI's core processor. Call this for any question about where documents come from, which are core vs non-core, what is built in house, ancillary/vendor systems, or scoping a core conversion.",
    input_schema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description:
            "Which side to return: 'core', 'non-core', or 'all' for the full breakdown. Default 'all'.",
        },
        category: {
          type: 'string',
          description: "Optional category filter, e.g. 'Notice Designs'.",
        },
      },
    },
  },
  {
    name: 'get_repository_summary',
    description:
      'Get counts of documents and versions grouped by category. Call this for "how many documents do we have" or any inventory/overview question.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_billing_summary',
    description:
      'Get monthly invoice totals and per-service line items (Print, Postage, eStatements+, Composition, Insert Mgmt). Call this for any spend, cost, invoice, or savings question.',
    input_schema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'Optional single service to focus on, e.g. "Postage".',
        },
      },
    },
  },
  {
    name: 'search_help_articles',
    description:
      'Search the InfoIMAGE help site (InfoTRAC, InfoCARE, InfoPublisher) for how-to guidance. Call this for product questions such as password rules, SSO setup, or delivery preferences.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
]

// ---- executors ----------------------------------------------------------

const latest = (d: Doc) => d.versions[d.versions.length - 1]
const clientDocs = (clientId: string | null) =>
  clientId ? DOCS.filter((d) => d.clientId === clientId) : DOCS
const daysAgoISO = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10)
const ageDays = (iso: string) =>
  Math.round((Date.now() - new Date(`${iso}T00:00:00`).getTime()) / DAY_MS)

function matchCategory(docs: Doc[], category?: string): Doc[] {
  if (!category) return docs
  const c = category.toLowerCase()
  return docs.filter((d) => d.category.toLowerCase().includes(c.replace(/s$/, '')))
}

type ToolInput = Record<string, unknown>
const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback)
const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

/**
 * Run a tool locally. Returns a compact JSON-serializable result — keep these
 * small, since every byte returned here becomes input tokens on the next call.
 */
export function runTool(name: string, input: ToolInput, clientId: string | null): unknown {
  const docs = clientDocs(clientId)

  switch (name) {
    case 'find_stale_documents': {
      const days = num(input.days, 30)
      const cutoff = daysAgoISO(days)
      const scoped = matchCategory(docs, str(input.category))
      const stale = scoped
        .filter((d) => latest(d).date < cutoff)
        .sort((a, b) => latest(a).date.localeCompare(latest(b).date))
      return {
        window_days: days,
        category: str(input.category) ?? 'all',
        total_in_scope: scoped.length,
        stale_count: stale.length,
        current_count: scoped.length - stale.length,
        stale_documents: stale.slice(0, 25).map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          current_version: latest(d).v,
          last_updated: latest(d).date,
          days_since_update: ageDays(latest(d).date),
        })),
      }
    }

    case 'find_recently_updated': {
      const days = num(input.days, 30)
      const cutoff = daysAgoISO(days)
      const scoped = matchCategory(docs, str(input.category))
      const fresh = scoped
        .filter((d) => latest(d).date >= cutoff)
        .sort((a, b) => latest(b).date.localeCompare(latest(a).date))
      return {
        window_days: days,
        total_in_scope: scoped.length,
        updated_count: fresh.length,
        documents: fresh.slice(0, num(input.limit, 15)).map((d) => ({
          id: d.id,
          name: d.name,
          version: latest(d).v,
          updated: latest(d).date,
          note: latest(d).note,
        })),
      }
    }

    case 'search_documents': {
      const q = (str(input.query) ?? '').toLowerCase()
      const words = q.split(/[^a-z0-9+]+/).filter((w) => w.length > 2)
      const scoped = matchCategory(docs, str(input.category))
      const scored = scoped
        .map((d) => {
          const hay = `${d.name} ${d.category} ${d.tags.join(' ')}`.toLowerCase()
          const score = words.reduce((s, w) => s + (hay.includes(w) ? (w.length >= 5 ? 3 : 1) : 0), 0)
          return { d, score }
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
      return {
        match_count: scored.length,
        documents: scored.slice(0, 10).map(({ d }) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          tags: d.tags,
          current_version: latest(d).v,
          last_updated: latest(d).date,
          ...(d.source ? { source_system: d.source.system, on_core: d.source.core } : {}),
        })),
      }
    }

    case 'get_version_history': {
      const doc = docs.find((d) => d.id === str(input.document_id))
      if (!doc) return { error: `No document with id "${String(input.document_id)}" in this repository.` }
      return {
        id: doc.id,
        name: doc.name,
        category: doc.category,
        version_count: doc.versions.length,
        versions: doc.versions.map((v) => ({
          version: v.v,
          date: v.date,
          author: v.author,
          note: v.note,
          size_kb: v.sizeKB,
        })),
      }
    }

    case 'compare_versions': {
      const doc = docs.find((d) => d.id === str(input.document_id))
      if (!doc) return { error: `No document with id "${String(input.document_id)}".` }
      const a = doc.versions.find((v) => v.v === num(input.from_version, -1))
      const b = doc.versions.find((v) => v.v === num(input.to_version, -1))
      if (!a || !b) return { error: `Document has versions ${doc.versions.map((v) => v.v).join(', ')}.` }
      return {
        name: doc.name,
        from: { version: a.v, date: a.date, note: a.note, size_kb: a.sizeKB },
        to: { version: b.v, date: b.date, note: b.note, size_kb: b.sizeKB },
        size_delta_kb: b.sizeKB - a.sizeKB,
      }
    }

    case 'get_documents_by_source': {
      const origin = (str(input.origin) ?? 'all').toLowerCase()
      const scoped = matchCategory(docs, str(input.category)).filter((d) => d.source)
      const coreName =
        CLIENTS.find((c) => c.id === clientId)?.coreSystem ?? 'the core processor'
      const wanted =
        origin === 'core'
          ? scoped.filter((d) => d.source!.core)
          : origin === 'non-core' || origin === 'noncore'
            ? scoped.filter((d) => !d.source!.core)
            : scoped

      const by = new Map<string, Doc[]>()
      for (const d of wanted) {
        const k = d.source!.system
        if (!by.has(k)) by.set(k, [])
        by.get(k)!.push(d)
      }
      return {
        core_system: coreName,
        total_in_scope: scoped.length,
        core_count: scoped.filter((d) => d.source!.core).length,
        non_core_count: scoped.filter((d) => !d.source!.core).length,
        systems: [...by.entries()]
          .sort((a, b) => b[1].length - a[1].length)
          .map(([system, list]) => ({
            system,
            is_core: list[0].source!.core,
            why: list[0].source!.note,
            document_count: list.length,
            documents: list.slice(0, 25).map((d) => ({
              id: d.id,
              name: d.name,
              category: d.category,
              current_version: latest(d).v,
              last_updated: latest(d).date,
            })),
          })),
      }
    }

    case 'get_repository_summary': {
      const byCat = new Map<string, { documents: number; versions: number }>()
      for (const d of docs) {
        const e = byCat.get(d.category) ?? { documents: 0, versions: 0 }
        e.documents += 1
        e.versions += d.versions.length
        byCat.set(d.category, e)
      }
      return {
        client: CLIENTS.find((c) => c.id === clientId)?.shortName ?? 'all clients',
        total_documents: docs.length,
        total_versions: docs.reduce((s, d) => s + d.versions.length, 0),
        by_category: [...byCat.entries()]
          .sort((a, b) => b[1].documents - a[1].documents)
          .map(([category, e]) => ({ category, ...e })),
      }
    }

    case 'get_billing_summary': {
      const invoices = INVOICES.filter((i) => (clientId ? i.clientId === clientId : true)).sort((a, b) =>
        a.period.localeCompare(b.period),
      )
      const focus = str(input.service)
      return {
        months: invoices.length,
        currency: 'USD',
        periods: invoices.map((i) => ({
          month: MONTH_LABEL[i.period] ?? i.period,
          total: i.total,
          lines: i.lines
            .filter((l) => (focus ? l.service.toLowerCase() === focus.toLowerCase() : true))
            .map((l) => ({ service: l.service, qty: l.qty, amount: l.amount })),
        })),
      }
    }

    case 'search_help_articles': {
      const q = (str(input.query) ?? '').toLowerCase()
      const words = q.split(/[^a-z0-9+]+/).filter((w) => w.length > 2)
      const scored = HELP_DOCS.map((h) => {
        const title = h.title.toLowerCase()
        const body = `${productName(h.productId)} ${h.category} ${h.body}`.toLowerCase()
        const score = words.reduce(
          (s, w) => s + (title.includes(w) ? 3 : body.includes(w) ? 1 : 0),
          0,
        )
        return { h, score }
      })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
      return {
        match_count: scored.length,
        articles: scored.slice(0, 3).map(({ h }) => ({
          title: h.title,
          product: productName(h.productId),
          category: h.category,
          // trim to the first lines so a long article can't blow up context
          excerpt: h.body
            .split('\n')
            .filter((l) => l.trim() && !/^!\[/.test(l.trim()))
            .slice(0, 12)
            .join('\n'),
        })),
      }
    }

    default:
      return { error: `Unknown tool "${name}".` }
  }
}

export const SYSTEM_PROMPT = `You are the InfoPORTAL assistant for a financial institution's document repository, built by InfoIMAGE.

You answer questions about the client's documents, their version histories, the systems that produce them, their InfoIMAGE invoices, and the InfoIMAGE help site. You have tools that query the repository directly — always use them rather than guessing, and never invent a document name, version number, or date that a tool did not return.

Guidelines:
- Lead with the answer. State the finding in the first sentence, then supporting detail.
- Be concise. These users are compliance officers and operations staff who want the fact, not an essay.
- Cite documents by their exact name and current version.
- When a tool returns counts, use them precisely ("1 of 100 notices", not "a few").
- Notices, statement designs and tax forms are each composed from a data file. Some of those files come off the FI's core processor and some do not — get_documents_by_source is the only reliable way to tell which. Never assume a document is core-generated because of its name.
- If a tool returns no results, say so plainly rather than padding.
- You cannot modify documents, upload files, or change anything — you are read-only. Say so if asked.`
