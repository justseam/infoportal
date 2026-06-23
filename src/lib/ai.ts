import type { Doc, DocVersion, Invoice } from '../data/types'
import { DOCS, INVOICES, CLIENTS, MONTH_LABEL } from '../data/mock'
import { HELP_DOCS, productName } from '../data/help'

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

/** Curated recommendations, grouped by capability. Each prompt is written to
 *  return a strong answer against the current repository data. */
export const SUGGESTION_GROUPS: { category: string; prompts: string[] }[] = [
  {
    category: 'Documents & versions',
    prompts: [
      'Show the version history of the monthly statement design',
      'What changed between v3 and v4 of the monthly statement design?',
      'When did the NSF overdraft notice last change?',
    ],
  },
  {
    category: 'Billing & savings',
    prompts: [
      'Compare our print vs postage spend this year',
      'How is our total monthly bill trending?',
      'How much have we saved by moving members to eStatements+?',
    ],
  },
  {
    category: 'Across the repository',
    prompts: [
      'What documents changed in the last 90 days?',
      'How many documents do we have, by category?',
      'List all our tax form layouts',
    ],
  },
  {
    category: 'Help & how-to',
    prompts: [
      'What are the InfoTRAC password requirements?',
      'How do I set up notifications and alerts?',
    ],
  },
]

const SUGGESTIONS = SUGGESTION_GROUPS.flatMap((g) => g.prompts)

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

const STOP = new Set([
  'the', 'and', 'for', 'are', 'how', 'what', 'when', 'where', 'who', 'why', 'our', 'you', 'your',
  'can', 'does', 'did', 'set', 'use', 'with', 'from', 'into', 'this', 'that', 'have', 'has', 'about',
  'show', 'tell', 'list', 'all', 'get', 'see', 'find', 'need', 'want', 'help', 'please', 'me', 'i',
])

/** Token-overlap match against help articles (handles natural-language phrasing). */
function answerHelp(q: string): AIResponse | null {
  const words = q
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
  if (!words.length) return null

  let best: (typeof HELP_DOCS)[number] | null = null
  let bestScore = 0
  for (const d of HELP_DOCS) {
    const title = d.title.toLowerCase()
    const hay = (productName(d.productId) + ' ' + d.category + ' ' + d.body).toLowerCase()
    let s = 0
    for (const w of words) {
      if (title.includes(w)) s += 3
      else if (hay.includes(w)) s += w.length >= 5 ? 2 : 1
    }
    if (s > bestScore) {
      bestScore = s
      best = d
    }
  }
  if (!best || bestScore < 3) return null

  const snippet = best.body
    .split('\n')
    .filter((l) => l.trim() && !/^!\[/.test(l.trim()))
    .slice(0, 8)
    .join('\n')
  return {
    text: `From the **${productName(best.productId)} · ${best.category}** help guide — *${best.title}*:\n\n${snippet}`,
    cites: [],
    suggestions: SUGGESTIONS,
  }
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

/** "What changed recently / in the last 90 days" — most recently updated docs. */
function answerRecent(q: string, clientId: string | null): AIResponse | null {
  if (!/recent|lately|\bnew(ly)?\b|last \d+\s*(day|week|month)s?|past \d+|what'?s new|changed (recently|lately|in the last)/i.test(q)) return null
  const docs = clientDocs(clientId)
  // if the query clearly names one document, let the version handler take it
  if (bestDoc(docs, q)) return null

  const ranked = docs
    .map((d) => ({ d, latest: d.versions[d.versions.length - 1] }))
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date))
    .slice(0, 8)
  if (!ranked.length) return null

  const lines = ranked
    .map(({ d, latest }) => `• **${d.name}** — v${latest.v}, ${fmtDate(latest.date)} — ${latest.note}`)
    .join('\n')
  return {
    text: `Here are the most recently updated documents in the repository (newest first):\n\n${lines}`,
    cites: ranked.map(({ d, latest }) => ({ docId: d.id, name: d.name, v: latest.v })),
    suggestions: SUGGESTIONS,
  }
}

/** "How many documents do we have / by category / overview" — repository summary. */
function answerInventory(q: string, clientId: string | null): AIResponse | null {
  if (!/how many|by category|inventory|overview|breakdown|what (do we have|documents)/i.test(q)) return null
  const docs = clientDocs(clientId)
  if (!docs.length) return null

  const byCat = new Map<string, { docs: number; versions: number }>()
  for (const d of docs) {
    const e = byCat.get(d.category) ?? { docs: 0, versions: 0 }
    e.docs += 1
    e.versions += d.versions.length
    byCat.set(d.category, e)
  }
  const totalVersions = docs.reduce((s, d) => s + d.versions.length, 0)
  const rows = [...byCat.entries()]
    .sort((a, b) => b[1].docs - a[1].docs)
    .map(([cat, e]) => [cat, e.docs, e.versions])

  const scope = clientId ? CLIENTS.find((c) => c.id === clientId)?.shortName : 'all clients'
  return {
    text: `${scope}'s repository holds **${docs.length} documents** across **${byCat.size} categories**, with **${totalVersions} total versions** on file. Here's the breakdown:`,
    cites: [],
    table: { headers: ['Category', 'Documents', 'Versions'], rows },
    suggestions: SUGGESTIONS,
  }
}

/** "How much have we saved by moving to eStatements+ / paper suppression". */
function answerSavings(q: string, clientId: string | null): AIResponse | null {
  if (!/sav(e|ed|ing|ings)|paper suppress|reduc|driving.*(cost|down)/i.test(q)) return null
  const invoices = clientInvoices(clientId)
  if (invoices.length < 2) return null

  const physical = (inv: Invoice) =>
    (inv.lines.find((l) => l.service === 'Print')?.amount ?? 0) + (inv.lines.find((l) => l.service === 'Postage')?.amount ?? 0)
  const eStmt = (inv: Invoice) => inv.lines.find((l) => l.service === 'eStatements+')?.amount ?? 0

  const first = invoices[0]
  const last = invoices[invoices.length - 1]
  const monthlyReduction = physical(first) - physical(last)
  const annualized = monthlyReduction * 12
  const eGrowthPct = eStmt(first) ? Math.round((eStmt(last) / eStmt(first) - 1) * 100) : 0
  const lFirst = MONTH_LABEL[first.period] ?? first.period
  const lLast = MONTH_LABEL[last.period] ?? last.period

  const series = [
    { label: 'Print + Postage', points: invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: physical(i) })) },
    { label: 'eStatements+', points: invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: eStmt(i) })) },
  ]
  return {
    text: `As members moved to eStatements+, your print + postage spend fell from ${fmtUSD(physical(first))}/mo (${lFirst}) to ${fmtUSD(physical(last))}/mo (${lLast}) — a reduction of **${fmtUSD(monthlyReduction)}/month**, or roughly **${fmtUSD(annualized)}/year**. Over the same period, eStatements+ adoption (by spend) grew **${eGrowthPct}%**. Shifting more members to electronic delivery is the single biggest lever on your bill.`,
    cites: [],
    chart: { title: 'Physical mail cost vs eStatements+', unit: '$', series },
    suggestions: SUGGESTIONS,
  }
}

export function askAI(query: string, clientId: string | null): AIResponse {
  const q = query.trim()
  if (!q) {
    return { text: 'Ask me about your documents, versions, or billing.', cites: [], suggestions: SUGGESTIONS }
  }

  const handlers = [
    () => answerRecent(q, clientId),
    () => answerInventory(q, clientId),
    () => answerVersions(q, clientId),
    () => answerSavings(q, clientId),
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
