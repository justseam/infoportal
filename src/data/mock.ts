import type {
  Client,
  Persona,
  Doc,
  DocCategory,
  DocVersion,
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
    coreSystem: 'Symitar Episys',
  },
  {
    id: 'harbor',
    name: 'Harbor Point Federal Credit Union',
    shortName: 'Harbor Point FCU',
    cid: 'HPFC',
    accent: '#1d6fb8',
    members: 92500,
    coreSystem: 'Corelation KeyStone',
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

// ---- Notice library + compliance sweep ----------------------------------
//
// Summit runs ~100 distinct notice designs. Rather than hand-author all of
// them, the long tail is generated from a table of real notice types below.
//
// Dates here are RELATIVE TO TODAY, not hardcoded, so date questions ("what
// changed in the last 30 days") stay true whenever the demo is run instead of
// going stale the way fixed dates do.

const DAY_MS = 86_400_000

/** ISO (YYYY-MM-DD) date n days before today. */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10)
}

/** Deterministic PRNG so the repository looks identical on every reload. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

/**
 * The notice that got MISSED in the compliance sweep — the needle the AI has
 * to find. Peripheral enough to be plausibly overlooked, real enough to matter.
 */
export const SWEEP_MISSED_DOC_ID = 'd-summit-notice-safedeposit'

/** Notice types making up Summit's long tail, as [slug, display name, ...tags]. */
const NOTICE_TYPES: [string, string, string[]][] = [
  ['safedeposit', 'Safe Deposit Box Rent Due Notice', ['safe deposit', 'billing', 'annual']],
  ['overdraftfee', 'Overdraft Fee Assessment Notice', ['overdraft', 'fee', 'reg e']],
  ['unauthtxn', 'Unauthorized Transaction Confirmation Notice', ['fraud', 'dispute', 'reg e']],
  ['disputeack', 'Dispute Acknowledgement Notice', ['dispute', 'reg e', 'acknowledgement']],
  ['disputeresolved', 'Dispute Resolution Outcome Notice', ['dispute', 'reg e', 'resolution']],
  ['provcredit', 'Provisional Credit Notice', ['dispute', 'reg e', 'credit']],
  ['achreturn', 'ACH Return Notification', ['ach', 'return', 'payments']],
  ['achauth', 'ACH Authorization Revocation Notice', ['ach', 'authorization', 'reg e']],
  ['wireconfirm', 'Wire Transfer Confirmation Notice', ['wire', 'confirmation', 'payments']],
  ['wirerecall', 'Wire Recall Request Notice', ['wire', 'recall', 'payments']],
  ['mobiledeposit', 'Mobile Deposit Hold Notice', ['mobile', 'deposit', 'hold']],
  ['depositadj', 'Deposit Adjustment Notice', ['deposit', 'adjustment', 'correction']],
  ['checkorder', 'Check Order Confirmation Notice', ['checks', 'order', 'confirmation']],
  ['checkfraud', 'Check Fraud Alert Notice', ['fraud', 'checks', 'alert']],
  ['garnishment', 'Account Garnishment / Levy Notice', ['legal', 'garnishment', 'levy']],
  ['powerofattorney', 'Power of Attorney Acceptance Notice', ['legal', 'poa', 'authorization']],
  ['beneficiary', 'Beneficiary Designation Confirmation', ['beneficiary', 'confirmation', 'estate']],
  ['deceased', 'Deceased Member Account Notice', ['estate', 'deceased', 'legal']],
  ['minorage', 'Minor Account Age-Out Notice', ['youth', 'age-out', 'conversion']],
  ['jointowner', 'Joint Owner Removal Notice', ['ownership', 'joint', 'change']],
  ['signaturecard', 'Signature Card Update Request', ['ownership', 'signature', 'request']],
  ['idverify', 'Identity Verification Request Notice', ['bsa', 'cip', 'verification']],
  ['cddrefresh', 'Customer Due Diligence Refresh Notice', ['bsa', 'cdd', 'compliance']],
  ['w9request', 'W-9 / TIN Certification Request', ['tax', 'w-9', 'tin']],
  ['backupwithhold', 'Backup Withholding Notice (B-Notice)', ['tax', 'irs', 'withholding']],
  ['escheatprenote', 'Pre-Escheatment Contact Notice', ['dormancy', 'escheatment', 'state']],
  ['inactivefee', 'Inactive Account Fee Notice', ['dormancy', 'fee', 'inactive']],
  ['lowbalance', 'Low Balance Alert Notice', ['alert', 'balance', 'deposit']],
  ['negbalance', 'Negative Balance Cure Notice', ['overdraft', 'collections', 'cure']],
  ['chargeoff', 'Account Charge-Off Notice', ['collections', 'charge-off', 'loss']],
  ['collections1', 'Collections First Contact Notice', ['collections', 'past due', 'fdcpa']],
  ['collectionsfinal', 'Collections Final Demand Notice', ['collections', 'demand', 'fdcpa']],
  ['repossession', 'Vehicle Repossession Notice', ['collections', 'auto', 'repossession']],
  ['rightocure', 'Right to Cure Default Notice', ['collections', 'cure', 'lending']],
  ['deficiency', 'Deficiency Balance Notice', ['collections', 'deficiency', 'auto']],
  ['loanapproval', 'Loan Approval Notice', ['lending', 'approval', 'origination']],
  ['loandenial', 'Loan Denial Notice', ['lending', 'denial', 'ecoa']],
  ['counteroffer', 'Counteroffer Notice', ['lending', 'counteroffer', 'ecoa']],
  ['incompleteapp', 'Incomplete Application Notice', ['lending', 'application', 'ecoa']],
  ['appraisaldisc', 'Appraisal Disclosure Notice', ['mortgage', 'appraisal', 'ecoa']],
  ['escrowanalysis', 'Escrow Analysis Statement Notice', ['mortgage', 'escrow', 'respa']],
  ['escrowshortage', 'Escrow Shortage Notice', ['mortgage', 'escrow', 'shortage']],
  ['pmicancel', 'PMI Cancellation Eligibility Notice', ['mortgage', 'pmi', 'hpa']],
  ['forceplaced', 'Force-Placed Insurance Notice', ['mortgage', 'insurance', 'collateral']],
  ['insurancelapse', 'Collateral Insurance Lapse Notice', ['lending', 'insurance', 'collateral']],
  ['titlerelease', 'Title Release Notice', ['auto', 'title', 'payoff']],
  ['lienrelease', 'Lien Release Confirmation', ['lending', 'lien', 'payoff']],
  ['mortgagestatement', 'Mortgage Periodic Statement Notice', ['mortgage', 'periodic', 'reg z']],
  ['heloc-draw', 'HELOC Draw Period Ending Notice', ['heloc', 'draw', 'lending']],
  ['heloc-freeze', 'HELOC Account Freeze Notice', ['heloc', 'freeze', 'reg z']],
  ['creditlimit', 'Credit Limit Change Notice', ['credit card', 'limit', 'reg z']],
  ['aprchange', 'APR Change Notice', ['credit card', 'apr', 'reg z']],
  ['minpayment', 'Minimum Payment Warning Notice', ['credit card', 'payment', 'card act']],
  ['promoexpiry', 'Promotional Rate Expiration Notice', ['credit card', 'promo', 'reg z']],
  ['cardreplace', 'Card Replacement Notice', ['debit card', 'replacement', 'card']],
  ['carddeclined', 'Card Transaction Declined Notice', ['debit card', 'declined', 'alert']],
  ['atmfee', 'ATM Fee Reimbursement Notice', ['atm', 'fee', 'reimbursement']],
  ['travelnotice', 'Travel Notice Confirmation', ['debit card', 'travel', 'confirmation']],
  ['recurringpay', 'Recurring Payment Update Notice', ['payments', 'recurring', 'reg e']],
  ['billpaystop', 'Bill Pay Stop Request Confirmation', ['bill pay', 'stop', 'reg e']],
  ['billpayfail', 'Bill Pay Payment Failure Notice', ['bill pay', 'failure', 'payments']],
  ['p2pfail', 'P2P Transfer Failure Notice', ['p2p', 'failure', 'reg e']],
  ['directdeposit', 'Direct Deposit Setup Confirmation', ['payroll', 'direct deposit', 'ach']],
  ['payrollchange', 'Payroll Allocation Change Notice', ['payroll', 'allocation', 'change']],
  ['iracontrib', 'IRA Contribution Confirmation', ['ira', 'contribution', 'retirement']],
  ['iratransfer', 'IRA Transfer Confirmation Notice', ['ira', 'transfer', 'retirement']],
  ['hsacontrib', 'HSA Contribution Limit Notice', ['hsa', 'contribution', 'irs']],
  ['cdrenewal', 'CD Auto-Renewal Confirmation', ['certificate', 'renewal', 'deposit']],
  ['cdpenalty', 'Early Withdrawal Penalty Notice', ['certificate', 'penalty', 'deposit']],
  ['ratefloor', 'Deposit Rate Floor Change Notice', ['deposit', 'rate', 'change']],
  ['feeschedule', 'Annual Fee Schedule Update Notice', ['fee', 'schedule', 'annual']],
  ['membership', 'Membership Eligibility Confirmation', ['membership', 'eligibility', 'onboarding']],
  ['welcomekit', 'New Member Welcome Notice', ['membership', 'onboarding', 'welcome']],
  ['closureconfirm', 'Account Closure Confirmation Notice', ['closure', 'confirmation', 'deposit']],
  ['statementsupp', 'Statement Suppression Confirmation', ['eStatements+', 'suppression', 'paperless']],
  ['emailbounce', 'Email Delivery Failure Notice', ['eStatements+', 'bounce', 'delivery']],
  ['returnmail', 'Returned Mail / Bad Address Notice', ['mail', 'address', 'undeliverable']],
  ['branchclosure', 'Branch Closure Notification', ['branch', 'closure', 'member comms']],
  ['databreach', 'Security Incident Notification', ['security', 'incident', 'breach']],
]

/** Build the generated long tail of Summit notice designs. */
function buildNoticeLibrary(): Doc[] {
  const rnd = seeded(20260901)
  const authors = ['InfoIMAGE Composition', 'InfoIMAGE Client Services', 'Summit CU Compliance']
  return NOTICE_TYPES.map(([slug, name, tags]) => {
    // 1–3 versions of prior history, oldest first, spread across past years.
    const count = 1 + Math.floor(rnd() * 3)
    const versions: DocVersion[] = []
    let age = 420 + Math.floor(rnd() * 480) // first version 14–30 months ago
    for (let i = 0; i < count; i++) {
      versions.push({
        v: i + 1,
        date: daysAgo(age),
        author: authors[Math.floor(rnd() * authors.length)],
        sizeKB: 140 + Math.floor(rnd() * 90),
        note:
          i === 0
            ? `Initial ${name.toLowerCase()} template.`
            : PRIOR_NOTES[Math.floor(rnd() * PRIOR_NOTES.length)],
      })
      age -= 90 + Math.floor(rnd() * 200)
      if (age < 150) age = 150 + Math.floor(rnd() * 60)
    }
    return {
      id: `d-summit-notice-${slug}`,
      clientId: 'summit',
      name: `${name} — Design`,
      category: 'Notice Designs' as const,
      fileType: 'pdf' as const,
      tags: ['notice', ...tags],
      versions,
    }
  })
}

const PRIOR_NOTES = [
  'Logo and brand refresh applied.',
  'Plain-language rewrite of member-facing copy.',
  'Address block updated to new corporate HQ.',
  'Accessibility pass — contrast and font size adjustments.',
  'Spanish translation variant linked.',
  'Reformatted for duplex printing to reduce postage.',
  'Added QR code linking to the member portal.',
  'Footer disclosures reordered per legal review.',
]

const SUMMIT_NOTICE_LIBRARY: Doc[] = buildNoticeLibrary()

/**
 * Which system produces each document's data file.
 *
 * Only some member communications come off the core. The rest are driven by
 * ancillary platforms (collections, mortgage servicing, card processing, the
 * LOS) or are built in house from a file the FI assembles itself. Rules are
 * evaluated IN ORDER against the document's tags + name, so put the more
 * specific system ahead of the general one — a repossession notice is
 * collections, not lending; a card fraud alert is the card processor, not
 * "security". Anything unmatched falls through to the client's own core.
 */
const SOURCE_RULES: {
  match: RegExp
  system: string
  note: string
  /** restrict the rule to certain categories; omitted = applies to all */
  categories?: DocCategory[]
}[] = [
  {
    match: /marketing|\boffer\b|skip a pay|welcome|onboarding|membership/,
    system: 'In-house / Marketing',
    note: 'Member-comms file assembled by the FI — no system of record behind it.',
  },
  {
    match: /collections|fdcpa|charge-off|repossession|deficiency|past due|delinquency|demand|\bcure\b/,
    system: 'Temenos Lifecycle Management',
    note: 'Collections platform extract — separate nightly file from the core.',
  },
  {
    match: /insurance|collateral|force-placed/,
    system: 'Allied Solutions',
    note: 'Insurance tracking vendor — CPI and lapse data never touches the core.',
  },
  {
    match: /mortgage|escrow|respa|\bpmi\b|\bhpa\b|appraisal|\barm\b/,
    system: 'Black Knight MSP',
    note: 'Mortgage servicing system of record — sub-serviced outside the core.',
  },
  {
    match: /ecoa|origination|approval|denial|counteroffer|incomplete app|adverse action/,
    system: 'MeridianLink Consumer',
    note: 'Loan origination system — adverse-action data lives with the application.',
  },
  {
    match: /credit card|debit card|\bcard\b|\batm\b/,
    system: 'Fiserv Card Services',
    note: 'Card processor file — card events are not posted to the core.',
  },
  {
    match: /bill pay|\bp2p\b/,
    system: 'Fiserv CheckFree',
    note: 'Bill pay / P2P platform — payment failures originate in the payments hub.',
  },
  {
    match: /\bira\b|\bhsa\b|retirement|\brmd\b|5498|1099-r/,
    system: 'Ascensus',
    note: 'Retirement plan administrator — IRA/HSA records are held by the custodian.',
  },
  {
    // notices only — a statement TAGGED eStatements+ is merely delivered that
    // way; its data still comes off whatever system composes the statement.
    match: /estatements\+|paperless|suppression|bounce|undeliverable|returned mail/,
    system: 'InfoIMAGE eStatements+',
    note: 'Generated by the delivery platform itself from bounce / suppression events.',
    categories: ['Notice Designs'],
  },
  {
    match: /breach|incident|\bsecurity\b|branch|member comms/,
    system: 'In-house / Compliance',
    note: 'Ad hoc file prepared by the FI for an event-driven mailing.',
  },
]

/**
 * Documents that stay on the core even though they trip a rule above — a
 * signature card is an ownership record, not a payment card.
 */
const CORE_OVERRIDES = /signature card/

/** Categories composed from a data file, and so having a source system. */
const DATA_DRIVEN: DocCategory[] = ['Notice Designs', 'Statement Designs', 'Tax Forms']

/** Tag every data-driven document with the system its data comes from. */
function assignSources(docs: Doc[]): void {
  for (const d of docs) {
    if (!DATA_DRIVEN.includes(d.category)) continue
    const hay = `${d.name} ${d.tags.join(' ')}`.toLowerCase()
    const hit = CORE_OVERRIDES.test(hay)
      ? undefined
      : SOURCE_RULES.find(
          (r) => (!r.categories || r.categories.includes(d.category)) && r.match.test(hay),
        )
    if (hit) {
      d.source = { system: hit.system, core: false, note: hit.note }
    } else {
      const core = CLIENTS.find((c) => c.id === d.clientId)?.coreSystem ?? 'Core'
      d.source = {
        system: core,
        core: true,
        note: 'Standard core output — included in the nightly core extract.',
      }
    }
  }
}

/**
 * The compliance sweep: Summit's compliance team mandated a verbiage change
 * across every notice design, and the update ran over the past few weeks.
 * Every Summit notice gets a new version dated inside the last 30 days —
 * except SWEEP_MISSED_DOC_ID, which was overlooked. That straggler is the
 * whole point of the "what hasn't been updated?" question.
 */
function applyComplianceSweep(docs: Doc[]): void {
  const rnd = seeded(77213)
  for (const d of docs) {
    if (d.clientId !== 'summit' || d.category !== 'Notice Designs') continue
    if (d.id === SWEEP_MISSED_DOC_ID) continue
    const last = d.versions[d.versions.length - 1]
    d.versions.push({
      v: last.v + 1,
      date: daysAgo(4 + Math.floor(rnd() * 24)), // 4–27 days ago
      author: 'Summit CU Compliance',
      sizeKB: last.sizeKB + 2 + Math.floor(rnd() * 6),
      note:
        'Compliance verbiage update — error-resolution disclosure and dispute contact block refreshed per 2026 review.',
    })
  }
  // Keep every document's versions in chronological order.
  for (const d of docs) d.versions.sort((a, b) => a.date.localeCompare(b.date) || a.v - b.v)
}

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

  // ── Summit — additional Notice Designs (unique types) ────────────────
  {
    id: 'd-summit-notice-addrchange',
    clientId: 'summit',
    name: 'Address Change Confirmation Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'address change', 'confirmation'],
    versions: [
      { v: 1, date: '2024-04-09', author: 'InfoIMAGE Composition', sizeKB: 162, note: 'Initial address-change confirmation.' },
      { v: 2, date: '2025-09-15', author: 'InfoIMAGE Composition', sizeKB: 166, note: 'Added "report if you did not request this" fraud line.' },
    ],
  },
  {
    id: 'd-summit-notice-returndep',
    clientId: 'summit',
    name: 'Returned Deposit Item Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'returned item', 'deposit', 'compliance'],
    versions: [
      { v: 1, date: '2024-05-21', author: 'InfoIMAGE Composition', sizeKB: 178, note: 'Initial returned-deposit-item notice.' },
      { v: 2, date: '2025-06-30', author: 'InfoIMAGE Composition', sizeKB: 181, note: 'Added return-reason code table.' },
    ],
  },
  {
    id: 'd-summit-notice-stoppay',
    clientId: 'summit',
    name: 'Stop Payment Confirmation Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'stop payment', 'confirmation'],
    versions: [
      { v: 1, date: '2024-06-18', author: 'InfoIMAGE Composition', sizeKB: 158, note: 'Initial stop-payment confirmation with expiration terms.' },
    ],
  },
  {
    id: 'd-summit-notice-acctclose',
    clientId: 'summit',
    name: 'Account Closure Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'account closure', 'compliance'],
    versions: [
      { v: 1, date: '2024-03-27', author: 'InfoIMAGE Composition', sizeKB: 170, note: 'Initial account-closure notice.' },
      { v: 2, date: '2025-02-18', author: 'InfoIMAGE Composition', sizeKB: 174, note: 'Added final-balance disbursement instructions.' },
      { v: 3, date: '2026-03-05', author: 'InfoIMAGE Composition', sizeKB: 176, note: 'Plain-language rewrite; reason-for-closure section.' },
    ],
  },
  {
    id: 'd-summit-notice-regcc',
    clientId: 'summit',
    name: 'Funds Availability (Reg CC) Hold Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'reg cc', 'hold', 'funds availability', 'compliance'],
    versions: [
      { v: 1, date: '2024-07-08', author: 'InfoIMAGE Composition', sizeKB: 184, note: 'Initial Reg CC exception hold notice.' },
      { v: 2, date: '2025-11-03', author: 'InfoIMAGE Composition', sizeKB: 188, note: 'Updated hold-period thresholds per regulatory change.' },
    ],
  },
  {
    id: 'd-summit-notice-rege',
    clientId: 'summit',
    name: 'Electronic Error Resolution (Reg E) Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'reg e', 'error resolution', 'compliance'],
    versions: [
      { v: 1, date: '2024-08-22', author: 'InfoIMAGE Composition', sizeKB: 192, note: 'Initial Reg E error-resolution acknowledgment.' },
      { v: 2, date: '2026-01-14', author: 'InfoIMAGE Composition', sizeKB: 196, note: 'Added provisional-credit timeline table.' },
    ],
  },
  {
    id: 'd-summit-notice-changeterms',
    clientId: 'summit',
    name: 'Change in Terms Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'change in terms', 'disclosure', 'compliance'],
    versions: [
      { v: 1, date: '2024-09-30', author: 'InfoIMAGE Composition', sizeKB: 174, note: 'Initial change-in-terms notice.' },
      { v: 2, date: '2025-10-20', author: 'InfoIMAGE Composition', sizeKB: 178, note: 'Side-by-side current vs new terms layout.' },
    ],
  },
  {
    id: 'd-summit-notice-courtesypay',
    clientId: 'summit',
    name: 'Courtesy Pay Opt-In Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'courtesy pay', 'overdraft', 'opt-in', 'reg e'],
    versions: [
      { v: 1, date: '2024-05-06', author: 'InfoIMAGE Composition', sizeKB: 166, note: 'Initial Courtesy Pay (Reg E A-9) opt-in form.' },
      { v: 2, date: '2025-07-11', author: 'InfoIMAGE Composition', sizeKB: 169, note: 'Clarified ATM/one-time debit coverage.' },
    ],
  },
  {
    id: 'd-summit-notice-pastdue',
    clientId: 'summit',
    name: 'Loan Payment Past Due Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'loan', 'past due', 'delinquency'],
    versions: [
      { v: 1, date: '2024-04-15', author: 'InfoIMAGE Composition', sizeKB: 172, note: 'Initial past-due reminder.' },
      { v: 2, date: '2025-05-27', author: 'InfoIMAGE Composition', sizeKB: 175, note: 'Added late-fee and days-past-due summary box.' },
      { v: 3, date: '2026-04-02', author: 'InfoIMAGE Composition', sizeKB: 177, note: 'Added hardship-assistance contact information.' },
    ],
  },
  {
    id: 'd-summit-notice-payoff',
    clientId: 'summit',
    name: 'Loan Payoff Confirmation Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'loan', 'payoff', 'confirmation', 'lien release'],
    versions: [
      { v: 1, date: '2024-10-01', author: 'InfoIMAGE Composition', sizeKB: 164, note: 'Initial payoff confirmation with lien-release language.' },
    ],
  },
  {
    id: 'd-summit-notice-skippay',
    clientId: 'summit',
    name: 'Skip-A-Payment Offer Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'skip a pay', 'loan', 'offer', 'marketing'],
    versions: [
      { v: 1, date: '2024-11-12', author: 'InfoIMAGE Composition', sizeKB: 220, note: 'Initial holiday Skip-A-Pay offer.' },
      { v: 2, date: '2025-11-10', author: 'InfoIMAGE Composition', sizeKB: 226, note: 'Refreshed creative; added online opt-in QR code.' },
    ],
  },
  {
    id: 'd-summit-notice-cardexp',
    clientId: 'summit',
    name: 'Debit Card Expiration Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'debit card', 'expiration', 'reissue'],
    versions: [
      { v: 1, date: '2024-06-25', author: 'InfoIMAGE Composition', sizeKB: 160, note: 'Initial card-expiration reminder.' },
      { v: 2, date: '2025-12-09', author: 'InfoIMAGE Composition', sizeKB: 163, note: 'Added digital-wallet update reminder.' },
    ],
  },
  {
    id: 'd-summit-notice-fraudalert',
    clientId: 'summit',
    name: 'Debit Card Fraud Alert Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'debit card', 'fraud', 'security'],
    versions: [
      { v: 1, date: '2024-08-05', author: 'InfoIMAGE Composition', sizeKB: 156, note: 'Initial suspected-fraud alert notice.' },
      { v: 2, date: '2025-09-29', author: 'InfoIMAGE Composition', sizeKB: 159, note: 'Added fraud-line short code and never-share-PIN warning.' },
      { v: 3, date: '2026-05-12', author: 'InfoIMAGE Composition', sizeKB: 161, note: 'Plain-language rewrite; clearer next-steps checklist.' },
    ],
  },
  {
    id: 'd-summit-notice-rmd',
    clientId: 'summit',
    name: 'IRA Required Minimum Distribution Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'ira', 'rmd', 'retirement', 'compliance'],
    versions: [
      { v: 1, date: '2025-01-09', author: 'InfoIMAGE Composition', sizeKB: 182, note: 'Initial annual RMD notice.' },
      { v: 2, date: '2026-01-08', author: 'InfoIMAGE Composition', sizeKB: 184, note: 'Updated RMD age per SECURE 2.0.' },
    ],
  },
  {
    id: 'd-summit-notice-arm',
    clientId: 'summit',
    name: 'ARM Rate Adjustment Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'arm', 'mortgage', 'rate adjustment', 'compliance'],
    versions: [
      { v: 1, date: '2024-07-30', author: 'InfoIMAGE Composition', sizeKB: 198, note: 'Initial ARM rate-change notice (CFPB timing rules).' },
      { v: 2, date: '2025-08-14', author: 'InfoIMAGE Composition', sizeKB: 202, note: 'Added old vs new payment and index/margin breakdown.' },
    ],
  },

  // ── Harbor Point — additional Notice Designs (unique types) ──────────
  {
    id: 'd-harbor-notice-garnishment',
    clientId: 'harbor',
    name: 'Garnishment / Levy Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'garnishment', 'levy', 'legal', 'compliance'],
    versions: [
      { v: 1, date: '2024-10-22', author: 'InfoIMAGE Composition', sizeKB: 190, note: 'Initial garnishment/levy hold notice.' },
      { v: 2, date: '2026-02-03', author: 'InfoIMAGE Composition', sizeKB: 194, note: 'Added protected-funds (federal benefits) disclosure.' },
    ],
  },
  {
    id: 'd-harbor-notice-beneficiary',
    clientId: 'harbor',
    name: 'Beneficiary Designation Confirmation Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'beneficiary', 'confirmation'],
    versions: [
      { v: 1, date: '2025-03-19', author: 'InfoIMAGE Composition', sizeKB: 168, note: 'Initial beneficiary-update confirmation.' },
    ],
  },
  {
    id: 'd-harbor-notice-unclaimed',
    clientId: 'harbor',
    name: 'Unclaimed Property (Final Escheat) Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'unclaimed property', 'escheat', 'compliance'],
    versions: [
      { v: 1, date: '2025-05-02', author: 'InfoIMAGE Composition', sizeKB: 176, note: 'Initial final escheatment notice (pre-state-remittance).' },
      { v: 2, date: '2026-04-21', author: 'InfoIMAGE Composition', sizeKB: 179, note: 'Added state-by-state remittance-date table.' },
    ],
  },
  {
    id: 'd-harbor-notice-forceplaced',
    clientId: 'harbor',
    name: 'Force-Placed Insurance Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'insurance', 'force-placed', 'mortgage', 'compliance'],
    versions: [
      { v: 1, date: '2024-12-11', author: 'InfoIMAGE Composition', sizeKB: 186, note: 'Initial force-placed insurance warning (first + second notice).' },
    ],
  },
  {
    id: 'd-harbor-notice-paperless',
    clientId: 'harbor',
    name: 'Paperless Enrollment Confirmation Notice — Design',
    category: 'Notice Designs',
    fileType: 'pdf',
    tags: ['notice', 'paperless', 'eStatements+', 'enrollment', 'confirmation'],
    versions: [
      { v: 1, date: '2025-06-17', author: 'InfoIMAGE Composition', sizeKB: 150, note: 'Initial e-statement enrollment confirmation.' },
      { v: 2, date: '2026-03-24', author: 'InfoIMAGE Composition', sizeKB: 152, note: 'Added how-to-revert-to-paper instructions.' },
    ],
  },
  ...SUMMIT_NOTICE_LIBRARY,
]

assignSources(DOCS)
applyComplianceSweep(DOCS)

// ---- Invoices (for billing comparisons) ---------------------------------

function inv(clientId: string, period: string, lines: Invoice['lines']): Invoice {
  const total = lines.reduce((s, l) => s + l.amount, 0)
  return { id: `inv-${clientId}-${period}`, clientId, period, lines, total }
}

export const INVOICES: Invoice[] = [
  inv('summit', '2025-06', [
    { service: 'Print', qty: 182000, amount: 25480 },
    { service: 'Postage', qty: 182000, amount: 34580 },
    { service: 'eStatements+', qty: 78000, amount: 3900 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 182000, amount: 1820 },
  ]),
  inv('summit', '2025-07', [
    { service: 'Print', qty: 179000, amount: 25060 },
    { service: 'Postage', qty: 179000, amount: 34010 },
    { service: 'eStatements+', qty: 82000, amount: 4100 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 179000, amount: 1790 },
  ]),
  inv('summit', '2025-08', [
    { service: 'Print', qty: 176000, amount: 24640 },
    { service: 'Postage', qty: 176000, amount: 33440 },
    { service: 'eStatements+', qty: 85000, amount: 4250 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 176000, amount: 1760 },
  ]),
  inv('summit', '2025-09', [
    { service: 'Print', qty: 173000, amount: 24220 },
    { service: 'Postage', qty: 173000, amount: 32870 },
    { service: 'eStatements+', qty: 89000, amount: 4450 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 173000, amount: 1730 },
  ]),
  inv('summit', '2025-10', [
    { service: 'Print', qty: 171000, amount: 23940 },
    { service: 'Postage', qty: 171000, amount: 32490 },
    { service: 'eStatements+', qty: 92000, amount: 4600 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 171000, amount: 1710 },
  ]),
  inv('summit', '2025-11', [
    { service: 'Print', qty: 170000, amount: 23800 },
    { service: 'Postage', qty: 170000, amount: 32300 },
    { service: 'eStatements+', qty: 94000, amount: 4700 },
    { service: 'Composition', qty: 1, amount: 2200 },
    { service: 'Insert Mgmt', qty: 170000, amount: 1700 },
  ]),
  inv('summit', '2025-12', [
    { service: 'Print', qty: 173000, amount: 24220 },
    { service: 'Postage', qty: 173000, amount: 32870 },
    { service: 'eStatements+', qty: 95000, amount: 4750 },
    { service: 'Composition', qty: 1, amount: 2450 },
    { service: 'Insert Mgmt', qty: 173000, amount: 1730 },
  ]),
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
  inv('harbor', '2025-09', [
    { service: 'Print', qty: 92000, amount: 12880 },
    { service: 'Postage', qty: 92000, amount: 17480 },
    { service: 'eStatements+', qty: 33000, amount: 1650 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2025-10', [
    { service: 'Print', qty: 90000, amount: 12600 },
    { service: 'Postage', qty: 90000, amount: 17100 },
    { service: 'eStatements+', qty: 35000, amount: 1750 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2025-11', [
    { service: 'Print', qty: 89000, amount: 12460 },
    { service: 'Postage', qty: 89000, amount: 16910 },
    { service: 'eStatements+', qty: 37000, amount: 1850 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2025-12', [
    { service: 'Print', qty: 91000, amount: 12740 },
    { service: 'Postage', qty: 91000, amount: 17290 },
    { service: 'eStatements+', qty: 38000, amount: 1900 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2026-01', [
    { service: 'Print', qty: 88000, amount: 12320 },
    { service: 'Postage', qty: 88000, amount: 16720 },
    { service: 'eStatements+', qty: 39000, amount: 1950 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2026-02', [
    { service: 'Print', qty: 86000, amount: 12040 },
    { service: 'Postage', qty: 86000, amount: 16340 },
    { service: 'eStatements+', qty: 40000, amount: 2000 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
  inv('harbor', '2026-03', [
    { service: 'Print', qty: 85000, amount: 11900 },
    { service: 'Postage', qty: 85000, amount: 16150 },
    { service: 'eStatements+', qty: 40500, amount: 2025 },
    { service: 'Composition', qty: 1, amount: 1400 },
  ]),
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
  '2025-06': 'Jun 2025',
  '2025-07': 'Jul 2025',
  '2025-08': 'Aug 2025',
  '2025-09': 'Sep 2025',
  '2025-10': 'Oct 2025',
  '2025-11': 'Nov 2025',
  '2025-12': 'Dec 2025',
  '2026-01': 'Jan 2026',
  '2026-02': 'Feb 2026',
  '2026-03': 'Mar 2026',
  '2026-04': 'Apr 2026',
  '2026-05': 'May 2026',
  '2026-06': 'Jun 2026',
}
