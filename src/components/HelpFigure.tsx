/** A simulated product screenshot for help articles. Renders a believable
 *  InfoTRAC-style UI mockup inside a browser-window frame. Not a real capture —
 *  the prototype illustrates the UI rather than reproducing it. */

const bar = 'h-2.5 rounded bg-slate-200'
const barLight = 'h-2.5 rounded bg-slate-100'

function Chrome({ title = 'InfoTRAC', children }: { title?: string; children: React.ReactNode }) {
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-line shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-slate-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-ink-soft ring-1 ring-line">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {title}
        </span>
      </div>
      <div className="bg-white">{children}</div>
    </figure>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="border-t border-line bg-canvas px-3 py-2 text-center text-xs text-ink-soft">{children}</figcaption>
}

function AppHeader() {
  return (
    <div className="flex items-center justify-between bg-brand-navy px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-extrabold tracking-tight text-white">InfoTRAC</span>
      </div>
      <div className="flex gap-3">
        {['Dashboard', 'Accounts', 'Reports'].map((t) => (
          <span key={t} className="text-[10px] font-medium text-white/60">{t}</span>
        ))}
        <span className="h-4 w-4 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

function Login() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-8">
      <div className="mx-auto w-full max-w-[240px] rounded-lg bg-white p-5 shadow-md ring-1 ring-line">
        <div className="mx-auto mb-4 h-7 w-24 rounded bg-brand-navy" />
        <div className="space-y-3">
          <div>
            <div className="mb-1 h-2 w-12 rounded bg-slate-200" />
            <div className="h-7 rounded-md border border-line bg-slate-50" />
          </div>
          <div>
            <div className="mb-1 h-2 w-16 rounded bg-slate-200" />
            <div className="h-7 rounded-md border border-line bg-slate-50" />
          </div>
          <div className="h-7 rounded-md bg-brand-blue" />
          <div className="mx-auto h-2 w-20 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

function Form() {
  return (
    <div>
      <AppHeader />
      <div className="p-4">
        <div className="mb-3 h-3 w-32 rounded bg-slate-300" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-2 w-16 rounded bg-slate-200" />
              <div className="h-7 rounded-md border border-line bg-slate-50" />
            </div>
          ))}
          <div className="col-span-2">
            <div className="mb-1 h-2 w-20 rounded bg-slate-200" />
            <div className="h-14 rounded-md border border-line bg-slate-50" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <div className="h-7 w-20 rounded-md border border-line bg-white" />
          <div className="h-7 w-20 rounded-md bg-brand-blue" />
        </div>
      </div>
    </div>
  )
}

function Table() {
  const statuses = ['bg-emerald-400', 'bg-amber-400', 'bg-brand-blue', 'bg-slate-300', 'bg-emerald-400']
  return (
    <div>
      <AppHeader />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-3 w-28 rounded bg-slate-300" />
          <div className="h-6 w-24 rounded-md border border-line bg-slate-50" />
        </div>
        <div className="overflow-hidden rounded-md ring-1 ring-line">
          <div className="grid grid-cols-[1.6fr_1fr_0.8fr] gap-2 bg-slate-50 px-3 py-2">
            {['Item', 'Category', 'Status'].map((h) => (
              <div key={h} className="h-2 rounded bg-slate-300" />
            ))}
          </div>
          {statuses.map((s, i) => (
            <div key={i} className="grid grid-cols-[1.6fr_1fr_0.8fr] items-center gap-2 border-t border-line px-3 py-2.5">
              <div className={barLight} style={{ width: `${80 - (i % 3) * 14}%` }} />
              <div className={barLight} style={{ width: '60%' }} />
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${s}`} />
                <div className="h-2 w-10 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div>
      <AppHeader />
      <div className="p-4">
        <div className="mb-3 grid grid-cols-3 gap-3">
          {['#2463d0', '#0ea5e9', '#0e7c5a'].map((c) => (
            <div key={c} className="rounded-md border border-line p-2.5">
              <div className="mb-1.5 h-2 w-12 rounded bg-slate-200" />
              <div className="h-4 w-10 rounded" style={{ background: c }} />
            </div>
          ))}
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="mb-2 h-2 w-20 rounded bg-slate-200" />
          <div className="flex h-20 items-end gap-2">
            {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-brand-blue/70" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Wizard() {
  return (
    <div>
      <AppHeader />
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          {['1', '2', '3'].map((n, i) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? 'bg-brand-blue text-white' : 'bg-slate-200 text-slate-500'}`}>
                {n}
              </span>
              {i < 2 && <span className="h-px flex-1 bg-line" />}
            </div>
          ))}
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="mb-2 h-2.5 w-24 rounded bg-slate-300" />
          {Array.from({ length: 3 }).map((_, i) => (
            <label key={i} className="mb-2 flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-line bg-slate-50" />
              <span className={barLight} style={{ width: `${70 - i * 12}%` }} />
            </label>
          ))}
        </div>
        <div className="mt-3 flex justify-between">
          <div className="h-7 w-16 rounded-md border border-line bg-white" />
          <div className="h-7 w-16 rounded-md bg-brand-blue" />
        </div>
      </div>
    </div>
  )
}

function Panel() {
  return (
    <div>
      <AppHeader />
      <div className="p-4">
        <div className="mb-3 h-3 w-28 rounded bg-slate-300" />
        <div className="space-y-2.5">
          {[88, 72, 80, 64, 76].map((w, i) => (
            <div key={i} className={bar} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const KINDS: Record<string, () => React.ReactElement> = {
  login: Login,
  form: Form,
  table: Table,
  dashboard: Dashboard,
  wizard: Wizard,
  panel: Panel,
}

export function HelpFigure({ kind, caption }: { kind: string; caption?: string }) {
  const Body = KINDS[kind] ?? Panel
  return (
    <Chrome>
      <Body />
      {caption && <Caption>{caption}</Caption>}
    </Chrome>
  )
}
