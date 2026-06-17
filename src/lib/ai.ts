import type { Doc, DocVersion, Invoice } from '../data/types'
import { DOCS, INVOICES, HELP, CLIENTS, MONTH_LABEL } from '../data/mock'

export interface AICite {
  docId: string
  name: string
  v?: number
}

export interface AIChart {
  title: string
  unit: '$' | 'count'
  series: { label: string; points: { x: string; y: number }[] }[]
  /** simple grouped totals for a bar view */
  bars?: { label: string; value: number }[]
}

export interface AIResponse {
  text: string
  cites: AICite[]
  chart?: AIChart
  table?: { headers: string[]; rows: (string | number)[][] }
  suggestions: string[]
}

const SUGGESTIONS = [
  'Show me previous versions of the monthly statement design',
  'What changed between tax form v2 and v3?',
  'Compare our print vs postage spend over the last 5 months',
  'When did the NSF notice design last change?',
  'How much have we spent on eStatements+ this year?',
  'How do I enroll members in eStatements+?',
]

function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US')
}

function clientDocs(clientId: string | null): Doc[] {
  return clientId ? DOCS.filter((d) => d.clientId === clientId) : DOCS
}
function clientInvoices(clientId: string | null): Invoice[] {
  const list = clientId ? INVOICES.filter((i) => i.clientId === clientId) : INVOICES
  return [...list].sort((a, b) => a.period.localeCompare(b.period))
}

/** Score a document against query words by name/category/tag overlap. */
function scoreDoc(doc: Doc, q: string): number {
  const words = q.toLowerCase().split(/[^a-z0-9+]+/).filter((w) => w.length > 2)
  const hay = (doc.name + ' ' + doc.category + ' ' + doc.tags.join(' ')).toLowerCase()
  let score = 0
  for (const w of words) {
    if (hay.includes(w)) score += w.length >= 5 ? 3 : 1
  }
  // strong category hints
  if (/statement/.test(q) && doc.category === 'Statement Designs') score += 4
  if (/notice/.test(q) && doc.category === 'Notice Designs') score += 4
  if (/tax|1099|1098/.test(q) && doc.category === 'Tax Forms') score += 4
  if (/contract|msa|agreement/.test(q) && doc.category === 'Contracts') score += 4
  if (/sow|scope/.test(q) && doc.category === 'SOWs') score += 4
  return score
}

function bestDoc(docs: Doc[], q: string): Doc | null {
  let best: Doc | null = null
  let bestScore = 0
  for (const d of docs) {
    const s = scoreDoc(d, q)
    if (s > bestScore) {
      bestScore = s
      best = d
    }
  }
  return bestScore >= 3 ? best : null
}

function parseVersionPair(q: string): [number, number] | null {
  const m = q.match(/v\.?\s?(\d+)\D+v\.?\s?(\d+)/i) || q.match(/(\d+)\s+and\s+(\d+)/)
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)]
  return null
}

// ---- Intent handlers ----------------------------------------------------

function answerBilling(q: string, clientId: string | null): AIResponse | null {
  if (!/invoic|bill|spend|spent|cost|postage|print|charge/i.test(q)) return null
  const invoices = clientInvoices(clientId)
  if (!invoices.length) return null

  // service-specific?
  const svc = /postage/i.test(q)
    ? 'Postage'
    : /print/i.test(q)
      ? 'Print'
      : /estatement|electronic|digital/i.test(q)
        ? 'eStatements+'
        : null

  const periods = invoices.map((i) => i.period)
  const labels = periods.map((p) => MONTH_LABEL[p] ?? p)

  if (/print/i.test(q) && /postage/i.test(q)) {
    // compare two services over time
    const printPts = invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.lines.find((l) => l.service === 'Print')?.amount ?? 0 }))
    const postPts = invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.lines.find((l) => l.service === 'Postage')?.amount ?? 0 }))
    const printTot = printPts.reduce((s, p) => s + p.y, 0)
    const postTot = postPts.reduce((s, p) => s + p.y, 0)
    return {
      text: `Across ${labels[0]}–${labels[labels.length - 1]}, you spent ${fmtUSD(printTot)} on print and ${fmtUSD(postTot)} on postage. Postage runs ~${Math.round((postTot / printTot - 1) * 100)}% higher than print and both are trending down as more members move to eStatements+.`,
      cites: [],
      chart: {
        title: 'Print vs Postage',
        unit: '$',
        series: [
          { label: 'Print', points: printPts },
          { label: 'Postage', points: postPts },
        ],
      },
      suggestions: SUGGESTIONS,
    }
  }

  if (svc) {
    const pts = invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.lines.find((l) => l.service === svc)?.amount ?? 0 }))
    const total = pts.reduce((s, p) => s + p.y, 0)
    const first = pts[0].y
    const last = pts[pts.length - 1].y
    const dir = last > first ? 'up' : 'down'
    const pct = first ? Math.abs(Math.round((last / first - 1) * 100)) : 0
    return {
      text: `Your ${svc} spend totaled ${fmtUSD(total)} over ${labels.length} months (${labels[0]}–${labels[labels.length - 1]}), trending ${dir} ${pct}% from ${fmtUSD(first)} to ${fmtUSD(last)}.${svc === 'eStatements+' ? ' Rising eStatements+ volume is the main driver of your falling print and postage costs.' : ''}`,
      cites: [],
      chart: { title: `${svc} spend`, unit: '$', series: [{ label: svc, points: pts }] },
      suggestions: SUGGESTIONS,
    }
  }

  // overall totals comparison
  const totals = invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.total }))
  const grand = totals.reduce((s, p) => s + p.y, 0)
  const first = totals[0].y
  const last = totals[totals.length - 1].y
  const pct = Math.abs(Math.round((last / first - 1) * 100))
  return {
    text: `Total invoiced across ${labels.length} months was ${fmtUSD(grand)}. Your monthly bill went from ${fmtUSD(first)} (${labels[0]}) to ${fmtUSD(last)} (${labels[labels.length - 1]}) — down ${pct}%, driven by lower print/postage as eStatements+ adoption grows.`,
    cites: [],
    chart: { title: 'Total invoiced by month', unit: '$', series: [{ label: 'Total', points: totals }] },
    table: {
      headers: ['Month', 'Print', 'Postage', 'eStatements+', 'Total'],
      rows: invoices.map((i) => [
        MONTH_LABEL[i.period] ?? i.period,
        fmtUSD(i.lines.find((l) => l.service === 'Print')?.amount ?? 0),
        fmtUSD(i.lines.find((l) => l.service === 'Postage')?.amount ?? 0),
        fmtUSD(i.lines.find((l) => l.service === 'eStatements+')?.amount ?? 0),
        fmtUSD(i.total),
      ]),
    },
    suggestions: SUGGESTIONS,
  }
}

function describeDiff(a: DocVersion, b: DocVersion): string {
  return `**v${a.v}** (${a.date}) → **v${b.v}** (${b.date}). v${b.v} changes: ${b.note} The file went from ${a.sizeKB.toLocaleString()} KB to ${b.sizeKB.toLocaleString()} KB.`
}

function answerVersions(q: string, clientId: string | null): AIResponse | null {
  if (!/version|previous|history|chang|diff|updat|revis|last (time|change)|between/i.test(q)) return null
  const docs = clientDocs(clientId)
  const doc = bestDoc(docs, q)
  if (!doc) return null

  const pair = parseVersionPair(q)
  if (pair) {
    const [av, bv] = pair.sort((x, y) => x - y)
    const a = doc.versions.find((x) => x.v === av)
    const b = doc.versions.find((x) => x.v === bv)
    if (a && b) {
      return {
        text: `Comparing **${doc.name}**: ${describeDiff(a, b)}`,
        cites: [
          { docId: doc.id, name: doc.name, v: a.v },
          { docId: doc.id, name: doc.name, v: b.v },
        ],
        suggestions: SUGGESTIONS,
      }
    }
  }

  // full history
  const latest = doc.versions[doc.versions.length - 1]
  const lines = doc.versions
    .map((v) => `• **v${v.v}** — ${v.date} — ${v.note}`)
    .join('\n')
  return {
    text: `**${doc.name}** has ${doc.versions.length} version${doc.versions.length > 1 ? 's' : ''}. The current version is **v${latest.v}** (${latest.date}).\n\n${lines}`,
    cites: doc.versions.map((v) => ({ docId: doc.id, name: doc.name, v: v.v })),
    suggestions: SUGGESTIONS,
  }
}

function answerFind(q: string, clientId: string | null): AIResponse | null {
  const docs = clientDocs(clientId)
  const scored = docs
    .map((d) => ({ d, s: scoreDoc(d, q) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
  if (!scored.length) return null
  const top = scored.slice(0, 5).map((x) => x.d)
  return {
    text: `I found ${scored.length} document${scored.length > 1 ? 's' : ''} matching that. Here ${top.length > 1 ? 'are the closest' : 'is the match'}:`,
    cites: top.map((d) => ({ docId: d.id, name: d.name, v: d.versions[d.versions.length - 1].v })),
    suggestions: SUGGESTIONS,
  }
}

function answerHelp(q: string): AIResponse | null {
  const words = q.toLowerCase()
  const hit = HELP.find((h) =>
    (h.title + ' ' + h.tags.join(' ') + ' ' + h.category).toLowerCase().split(/\W+/).some((w) => w.length > 3 && words.includes(w)),
  )
  if (!hit) return null
  return {
    text: `From the **${hit.category}** help guide — *${hit.title}*:\n\n${hit.body}`,
    cites: [],
    suggestions: SUGGESTIONS,
  }
}

export function askAI(query: string, clientId: string | null): AIResponse {
  const q = query.trim()
  if (!q) {
    return { text: 'Ask me about your documents, versions, or billing.', cites: [], suggestions: SUGGESTIONS }
  }

  const handlers = [
    () => answerVersions(q, clientId),
    () => answerBilling(q, clientId),
    () => answerFind(q, clientId),
    () => answerHelp(q),
  ]
  for (const h of handlers) {
    const r = h()
    if (r) return r
  }

  const scope = clientId ? CLIENTS.find((c) => c.id === clientId)?.shortName : 'all clients'
  return {
    text: `I couldn't find an exact match in ${scope}'s repository for that. I can look up document version history, find statement / notice / tax-form designs, summarize billing, or answer help-site questions. Try one of these:`,
    cites: [],
    suggestions: SUGGESTIONS,
  }
}

export { SUGGESTIONS }
