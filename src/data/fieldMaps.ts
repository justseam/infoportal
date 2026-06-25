import type { Doc } from './types'

/** One variable/merge field within a designed document. */
export interface FieldMapping {
  /** canonical key; the in-document token is `{{key}}` */
  key: string
  label: string
  /** where the value comes from in the source data */
  source: string
  /** display/data format */
  format: string
  /** example value shown in the client-facing Sample */
  sample: string
}

/** Categories whose designs are data-driven (have variable fields). */
const IN_SCOPE = new Set(['Notice Designs', 'Statement Designs', 'Tax Forms'])

/** Keys the document template places in fixed spots (header / recipient block). */
export const TEMPLATE_KEYS = ['member_name', 'member_address', 'acct_masked', 'acct_type', 'run_date']

function f(key: string, label: string, source: string, format: string, sample: string): FieldMapping {
  return { key, label, source, format, sample }
}

// ── Reusable field groups ─────────────────────────────────────────────────
const memberName = f('member_name', 'Member name', 'CIF.FULL_NAME', 'Text', 'Margaret R. Chen')
const memberAddress = f('member_address', 'Mailing address', 'CIF.MAIL_ADDRESS', 'Multi-line', '1180 Birchwood Ln, Madison, WI 53704')
const acctMasked = f('acct_masked', 'Account number (masked)', 'DDA.ACCT_NBR', '••••0000', '••••4417')
const acctType = f('acct_type', 'Account type', 'ACCT.TYPE_DESC', 'Text', 'Free Checking')
const noticeDate = f('run_date', 'Notice date', 'SYS.RUN_DATE', 'MM/DD/YYYY', '06/22/2026')
const stmtDate = f('run_date', 'Statement date', 'SYS.CYCLE_DATE', 'MM/DD/YYYY', '05/31/2026')
const taxYear = f('run_date', 'Tax year', 'SYS.TAX_YEAR', 'YYYY', '2025')

const COMMON_NOTICE = [memberName, memberAddress, acctMasked, acctType, noticeDate]

// ── Category defaults (used when a doc has no specific map) ────────────────
const CATEGORY_FIELDS: Record<string, FieldMapping[]> = {
  'Notice Designs': COMMON_NOTICE,
  'Statement Designs': [
    memberName,
    memberAddress,
    acctMasked,
    acctType,
    stmtDate,
    f('begin_balance', 'Beginning balance', 'STMT.BEG_BAL', '$#,##0.00', '$2,184.50'),
    f('deposits', 'Total deposits', 'STMT.DEP_TOTAL', '$#,##0.00', '$3,420.00'),
    f('withdrawals', 'Total withdrawals', 'STMT.WD_TOTAL', '$#,##0.00', '$3,012.74'),
    f('end_balance', 'Ending balance', 'STMT.END_BAL', '$#,##0.00', '$2,591.76'),
    f('interest_ytd', 'Interest paid YTD', 'STMT.INT_YTD', '$#,##0.00', '$14.62'),
  ],
  'Tax Forms': [
    f('member_name', 'Recipient name', 'CIF.FULL_NAME', 'Text', 'Margaret R. Chen'),
    memberAddress,
    f('recipient_tin', 'Recipient TIN (masked)', 'CIF.TIN', '•••-••-0000', '•••-••-3318'),
    f('payer_name', 'Payer name', 'INST.LEGAL_NAME', 'Text', 'Summit Credit Union'),
    f('payer_tin', 'Payer TIN', 'INST.EIN', 'XX-XXXXXXX', '39-1234567'),
    acctMasked,
    taxYear,
    f('box1_amount', 'Box 1 amount', 'TAX.BOX1', '$#,##0.00', '$128.44'),
  ],
}

// ── Document-specific maps (per version) ──────────────────────────────────
// Each returns the field set for a given version number. Later versions can
// add fields, reflecting the design change recorded in that version's note.
const DOC_FIELDS: Record<string, (v: number) => FieldMapping[]> = {
  // NSF / Overdraft notice — opt-out added in v2, Spanish/language added in v3
  'd-summit-notice-nsf': (v) => [
    ...COMMON_NOTICE,
    f('overdraft_amount', 'Amount overdrawn', 'TXN.OD_AMOUNT', '$#,##0.00', '$35.18'),
    f('nsf_fee', 'NSF / overdraft fee', 'FEE.NSF_AMOUNT', '$#,##0.00', '$30.00'),
    f('item_count', 'Number of items', 'TXN.OD_ITEM_CNT', 'Integer', '2'),
    f('item_date', 'Date of item(s)', 'TXN.OD_DATE', 'MM/DD/YYYY', '06/20/2026'),
    ...(v >= 2 ? [f('optout_method', 'Opt-out instructions', 'CFG.OPTOUT_TEXT', 'Text', 'Call 800-555-0142 or visit a branch')] : []),
    ...(v >= 3 ? [f('language_pref', 'Language preference', 'CIF.LANG_PREF', 'EN | ES', 'EN')] : []),
  ],
  'd-harbor-notice-nsf': (v) => [
    ...COMMON_NOTICE,
    f('overdraft_amount', 'Amount overdrawn', 'TXN.OD_AMOUNT', '$#,##0.00', '$42.07'),
    f('nsf_fee', 'NSF / overdraft fee', 'FEE.NSF_AMOUNT', '$#,##0.00', '$32.00'),
    f('item_count', 'Number of items', 'TXN.OD_ITEM_CNT', 'Integer', '1'),
    ...(v >= 2 ? [f('optout_method', 'Opt-out instructions', 'CFG.OPTOUT_TEXT', 'Text', 'Call 800-555-0188')] : []),
  ],
  // Certificate maturity — new APY field added in v2
  'd-summit-notice-maturity': (v) => [
    ...COMMON_NOTICE,
    f('cert_number', 'Certificate number', 'CD.CERT_NBR', '••••0000', '••••2092'),
    f('maturity_date', 'Maturity date', 'CD.MATURITY_DT', 'MM/DD/YYYY', '07/15/2026'),
    f('current_balance', 'Current balance', 'CD.CURR_BAL', '$#,##0.00', '$10,000.00'),
    f('current_apy', 'Current APY', 'CD.CURR_APY', '0.00%', '4.25%'),
    f('renewal_term', 'Renewal term', 'CD.TERM_DESC', 'Text', '12-month'),
    ...(v >= 2 ? [f('new_apy', 'New (renewal) APY', 'CD.NEW_APY', '0.00%', '4.50%')] : []),
  ],
  // Loan payment past due — hardship contact added in v3
  'd-summit-notice-pastdue': (v) => [
    ...COMMON_NOTICE,
    f('loan_number', 'Loan number', 'LN.LOAN_NBR', '••••0000', '••••7741'),
    f('amount_due', 'Amount past due', 'LN.PAST_DUE_AMT', '$#,##0.00', '$412.65'),
    f('due_date', 'Original due date', 'LN.DUE_DATE', 'MM/DD/YYYY', '06/01/2026'),
    f('days_past_due', 'Days past due', 'LN.DAYS_PAST_DUE', 'Integer', '24'),
    ...(v >= 2 ? [f('late_fee', 'Late fee assessed', 'LN.LATE_FEE', '$#,##0.00', '$25.00')] : []),
    ...(v >= 3 ? [f('hardship_phone', 'Hardship assistance line', 'CFG.HARDSHIP_PHONE', 'Phone', '800-555-0170')] : []),
  ],
  // Debit card expiration — wallet reminder added in v2
  'd-summit-notice-cardexp': (v) => [
    ...COMMON_NOTICE,
    f('card_last4', 'Card last 4', 'CARD.LAST4', '0000', '6612'),
    f('expiration', 'Expiration date', 'CARD.EXP_DATE', 'MM/YY', '07/26'),
    ...(v >= 2 ? [f('wallet_flag', 'Has digital wallet', 'CARD.WALLET_FLAG', 'Y | N', 'Y')] : []),
  ],
  // ARM rate adjustment — old vs new breakdown added in v2
  'd-summit-notice-arm': (v) => [
    ...COMMON_NOTICE,
    f('loan_number', 'Loan number', 'LN.LOAN_NBR', '••••0000', '••••3380'),
    f('effective_date', 'Rate effective date', 'LN.RATE_EFF_DT', 'MM/DD/YYYY', '09/01/2026'),
    f('new_rate', 'New interest rate', 'LN.NEW_RATE', '0.000%', '6.875%'),
    f('new_payment', 'New monthly payment', 'LN.NEW_PMT', '$#,##0.00', '$1,842.10'),
    ...(v >= 2
      ? [
          f('old_rate', 'Previous rate', 'LN.PRIOR_RATE', '0.000%', '6.250%'),
          f('old_payment', 'Previous payment', 'LN.PRIOR_PMT', '$#,##0.00', '$1,712.44'),
          f('index_margin', 'Index + margin', 'LN.INDEX_MARGIN', 'Text', 'SOFR + 2.75%'),
        ]
      : []),
  ],
  // Monthly statement — rewards summary added in v2
  'd-summit-stmt-monthly': (v) => [
    ...(CATEGORY_FIELDS['Statement Designs'] as FieldMapping[]),
    ...(v >= 2 ? [f('rewards_balance', 'Rewards points balance', 'RWD.POINT_BAL', '#,##0', '12,480')] : []),
  ],
  // 1099-INT — rich tax boxes
  'd-summit-tax-1099int': () => [
    f('member_name', 'Recipient name', 'CIF.FULL_NAME', 'Text', 'Margaret R. Chen'),
    memberAddress,
    f('recipient_tin', 'Recipient TIN (masked)', 'CIF.TIN', '•••-••-0000', '•••-••-3318'),
    f('payer_name', 'Payer name', 'INST.LEGAL_NAME', 'Text', 'Summit Credit Union'),
    f('payer_tin', 'Payer TIN', 'INST.EIN', 'XX-XXXXXXX', '39-1234567'),
    acctMasked,
    taxYear,
    f('box1_int_income', 'Box 1 — Interest income', 'TAX.1099INT.BOX1', '$#,##0.00', '$128.44'),
    f('box4_fed_withheld', 'Box 4 — Federal tax withheld', 'TAX.1099INT.BOX4', '$#,##0.00', '$0.00'),
  ],
}

/** Returns the per-version field map for a document, or null if not data-driven. */
export function getFieldMap(doc: Doc, version: number): FieldMapping[] | null {
  if (!IN_SCOPE.has(doc.category)) return null
  const fn = DOC_FIELDS[doc.id]
  if (fn) return fn(version)
  return CATEGORY_FIELDS[doc.category] ?? null
}

export function hasFieldMap(doc: Doc): boolean {
  return IN_SCOPE.has(doc.category)
}
