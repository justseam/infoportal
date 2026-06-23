import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../state/session'
import { INVOICES, CLIENTS, MONTH_LABEL } from '../data/mock'
import type { Invoice } from '../data/types'
import { Card, SectionTitle, LineChart, Legend } from '../components/ui'
import { IconSparkles, IconDownload } from '../components/icons'
import { downloadCsv, invoiceCsv, invoiceFilename, historyCsv } from '../lib/exportCsv'

const SERVICES = ['Print', 'Postage', 'eStatements+', 'Composition', 'Insert Mgmt'] as const

export function Billing() {
  const { activeClientId, logActivity } = useSession()
  const navigate = useNavigate()
  const client = CLIENTS.find((c) => c.id === activeClientId)

  const invoices = useMemo(
    () => INVOICES.filter((i) => i.clientId === activeClientId).sort((a, b) => a.period.localeCompare(b.period)),
    [activeClientId],
  )

  function exportMonth(inv: Invoice) {
    if (!client) return
    downloadCsv(invoiceFilename(client.name, inv.period), invoiceCsv(inv, client.name))
    logActivity('download', `Exported invoice ${MONTH_LABEL[inv.period] ?? inv.period} (CSV)`)
  }
  function exportAll() {
    if (!client) return
    const slug = client.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    downloadCsv(`${slug}-billing-history.csv`, historyCsv(invoices, client.name))
    logActivity('download', 'Exported full billing history (CSV)')
  }

  const labels = invoices.map((i) => MONTH_LABEL[i.period] ?? i.period)
  const totalSeries = [{ label: 'Total', points: invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.total })) }]
  const byService = SERVICES.filter((svc) => invoices.some((i) => i.lines.some((l) => l.service === svc))).map((svc) => ({
    label: svc,
    points: invoices.map((i) => ({ x: MONTH_LABEL[i.period] ?? i.period, y: i.lines.find((l) => l.service === svc)?.amount ?? 0 })),
  }))

  const grand = invoices.reduce((s, i) => s + i.total, 0)
  const first = invoices[0]?.total ?? 0
  const last = invoices[invoices.length - 1]?.total ?? 0
  const delta = first ? Math.round((last / first - 1) * 100) : 0

  if (!invoices.length) {
    return (
      <div className="mx-auto max-w-5xl">
        <SectionTitle>Invoicing &amp; Billing</SectionTitle>
        <Card className="p-10 text-center text-ink-soft">No invoices on file for {client?.name}.</Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <SectionTitle sub={`${client?.name} · ${labels[0]}–${labels[labels.length - 1]}`}>Invoicing &amp; Billing</SectionTitle>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Total invoiced" value={`$${grand.toLocaleString()}`} />
        <Stat label={`Latest (${labels[labels.length - 1]})`} value={`$${last.toLocaleString()}`} />
        <Stat
          label="Trend vs first month"
          value={`${delta <= 0 ? '↓' : '↑'} ${Math.abs(delta)}%`}
          tone={delta <= 0 ? 'green' : 'amber'}
        />
      </div>

      <Card className="mb-5 flex items-center justify-between gap-4 bg-gradient-to-r from-brand-navy to-brand-deep p-4">
        <div className="flex items-center gap-2 text-white">
          <IconSparkles className="h-5 w-5 text-brand-teal" />
          <span className="text-sm">Want a comparison? Ask: <em>“Compare our print vs postage spend”</em></span>
        </div>
        <button onClick={() => navigate('/app/assistant')} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-navy">
          Ask AI
        </button>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-1 text-sm font-bold text-brand-navy">Total invoiced by month</div>
          <LineChart series={totalSeries} unit="$" />
        </Card>
        <Card className="p-4">
          <div className="mb-1 text-sm font-bold text-brand-navy">Spend by service</div>
          <LineChart series={byService} unit="$" />
          <Legend items={byService.map((s) => s.label)} />
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-bold text-brand-navy">Invoice detail</span>
          <button
            onClick={exportAll}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-brand-blue hover:bg-canvas"
          >
            <IconDownload className="h-4 w-4" /> Export all (CSV)
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-2.5 font-semibold">Month</th>
                {SERVICES.map((s) => (
                  <th key={s} className="px-3 py-2.5 text-right font-semibold">{s}</th>
                ))}
                <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                <th className="px-5 py-2.5 text-right font-semibold">Export</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-line/60 hover:bg-canvas">
                  <td className="px-5 py-2.5 font-semibold text-brand-navy">{MONTH_LABEL[inv.period]}</td>
                  {SERVICES.map((s) => {
                    const amt = inv.lines.find((l) => l.service === s)?.amount
                    return (
                      <td key={s} className="px-3 py-2.5 text-right text-ink-soft">
                        {amt != null ? `$${amt.toLocaleString()}` : '—'}
                      </td>
                    )
                  })}
                  <td className="px-5 py-2.5 text-right font-bold text-brand-navy">${inv.total.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button
                      onClick={() => exportMonth(inv)}
                      title={`Export ${MONTH_LABEL[inv.period] ?? inv.period} invoice as CSV`}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-semibold text-brand-blue hover:bg-blue-50/50"
                    >
                      <IconDownload className="h-3.5 w-3.5" /> CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, tone = 'navy' }: { label: string; value: string; tone?: 'navy' | 'green' | 'amber' }) {
  const color = tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-700' : 'text-brand-navy'
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-ink-soft">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</div>
    </Card>
  )
}
