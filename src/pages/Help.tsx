import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HELP_PRODUCTS,
  categoriesFor,
  docsFor,
  recentDocs,
  searchDocs,
  productName,
} from '../data/help'
import type { HelpDoc, HelpIcon } from '../data/help'
import { Card, SectionTitle, Badge } from '../components/ui'
import { HelpBody } from '../components/HelpBody'
import {
  IconSearch,
  IconArticle,
  IconChevron,
  IconGrid,
  IconLifebuoy,
  IconReceipt,
  IconThumbUp,
  IconThumbDown,
  IconSparkles,
} from '../components/icons'

const PRODUCT_ICON: Record<HelpIcon, (p: { className?: string }) => React.ReactElement> = {
  trac: IconGrid,
  care: IconLifebuoy,
  publisher: IconReceipt,
}

type View =
  | { kind: 'home' }
  | { kind: 'product'; productId: string }
  | { kind: 'article'; doc: HelpDoc }

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function Help() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>({ kind: 'home' })
  const [q, setQ] = useState('')

  const results = useMemo(() => (q.trim() ? searchDocs(q) : []), [q])

  function openArticle(doc: HelpDoc) {
    setView({ kind: 'article', doc })
    setQ('')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <SectionTitle sub="How-tos, FAQs, and product guides for InfoIMAGE's portal applications">
        Help Site
      </SectionTitle>

      {/* Global search */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 shadow-sm">
          <IconSearch className="h-5 w-5 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search all help articles…"
            className="flex-1 bg-transparent py-3.5 text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} className="text-sm font-semibold text-ink-soft hover:text-brand-blue">
              Clear
            </button>
          )}
        </div>

        {q.trim() && (
          <Card className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto p-2 scroll-thin">
            <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.length === 0 ? (
              <div className="px-2 py-3 text-sm text-ink-soft">No articles match “{q}”.</div>
            ) : (
              results.map((d) => <ArticleRow key={d.id} doc={d} onClick={() => openArticle(d)} showProduct />)
            )}
          </Card>
        )}
      </div>

      {view.kind === 'home' && <HomeView onProduct={(id) => setView({ kind: 'product', productId: id })} onArticle={openArticle} />}
      {view.kind === 'product' && (
        <ProductView
          productId={view.productId}
          onHome={() => setView({ kind: 'home' })}
          onCategory={() => {}}
          onArticle={openArticle}
        />
      )}
      {view.kind === 'article' && (
        <ArticleView
          doc={view.doc}
          onHome={() => setView({ kind: 'home' })}
          onProduct={(id) => setView({ kind: 'product', productId: id })}
          onArticle={openArticle}
          onAskAI={() => navigate('/app/assistant', { state: { q: view.doc.title } })}
        />
      )}
    </div>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────

function HomeView({ onProduct, onArticle }: { onProduct: (id: string) => void; onArticle: (d: HelpDoc) => void }) {
  const [tab, setTab] = useState(HELP_PRODUCTS[0].id)
  const top = docsFor(tab).slice(0, 7)
  const recent = recentDocs(tab, 7)

  return (
    <div className="space-y-8">
      {/* Product cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_PRODUCTS.map((p) => {
          const Icon = PRODUCT_ICON[p.icon]
          return (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-brand-navy">{p.name}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-soft">{p.blurb}</p>
              <button
                onClick={() => onProduct(p.id)}
                className="mt-4 self-start rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Get help
              </button>
            </Card>
          )
        })}
      </div>

      {/* Top + Recent with product tabs */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-extrabold text-brand-navy">Top articles</h2>
          <div className="flex flex-wrap gap-1.5">
            {HELP_PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setTab(p.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  tab === p.id ? 'bg-brand-blue text-white' : 'border border-line text-ink-soft hover:text-brand-blue'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="divide-y divide-line">
            {top.map((d) => (
              <ArticleRow key={d.id} doc={d} onClick={() => onArticle(d)} />
            ))}
            <button
              onClick={() => onProduct(tab)}
              className="flex w-full items-center gap-1 px-5 py-3 text-sm font-semibold text-brand-blue hover:bg-canvas"
            >
              View all {productName(tab)} categories <IconChevron className="h-4 w-4" />
            </button>
          </Card>
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-soft">Recently updated</h3>
            <Card className="divide-y divide-line">
              {recent.map((d) => (
                <ArticleRow key={d.id} doc={d} onClick={() => onArticle(d)} showDate />
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Product (category grid) ────────────────────────────────────────────────

function ProductView({
  productId,
  onHome,
  onArticle,
}: {
  productId: string
  onHome: () => void
  onCategory: (c: string) => void
  onArticle: (d: HelpDoc) => void
}) {
  const cats = categoriesFor(productId)
  const [openCat, setOpenCat] = useState<string | null>(cats[0]?.name ?? null)
  const docs = openCat ? docsFor(productId, openCat) : []

  return (
    <div>
      <Breadcrumb items={[{ label: 'Help portal', onClick: onHome }, { label: productName(productId) }]} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* categories */}
        <Card className="self-start overflow-hidden">
          <div className="border-b border-line px-4 py-3 text-sm font-bold text-brand-navy">Categories</div>
          <div className="max-h-[28rem] divide-y divide-line overflow-y-auto scroll-thin">
            {cats.map((c) => (
              <button
                key={c.name}
                onClick={() => setOpenCat(c.name)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                  openCat === c.name ? 'bg-blue-50/60 font-semibold text-brand-blue' : 'text-brand-navy hover:bg-canvas'
                }`}
              >
                <span>{c.name}</span>
                <Badge tone={openCat === c.name ? 'blue' : 'slate'}>{c.count}</Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* articles in selected category */}
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-ink-soft">
            {openCat}
          </div>
          <div className="divide-y divide-line">
            {docs.map((d) => (
              <ArticleRow key={d.id} doc={d} onClick={() => onArticle(d)} showDate />
            ))}
            {docs.length === 0 && <div className="px-5 py-6 text-sm text-ink-soft">No articles in this category yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Article ─────────────────────────────────────────────────────────────────

function ArticleView({
  doc,
  onHome,
  onProduct,
  onArticle,
  onAskAI,
}: {
  doc: HelpDoc
  onHome: () => void
  onProduct: (id: string) => void
  onArticle: (d: HelpDoc) => void
  onAskAI: () => void
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const siblings = docsFor(doc.productId, doc.category).filter((d) => d.id !== doc.id)

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Help portal', onClick: onHome },
          { label: productName(doc.productId), onClick: () => onProduct(doc.productId) },
          { label: doc.category, onClick: () => onProduct(doc.productId) },
          { label: doc.title },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <Card className="p-6">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-blue">{doc.category}</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy">{doc.title}</h1>
            <div className="mt-1 text-xs text-ink-soft">Updated {fmtDate(doc.updated)}</div>
            <div className="mt-5">
              <HelpBody body={doc.body} />
            </div>

            {/* helpful */}
            <div className="mt-8 flex items-center gap-3 border-t border-line pt-5">
              {vote ? (
                <span className="text-sm text-ink-soft">Thanks for your feedback!</span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-brand-navy">Did this article help?</span>
                  <button
                    onClick={() => setVote('up')}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-emerald-400 hover:text-emerald-600"
                  >
                    <IconThumbUp className="h-4 w-4" /> Yes
                  </button>
                  <button
                    onClick={() => setVote('down')}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink-soft hover:border-red-400 hover:text-red-600"
                  >
                    <IconThumbDown className="h-4 w-4" /> No
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* AI nudge */}
          <Card className="mt-4 flex items-center justify-between gap-4 bg-gradient-to-r from-brand-navy to-brand-deep p-4">
            <div className="flex items-center gap-2 text-white">
              <IconSparkles className="h-5 w-5 text-brand-teal" />
              <span className="text-sm">Still stuck? Ask the AI assistant about “{doc.title}”.</span>
            </div>
            <button onClick={onAskAI} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy">
              Ask AI
            </button>
          </Card>
        </div>

        {/* articles in this section */}
        <Card className="self-start overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-sm font-bold text-brand-navy">Articles in this section</div>
          <div className="divide-y divide-line">
            {siblings.map((d) => (
              <ArticleRow key={d.id} doc={d} onClick={() => onArticle(d)} compact />
            ))}
            {siblings.length === 0 && <div className="px-5 py-4 text-sm text-ink-soft">No other articles here.</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function ArticleRow({
  doc,
  onClick,
  showDate,
  showProduct,
  compact,
}: {
  doc: HelpDoc
  onClick: () => void
  showDate?: boolean
  showProduct?: boolean
  compact?: boolean
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-canvas">
      <IconArticle className="h-4 w-4 shrink-0 text-ink-soft" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-brand-navy">{doc.title}</div>
        {!compact && (
          <div className="truncate text-xs uppercase tracking-wide text-ink-soft">
            {showProduct ? `${productName(doc.productId)} · ` : ''}
            {doc.category}
          </div>
        )}
      </div>
      {showDate && <div className="shrink-0 text-xs text-ink-soft">{fmtDate(doc.updated)}</div>}
      <IconChevron className="h-4 w-4 shrink-0 text-ink-soft" />
    </button>
  )
}

function Breadcrumb({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.onClick ? (
            <button onClick={it.onClick} className="font-semibold text-ink-soft hover:text-brand-blue">
              {it.label}
            </button>
          ) : (
            <span className="font-semibold text-brand-navy">{it.label}</span>
          )}
          {i < items.length - 1 && <span className="text-line">/</span>}
        </span>
      ))}
    </div>
  )
}
