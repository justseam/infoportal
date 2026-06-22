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

  // ── Summit — additional Statement Designs ────────────────────────────
  {
    id: 'd-summit-stmt-savings',
    clientId: 'summit',
    name: 'Savings & Money Market Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'savings', 'money market', 'design'],
    versions: [
      { v: 1, date: '2024-03-18', author: 'InfoIMAGE Composition', sizeKB: 3760, note: 'Initial savings/MMA layout.' },
      { v: 2, date: '2025-02-26', author: 'InfoIMAGE Composition', sizeKB: 3820, note: 'Added dividend YTD summary and tiered-rate table.' },
      { v: 3, date: '2026-03-30', author: 'InfoIMAGE Composition', sizeKB: 3905, note: 'Brand refresh to match monthly statement v3 palette.' },
    ],
  },
  {
    id: 'd-summit-stmt-heloc',
    clientId: 'summit',
    name: 'HELOC Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'heloc', 'lending', 'design'],
    versions: [
      { v: 1, date: '2024-10-09', author: 'InfoIMAGE Composition', sizeKB: 4080, note: 'Initial HELOC statement with draw/repayment summary.' },
      { v: 2, date: '2025-09-22', author: 'InfoIMAGE Composition', sizeKB: 4145, note: 'Added variable-rate disclosure and available-credit bar.' },
    ],
  },
  {
    id: 'd-summit-stmt-mortgage',
    clientId: 'summit',
    name: 'Mortgage Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'mortgage', 'lending', 'design'],
    versions: [
      { v: 1, date: '2024-06-04', author: 'InfoIMAGE Composition', sizeKB: 4220, note: 'Initial layout per CFPB periodic-statement rule.' },
      { v: 2, date: '2025-03-11', author: 'InfoIMAGE Composition', sizeKB: 4260, note: 'Escrow shortage messaging block added.' },
      { v: 3, date: '2025-12-08', author: 'InfoIMAGE Composition', sizeKB: 4290, note: 'Delinquency notice box reformatted for clarity.' },
    ],
  },
  {
    id: 'd-summit-stmt-escrow',
    clientId: 'summit',
    name: 'Annual Escrow Analysis — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'escrow', 'mortgage', 'annual'],
    versions: [
      { v: 1, date: '2025-01-15', author: 'InfoIMAGE Composition', sizeKB: 3680, note: 'Initial annual escrow analysis layout.' },
      { v: 2, date: '2026-01-12', author: 'InfoIMAGE Composition', sizeKB: 3710, note: 'Added projected vs actual disbursement chart.' },
    ],
  },

  // ── Summit — additional Notice Designs ───────────────────────────────
  {
    id: 'd-summit-notice-privacy',
    clientId: 'summit',
    name: 'Annual Privacy Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'privacy', 'compliance', 'annual'],
    versions: [
      { v: 1, date: '2024-04-22', author: 'InfoIMAGE Composition', sizeKB: 186, note: 'Initial GLBA model privacy form.' },
      { v: 2, date: '2025-04-20', author: 'InfoIMAGE Composition', sizeKB: 188, note: 'Updated opt-out phone number and effective date.' },
      { v: 3, date: '2026-04-18', author: 'InfoIMAGE Composition', sizeKB: 190, note: 'Refreshed sharing table; added online opt-out link.' },
    ],
  },
  {
    id: 'd-summit-notice-ratechange',
    clientId: 'summit',
    name: 'Rate Change Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'rate change', 'deposits'],
    versions: [
      { v: 1, date: '2024-05-30', author: 'InfoIMAGE Composition', sizeKB: 172, note: 'Initial deposit rate change notice.' },
      { v: 2, date: '2025-10-03', author: 'InfoIMAGE Composition', sizeKB: 176, note: 'Added APY comparison table.' },
    ],
  },
  {
    id: 'd-summit-notice-adverse',
    clientId: 'summit',
    name: 'Adverse Action Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'adverse action', 'lending', 'compliance'],
    versions: [
      { v: 1, date: '2024-08-14', author: 'InfoIMAGE Composition', sizeKB: 196, note: 'Initial ECOA/FCRA adverse action layout.' },
      { v: 2, date: '2025-07-29', author: 'InfoIMAGE Composition', sizeKB: 201, note: 'Added credit-score disclosure section.' },
      { v: 3, date: '2026-05-19', author: 'InfoIMAGE Composition', sizeKB: 203, note: 'Reasons-for-denial list reformatted to checkboxes.' },
    ],
  },
  {
    id: 'd-summit-notice-dormancy',
    clientId: 'summit',
    name: 'Dormancy / Escheatment Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'dormancy', 'escheatment', 'compliance'],
    versions: [
      { v: 1, date: '2025-02-11', author: 'InfoIMAGE Composition', sizeKB: 168, note: 'Initial pre-escheatment outreach notice.' },
    ],
  },

  // ── Summit — additional Tax Forms ────────────────────────────────────
  {
    id: 'd-summit-tax-1099r',
    clientId: 'summit',
    name: '1099-R Retirement Distribution — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1099-r', 'ira', 'year-end'],
    versions: [
      { v: 1, date: '2024-12-19', author: 'InfoIMAGE Composition', sizeKB: 159, note: 'TY2024 layout per IRS spec.' },
      { v: 2, date: '2025-12-17', author: 'InfoIMAGE Composition', sizeKB: 161, note: 'TY2025 — distribution-code box realignment.' },
    ],
  },
  {
    id: 'd-summit-tax-5498',
    clientId: 'summit',
    name: '5498 IRA Contribution — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '5498', 'ira', 'contribution'],
    versions: [
      { v: 1, date: '2025-04-08', author: 'InfoIMAGE Composition', sizeKB: 157, note: 'TY2024 contribution statement layout.' },
      { v: 2, date: '2026-04-07', author: 'InfoIMAGE Composition', sizeKB: 158, note: 'TY2025 — FMV box clarification.' },
    ],
  },
  {
    id: 'd-summit-tax-1099misc',
    clientId: 'summit',
    name: '1099-MISC — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1099-misc', 'year-end'],
    versions: [
      { v: 1, date: '2025-12-22', author: 'InfoIMAGE Composition', sizeKB: 156, note: 'TY2025 layout per IRS spec.' },
    ],
  },

  // ── Summit — Statements (production runs / proofs) ───────────────────
  {
    id: 'd-summit-stmt-run-2026-05',
    clientId: 'summit',
    name: 'Monthly Statement Run — May 2026',
    category: 'Statements',
    fileType: 'pdf',
    tags: ['statements', 'production', 'proof', 'monthly'],
    versions: [
      { v: 1, date: '2026-05-31', author: 'InfoIMAGE Production', sizeKB: 28400, note: 'May 2026 cycle — 138,142 statements composed.' },
      { v: 2, date: '2026-06-01', author: 'InfoIMAGE Production', sizeKB: 28410, note: 'Reprint batch — 312 address corrections.' },
    ],
  },
  {
    id: 'd-summit-stmt-run-2026-04',
    clientId: 'summit',
    name: 'Monthly Statement Run — April 2026',
    category: 'Statements',
    fileType: 'pdf',
    tags: ['statements', 'production', 'proof', 'monthly'],
    versions: [
      { v: 1, date: '2026-04-30', author: 'InfoIMAGE Production', sizeKB: 29100, note: 'April 2026 cycle — 144,038 statements composed.' },
    ],
  },
  {
    id: 'd-summit-stmt-tax-run-2026',
    clientId: 'summit',
    name: 'Year-End Tax Statement Run — TY2025',
    category: 'Statements',
    fileType: 'pdf',
    tags: ['statements', 'tax', 'year-end', 'production'],
    versions: [
      { v: 1, date: '2026-01-28', author: 'InfoIMAGE Production', sizeKB: 41200, note: 'TY2025 combined tax mailing — 1099-INT/R, 1098, 5498.' },
      { v: 2, date: '2026-02-14', author: 'InfoIMAGE Production', sizeKB: 4120, note: 'Corrected-form batch (C) — 86 records.' },
    ],
  },

  // ── Summit — Assets ──────────────────────────────────────────────────
  {
    id: 'd-summit-asset-logo',
    clientId: 'summit',
    name: 'Brand Logo Pack',
    category: 'Assets',
    fileType: 'png',
    tags: ['asset', 'logo', 'brand'],
    versions: [
      { v: 1, date: '2024-02-05', author: 'Summit CU Marketing', sizeKB: 2240, note: 'Primary, reversed, and mono logos (PNG/SVG/EPS).' },
      { v: 2, date: '2025-06-10', author: 'Summit CU Marketing', sizeKB: 2390, note: 'Updated to new brand green; added favicon set.' },
    ],
  },
  {
    id: 'd-summit-asset-insert-autoloan',
    clientId: 'summit',
    name: 'Marketing Insert — Spring Auto Loan',
    category: 'Assets',
    fileType: 'pdf',
    tags: ['asset', 'insert', 'marketing', 'auto loan'],
    versions: [
      { v: 1, date: '2026-02-20', author: 'Summit CU Marketing', sizeKB: 1180, note: 'Spring auto-loan promo, 4.99% APR offer.' },
      { v: 2, date: '2026-03-02', author: 'InfoIMAGE Composition', sizeKB: 1190, note: 'Production-ready — bleed/safe-zone corrected.' },
    ],
  },
  {
    id: 'd-summit-asset-envelope',
    clientId: 'summit',
    name: 'Outer Envelope Artwork — #10',
    category: 'Assets',
    fileType: 'pdf',
    tags: ['asset', 'envelope', 'print'],
    versions: [
      { v: 1, date: '2024-02-09', author: 'InfoIMAGE Composition', sizeKB: 740, note: '#10 outer with logo and return address.' },
    ],
  },
  {
    id: 'd-summit-asset-banner-app',
    clientId: 'summit',
    name: 'eStatement Banner — Mobile App Promo',
    category: 'Assets',
    fileType: 'jpg',
    tags: ['asset', 'banner', 'eStatements+', 'mobile'],
    versions: [
      { v: 1, date: '2025-05-14', author: 'Summit CU Marketing', sizeKB: 320, note: 'Initial mobile-app download banner.' },
      { v: 2, date: '2026-01-20', author: 'Summit CU Marketing', sizeKB: 336, note: 'Refreshed creative; added app-store badges.' },
    ],
  },

  // ── Summit — more Contracts / SOWs / Legal ───────────────────────────
  {
    id: 'd-summit-baa',
    clientId: 'summit',
    name: 'Business Associate Agreement (BAA)',
    category: 'Contracts',
    fileType: 'pdf',
    tags: ['contract', 'baa', 'privacy'],
    versions: [
      { v: 1, date: '2023-11-01', author: 'Legal — InfoIMAGE', sizeKB: 280, note: 'Executed alongside MSA.' },
    ],
  },
  {
    id: 'd-summit-sow-enotif',
    clientId: 'summit',
    name: 'SOW — eNotifications+ Rollout',
    category: 'SOWs',
    fileType: 'docx',
    tags: ['sow', 'eNotifications+', 'implementation'],
    versions: [
      { v: 1, date: '2025-08-11', author: 'PMO — InfoIMAGE', sizeKB: 298, note: 'Draft scope — email + SMS alerts.' },
      { v: 2, date: '2025-08-25', author: 'PMO — InfoIMAGE', sizeKB: 312, note: 'Signed — added bounce-handling and reporting.' },
    ],
  },
  {
    id: 'd-summit-sow-tax',
    clientId: 'summit',
    name: 'SOW — Year-End Tax Forms Setup',
    category: 'SOWs',
    fileType: 'docx',
    tags: ['sow', 'tax', 'implementation'],
    versions: [
      { v: 1, date: '2024-09-30', author: 'PMO — InfoIMAGE', sizeKB: 264, note: 'Signed — 1099/1098/5498 program setup.' },
    ],
  },
  {
    id: 'd-summit-pci',
    clientId: 'summit',
    name: 'PCI DSS Attestation of Compliance',
    category: 'Legal',
    fileType: 'pdf',
    tags: ['security', 'pci', 'compliance'],
    versions: [
      { v: 1, date: '2024-09-15', author: 'Security — InfoIMAGE', sizeKB: 640, note: 'FY2024 AOC, Level 1 service provider.' },
      { v: 2, date: '2025-09-12', author: 'Security — InfoIMAGE', sizeKB: 648, note: 'FY2025 AOC, Level 1 service provider.' },
    ],
  },
  {
    id: 'd-summit-bcp',
    clientId: 'summit',
    name: 'Disaster Recovery / BCP Summary',
    category: 'Legal',
    fileType: 'pdf',
    tags: ['security', 'bcp', 'disaster recovery'],
    versions: [
      { v: 1, date: '2025-10-01', author: 'Security — InfoIMAGE', sizeKB: 520, note: 'Annual DR/BCP summary with RTO/RPO targets.' },
    ],
  },

  // ── Harbor Point — additional Statement Designs ──────────────────────
  {
    id: 'd-harbor-stmt-visa',
    clientId: 'harbor',
    name: 'Visa Credit Card Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'credit card', 'visa', 'design'],
    versions: [
      { v: 1, date: '2024-09-10', author: 'InfoIMAGE Composition', sizeKB: 3850, note: 'Initial Visa Platinum layout.' },
      { v: 2, date: '2025-10-21', author: 'InfoIMAGE Composition', sizeKB: 3920, note: 'Reg Z disclosure refresh.' },
    ],
  },
  {
    id: 'd-harbor-stmt-heloc',
    clientId: 'harbor',
    name: 'HELOC Statement — Design',
    category: 'Statement Designs',
    fileType: 'indd',
    tags: ['statement', 'heloc', 'lending', 'design'],
    versions: [
      { v: 1, date: '2025-03-25', author: 'InfoIMAGE Composition', sizeKB: 4060, note: 'Initial HELOC statement layout.' },
    ],
  },

  // ── Harbor Point — Notice Designs ────────────────────────────────────
  {
    id: 'd-harbor-notice-nsf',
    clientId: 'harbor',
    name: 'NSF / Overdraft Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'nsf', 'overdraft', 'compliance'],
    versions: [
      { v: 1, date: '2024-09-18', author: 'InfoIMAGE Composition', sizeKB: 208, note: 'Initial NSF notice template.' },
      { v: 2, date: '2026-01-30', author: 'InfoIMAGE Composition', sizeKB: 215, note: 'Plain-language rewrite; updated fee schedule.' },
    ],
  },
  {
    id: 'd-harbor-notice-privacy',
    clientId: 'harbor',
    name: 'Annual Privacy Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'privacy', 'compliance', 'annual'],
    versions: [
      { v: 1, date: '2025-04-29', author: 'InfoIMAGE Composition', sizeKB: 184, note: 'GLBA model privacy form.' },
    ],
  },

  // ── Harbor Point — additional Tax Forms ──────────────────────────────
  {
    id: 'd-harbor-tax-1098',
    clientId: 'harbor',
    name: '1098 Mortgage Interest — Layout',
    category: 'Tax Forms',
    fileType: 'pdf',
    tags: ['tax', '1098', 'mortgage', 'year-end'],
    versions: [
      { v: 1, date: '2025-12-18', author: 'InfoIMAGE Composition', sizeKB: 158, note: 'TY2025 layout.' },
    ],
  },

  // ── Harbor Point — Statements / Assets / SOW / Legal ─────────────────
  {
    id: 'd-harbor-stmt-run-2026-05',
    clientId: 'harbor',
    name: 'Monthly Statement Run — May 2026',
    category: 'Statements',
    fileType: 'pdf',
    tags: ['statements', 'production', 'monthly'],
    versions: [
      { v: 1, date: '2026-05-31', author: 'InfoIMAGE Production', sizeKB: 17600, note: 'May 2026 cycle — 80,914 statements composed.' },
    ],
  },
  {
    id: 'd-harbor-asset-logo',
    clientId: 'harbor',
    name: 'Brand Logo Pack',
    category: 'Assets',
    fileType: 'png',
    tags: ['asset', 'logo', 'brand'],
    versions: [
      { v: 1, date: '2024-07-01', author: 'Harbor Point Marketing', sizeKB: 1980, note: 'Primary and reversed logos.' },
    ],
  },
  {
    id: 'd-harbor-sow-estmt',
    clientId: 'harbor',
    name: 'SOW — eStatements+ Implementation',
    category: 'SOWs',
    fileType: 'docx',
    tags: ['sow', 'eStatements+', 'implementation'],
    versions: [
      { v: 1, date: '2024-07-02', author: 'PMO — InfoIMAGE', sizeKB: 310, note: 'Signed — initial e-delivery rollout.' },
    ],
  },
  {
    id: 'd-harbor-soc2',
    clientId: 'harbor',
    name: 'InfoIMAGE SOC 2 Type II Report',
    category: 'Legal',
    fileType: 'pdf',
    tags: ['security', 'soc2', 'compliance', 'audit'],
    versions: [
      { v: 1, date: '2025-10-01', author: 'Security — InfoIMAGE', sizeKB: 1840, note: 'FY2025 SOC 2 Type II, clean opinion.' },
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
