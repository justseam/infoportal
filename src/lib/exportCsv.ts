import type { Invoice } from '../data/types'
import { MONTH_LABEL } from '../data/mock'

const SERVICE_ORDER = ['Print', 'Postage', 'eStatements+', 'Composition', 'Insert Mgmt'] as const

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function rows(matrix: (string | number)[][]): string {
  return matrix.map((r) => r.map(csvCell).join(',')).join('\r\n')
}

/** Trigger a client-side download of a CSV string. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** A single month's invoice: one line per service + total. */
export function invoiceCsv(invoice: Invoice, clientName: string): string {
  const period = MONTH_LABEL[invoice.period] ?? invoice.period
  const matrix: (string | number)[][] = [
    ['InfoIMAGE — Invoice'],
    ['Client', clientName],
    ['Period', period],
    [],
    ['Service', 'Quantity', 'Amount (USD)'],
  ]
  for (const svc of SERVICE_ORDER) {
    const line = invoice.lines.find((l) => l.service === svc)
    if (line) matrix.push([line.service, line.qty, line.amount])
  }
  matrix.push([])
  matrix.push(['Total', '', invoice.total])
  return rows(matrix)
}

/** Full history: one row per month, a column per service + total. */
export function historyCsv(invoices: Invoice[], clientName: string): string {
  const header = ['Client', 'Period', ...SERVICE_ORDER, 'Total']
  const matrix: (string | number)[][] = [header]
  for (const inv of invoices) {
    const cells: (string | number)[] = [clientName, MONTH_LABEL[inv.period] ?? inv.period]
    for (const svc of SERVICE_ORDER) {
      cells.push(inv.lines.find((l) => l.service === svc)?.amount ?? 0)
    }
    cells.push(inv.total)
    matrix.push(cells)
  }
  return rows(matrix)
}

export function invoiceFilename(clientName: string, period: string): string {
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${slug}-invoice-${period}.csv`
}
