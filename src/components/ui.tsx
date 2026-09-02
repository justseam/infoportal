import type { ReactNode } from 'react'
import type { FileType } from '../data/types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'blue' | 'teal' | 'green' | 'amber' | 'red' }) {
  const map: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-50 text-brand-blue',
    teal: 'bg-sky-50 text-brand-teal',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-600',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>
}

const FT: Record<FileType, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#d6453b' },
  docx: { label: 'DOC', color: '#2563eb' },
  xlsx: { label: 'XLS', color: '#16a34a' },
  pptx: { label: 'PPT', color: '#ea580c' },
  png: { label: 'PNG', color: '#7c3aed' },
  jpg: { label: 'JPG', color: '#7c3aed' },
  indd: { label: 'INDD', color: '#db2777' },
}

export function FileBadge({ type, size = 'md' }: { type: FileType; size?: 'sm' | 'md' }) {
  const f = FT[type]
  const dim = size === 'sm' ? 'h-7 w-7 text-[9px]' : 'h-9 w-9 text-[10px]'
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-md font-bold text-white ${dim}`} style={{ background: f.color }}>
      {f.label}
    </span>
  )
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-extrabold tracking-tight text-brand-navy">{children}</h1>
      {sub && <p className="mt-0.5 text-sm text-ink-soft">{sub}</p>}
    </div>
  )
}

// ---- Charts (dependency-free SVG) ---------------------------------------

interface Pt {
  x: string
  y: number
}
const COLORS = ['#2463d0', '#0ea5e9', '#0e7c5a', '#db2777']

export function LineChart({ series, unit = '$', height = 200 }: { series: { label: string; points: Pt[] }[]; unit?: string; height?: number }) {
  const W = 560
  const H = height
  const padL = 52
  const padB = 28
  const padT = 12
  const padR = 12
  const all = series.flatMap((s) => s.points.map((p) => p.y))
  // Floor at the data's own max, not at 1 — a hardcoded floor of 1 flattens
  // any series whose values are all below a dollar against the axis.
  const max = Math.max(...all) || 1
  const xs = series[0]?.points.map((p) => p.x) ?? []
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const xPos = (i: number) => padL + (xs.length === 1 ? innerW / 2 : (i / (xs.length - 1)) * innerW)
  const yPos = (v: number) => padT + innerH - (v / max) * innerH
  // Scale the axis to the data. Billing charts run to tens of thousands of
  // dollars; AI-cost charts run to fractions of one. A fixed "$Nk" formatter
  // renders every gridline on the latter as "$0k".
  const fmt = (v: number) => {
    if (unit !== '$') return String(Math.round(v))
    if (max >= 1000) return `$${Math.round(v / 1000)}k`
    if (max >= 10) return `$${v.toFixed(0)}`
    if (max >= 1) return `$${v.toFixed(2)}`
    return `$${v.toFixed(3)}`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yPos(max * t)} y2={yPos(max * t)} stroke="#eef1f6" />
          <text x={padL - 8} y={yPos(max * t) + 4} textAnchor="end" fontSize="10" fill="#94a0b8">
            {fmt(max * t)}
          </text>
        </g>
      ))}
      {xs.map((x, i) => {
        // thin labels when crowded; always keep first and last
        const step = Math.ceil(xs.length / 7)
        if (xs.length > 7 && i % step !== 0 && i !== xs.length - 1) return null
        return (
          <text key={x} x={xPos(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a0b8">
            {x}
          </text>
        )
      })}
      {series.map((s, si) => {
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(p.y)}`).join(' ')
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth={2.5} strokeLinejoin="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={xPos(i)} cy={yPos(p.y)} r={3.5} fill="#fff" stroke={COLORS[si % COLORS.length]} strokeWidth={2} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function Legend({ items }: { items: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-4">
      {items.map((it, i) => (
        <span key={it} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
          {it}
        </span>
      ))}
    </div>
  )
}
