import type {
  Client,
  Persona,
  Doc,
  Invoice,
  AuditEntry,
  Notification,
} from './types'

export const CLIENTS: Client[] = [
  {
    id: 'summit',
    name: 'Summit Credit Union',
    shortName: 'Summit CU',
    cid: 'SUMM',
    accent: '#0e7c5a',
    members: 184000,
  },
  {
    id: 'harbor',
    name: 'Harbor Point Federal Credit Union',
    shortName: 'Harbor Point FCU',
    cid: 'HPFC',
    accent: '#1d6fb8',
    members: 92500,
  },
]

export const PERSONAS: Persona[] = [
  {
    id: 'p-help',
    name: 'Dana Reyes',
    title: 'Branch Operations',
    email: 'dana.reyes@summitcu.org',
    role: 'help',
    clientId: 'summit',
  },
  {
    id: 'p-doc',
    name: 'Marcus Hale',
    title: 'VP, Member Experience',
    email: 'marcus.hale@summitcu.org',
    role: 'document',
    clientId: 'summit',
  },
  {
    id: 'p-admin',
    name: 'Priya Nandakumar',
    title: 'InfoIMAGE Client Services',
    email: 'priya.n@infoimageinc.com',
    role: 'admin',
    clientId: null,
  },
  {
    id: 'p-super',
    name: 'Justin Seamans',
    title: 'InfoIMAGE Platform Owner',
    email: 'jseamans@infoimageinc.com',
    role: 'super',
    clientId: null,
  },
]

// ---- Documents with version history -------------------------------------

export const DOCS: Doc[] = [
  // Summit — Statement Designs
  {
    id: 'd-summit-stmt-monthly',
    clientId: 'summit',
    name: 'Monthly Member Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'monthly', 'design', 'eStatements+'],
    versions: [
      { v: 1, date: '2024-02-11', author: 'InfoIMAGE Composition', sizeKB: 4120, note: 'Initial production design — 2-color, logo top-left.' },
      { v: 2, date: '2024-09-03', author: 'InfoIMAGE Composition', sizeKB: 4380, note: 'Added rewards summary box; moved disclosures to back page.' },
      { v: 3, date: '2025-06-19', author: 'InfoIMAGE Composition', sizeKB: 4510, note: 'Full-color refresh; new brand green (#0e7c5a); QR to mobile app.' },
      { v: 4, date: '2026-04-28', author: 'InfoIMAGE Composition', sizeKB: 4660, note: 'Accessibility pass (WCAG AA contrast); larger body font; e-delivery CTA.' },
    ],
  },
  {
    id: 'd-summit-stmt-visa',
    clientId: 'summit',
    name: 'Visa Credit Card Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'credit card', 'visa', 'design'],
    versions: [
      { v: 1, date: '2024-05-20', author: 'InfoIMAGE Composition', sizeKB: 3890, note: 'Initial Visa Signature layout.' },
      { v: 2, date: '2025-11-14', author: 'InfoIMAGE Composition', sizeKB: 3990, note: 'Reg Z late-fee disclosure update; minimum payment warning box.' },
    ],
  },
  // Summit — Notice Designs
  {
    id: 'd-summit-notice-nsf',
    clientId: 'summit',
    name: 'NSF / Overdraft Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'nsf', 'overdraft', 'compliance'],
    versions: [
      { v: 1, date: '2024-03-01', author: 'InfoIMAGE Composition', sizeKB: 210, note: 'Initial NSF notice template.' },
      { v: 2, date: '2025-01-22', author: 'InfoIMAGE Composition', sizeKB: 224, note: 'Updated fee schedule; added opt-out language.' },
      { v: 3, date: '2026-02-09', author: 'InfoIMAGE Composition', sizeKB: 230, note: 'Plain-language rewrite per NCUA guidance; Spanish version linked.' },
    ],
  },
  {
    id: 'd-summit-notice-maturity',
    clientId: 'summit',
    name: 'Certificate Maturity Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'certificate', 'maturity', 'renewal'],
    versions: [
      { v: 1, date: '2024-07-15', author: 'InfoIMAGE Composition', sizeKB: 198, note: 'Initial maturity / renewal notice.' },
      { v: 2, date: '2025-08-30', author: 'InfoIMAGE Composition', sizeKB: 205, note: 'Added current rate table and auto-renewal terms.' },
    ],
  },
  // Summit — Tax Forms
  {
    id: 'd-summit-tax-1099int',
    clientId: 'summit',
    name: '1099-INT Tax Form — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1099-int', 'irs', 'year-end'],
    versions: [
      { v: 1, date: '2024-12-18', author: 'InfoIMAGE Composition', sizeKB: 160, note: 'TY2024 layout per IRS spec.' },
      { v: 2, date: '2025-12-15', author: 'InfoIMAGE Composition', sizeKB: 162, note: 'TY2025 — updated IRS box positions; perforation change.' },
      { v: 3, date: '2026-01-06', author: 'InfoIMAGE Composition', sizeKB: 163, note: 'TY2025 reprint — corrected payer TIN mask.' },
    ],
  },
  {
    id: 'd-summit-tax-1098',
    clientId: 'summit',
    name: '1098 Mortgage Interest — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1098', 'mortgage', 'year-end'],
    versions: [
      { v: 1, date: '2024-12-20', author: 'InfoIMAGE Composition', sizeKB: 158, note: 'TY2024 layout.' },
      { v: 2, date: '2025-12-19', author: 'InfoIMAGE Composition', sizeKB: 159, note: 'TY2025 — points-paid box clarification.' },
    ],
  },
  // Summit — Contracts / SOWs / Legal
  {
    id: 'd-summit-msa',
    clientId: 'summit',
    name: 'Master Services Agreement',
    category: 'Contracts',
    fileType: 'pdf',
    tags: ['contract', 'msa', 'legal'],
    versions: [
      { v: 1, date: '2023-11-01', author: 'Legal — InfoIMAGE', sizeKB: 540, note: 'Executed MSA, 3-year term.' },
      { v: 2, date: '2025-04-12', author: 'Legal — InfoIMAGE', sizeKB: 552, note: 'Amendment 1 — added eStatements+ and SLA exhibit.' },
    ],
  },
  {
    id: 'd-summit-sow-estmt',
    clientId: 'summit',
    name: 'SOW — eStatements+ Implementation',
    category: 'SOWs',
    fileType: 'docx',
    tags: ['sow', 'eStatements+', 'implementation'],
    versions: [
      { v: 1, date: '2025-03-20', author: 'PMO — InfoIMAGE', sizeKB: 320, note: 'Draft scope, 6-week timeline.' },
      { v: 2, date: '2025-04-02', author: 'PMO — InfoIMAGE', sizeKB: 334, note: 'Signed — added SSO + member email capture.' },
    ],
  },
  {
    id: 'd-summit-soc2',
    clientId: 'summit',
    name: 'InfoIMAGE SOC 2 Type II Report',
    category: 'Legal',
    fileType: 'pdf',
    tags: ['security', 'soc2', 'compliance', 'audit'],
    versions: [
      { v: 1, date: '2025-10-01', author: 'Security — InfoIMAGE', sizeKB: 1840, note: 'FY2025 SOC 2 Type II, clean opinion.' },
    ],
  },

  // Harbor Point — a few docs to prove isolation
  {
    id: 'd-harbor-stmt-monthly',
    clientId: 'harbor',
    name: 'Monthly Member Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'monthly', 'design'],
    versions: [
      { v: 1, date: '2024-08-05', author: 'InfoIMAGE Composition', sizeKB: 4010, note: 'Initial design — Harbor Point blue.' },
      { v: 2, date: '2025-12-01', author: 'InfoIMAGE Composition', sizeKB: 4150, note: 'Added digital banking promo footer.' },
    ],
  },
  {
    id: 'd-harbor-tax-1099int',
    clientId: 'harbor',
    name: '1099-INT Tax Form — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1099-int', 'year-end'],
    versions: [
      { v: 1, date: '2025-12-16', author: 'InfoIMAGE Composition', sizeKB: 161, note: 'TY2025 layout.' },
    ],
  },
  {
    id: 'd-harbor-msa',
    clientId: 'harbor',
    name: 'Master Services Agreement',
    category: 'Contracts',
    fileType: 'pdf',
    tags: ['contract', 'msa'],
    versions: [
      { v: 1, date: '2024-06-15', author: 'Legal — InfoIMAGE', sizeKB: 530, note: 'Executed MSA, 2-year term.' },
    ],
  },
]

// ---- Invoices (for billing comparisons) ---------------------------------

function inv(clientId: string, period: string, lines: Invoice['lines']): Invoice {
  const total = lines.reduce((s, l) => s + l.amount, 0)
  return { id: `inv-${clientId}-${period}`, clientId, period, lines, total }
}

export const INVOICES: Invoice[] = [
  inv('summit', '2026-01', [
    { service: 'Print', qty: 168000, amount: 23520 },
    { service: 'Postage', qty: 168000, amount: 31920 },
    { service: 'eStatements+', qty: 96000, amount: 4800 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 168000, amount: 1680 },
  ]),
  inv('summit', '2026-02', [
    { service: 'Print', qty: 159000, amount: 22260 },
    { service: 'Postage', qty: 159000, amount: 30210 },
    { service: 'eStatements+', qty: 104000, amount: 5200 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 159000, amount: 1590 },
  ]),
  inv('summit', '2026-03', [
    { service: 'Print', qty: 151000, amount: 21140 },
    { service: 'Postage', qty: 151000, amount: 28690 },
    { service: 'eStatements+', qty: 112000, amount: 5600 },
    { service: 'Composition', qty: 1, amount: 2450 },
    { service: 'Insert Mgmt', qty: 151000, amount: 1510 },
  ]),
  inv('summit', '2026-04', [
    { service: 'Print', qty: 144000, amount: 20160 },
    { service: 'Postage', qty: 144000, amount: 27360 },
    { service: 'eStatements+', qty: 121000, amount: 6050 },
    { service: 'Composition', qty: 1, amount: 2450 },
    { service: 'Insert Mgmt', qty: 144000, amount: 1440 },
  ]),
  inv('summit', '2026-05', [
    { service: 'Print', qty: 138000, amount: 19320 },
    { service: 'Postage', qty: 138000, amount: 26220 },
    { service: 'eStatements+', qty: 129000, amount: 6450 },
    { service: 'Composition', qty: 1, amount: 2450 },
    { service: 'Insert Mgmt', qty: 138000, amount: 1380 },
  ]),
  // Harbor
  inv('harbor', '2026-04', [
    { service: 'Print', qty: 84000, amount: 11760 },
    { service: 'Postage', qty: 84000, amount: 15960 },
    { service: 'eStatements+', qty: 41000, amount: 2050 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2026-05', [
    { service: 'Print', qty: 81000, amount: 11340 },
    { service: 'Postage', qty: 81000, amount: 15390 },
    { service: 'eStatements+', qty: 46000, amount: 2300 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
]

// Help content lives in ./help.ts (modeled on the InfoIMAGE Help Portal).

// ---- Audit log ----------------------------------------------------------

export const AUDIT: AuditEntry[] = [
  { id: 'a1', time: '2026-06-17T08:42:00', user: 'Marcus Hale', action: 'login', target: 'InfoPORTAL (SSO via InfoTRAC)', clientId: 'summit' },
  { id: 'a2', time: '2026-06-17T08:43:10', user: 'Marcus Hale', action: 'view', target: 'Monthly Member Statement — Design v4', clientId: 'summit' },
  { id: 'a3', time: '2026-06-17T08:45:31', user: 'Marcus Hale', action: 'download', target: '1099-INT Tax Form — Layout v3', clientId: 'summit' },
  { id: 'a4', time: '2026-06-16T15:02:00', user: 'Priya Nandakumar', action: 'upload', target: 'NSF / Overdraft Notice — Design v3', clientId: 'summit' },
  { id: 'a5', time: '2026-06-16T14:58:12', user: 'Priya Nandakumar', action: 'permission', target: 'Granted Document access to Dana Reyes', clientId: 'summit' },
  { id: 'a6', time: '2026-06-15T11:20:00', user: 'Harbor Point Admin', action: 'download', target: 'Monthly Member Statement — Design v2', clientId: 'harbor' },
]

// ---- Notifications ------------------------------------------------------

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', time: '2026-06-16T15:02:00', text: 'New version uploaded: NSF / Overdraft Notice — Design v3', docId: 'd-summit-notice-nsf', read: false },
  { id: 'n2', time: '2026-06-10T09:30:00', text: 'May 2026 invoice is ready to view', read: false },
  { id: 'n3', time: '2026-04-28T13:15:00', text: 'New version uploaded: Monthly Member Statement — Design v4', docId: 'd-summit-stmt-monthly', read: true },
]

export const MONTH_LABEL: Record<string, string> = {
  '2026-01': 'Jan 2026',
  '2026-02': 'Feb 2026',
  '2026-03': 'Mar 2026',
  '2026-04': 'Apr 2026',
  '2026-05': 'May 2026',
  '2026-06': 'Jun 2026',
}
