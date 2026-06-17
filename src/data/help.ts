// Help content modeled on the InfoIMAGE Help Portal information architecture
// (Products -> Categories -> Articles). Topics & structure mirror the real
// help site; bodies are written for this prototype.

export type HelpIcon = 'trac' | 'care' | 'publisher'

export interface HelpProduct {
  id: string
  name: string
  blurb: string
  icon: HelpIcon
}

export interface HelpDoc {
  id: string
  productId: string
  category: string
  title: string
  /** body supports: blank-line paragraphs, "• " bullets, "1. " steps, **bold**, and "## " subheads */
  body: string
  updated: string // ISO date
}

export const HELP_PRODUCTS: HelpProduct[] = [
  {
    id: 'infotrac',
    name: 'InfoTRAC',
    blurb: 'The client portal for managing statements, notices, inserts, eNotifications, banners, proofing, and marketing campaigns.',
    icon: 'trac',
  },
  {
    id: 'infocare',
    name: 'InfoCARE',
    blurb: 'How to request new documents, design changes, and other support from your InfoIMAGE team.',
    icon: 'care',
  },
  {
    id: 'infopublisher',
    name: 'InfoPublisher',
    blurb: 'Self-service publishing and document presentment — configure how statements and documents are delivered and displayed.',
    icon: 'publisher',
  },
]

const D = '2025-07-03'

export const HELP_DOCS: HelpDoc[] = [
  // ── InfoTRAC · Introduction ───────────────────────────────────────────
  {
    id: 'it-intro-purpose',
    productId: 'infotrac',
    category: 'Introduction',
    title: 'Purpose',
    updated: D,
    body: `InfoTRAC is InfoIMAGE's web-based client portal. It gives financial institutions a single place to monitor production jobs, approve proofs, manage electronic delivery, configure notifications, and run marketing campaigns across their statements and notices.

This guide introduces the core modules and how they fit together so your team can get the most out of the platform.`,
  },
  {
    id: 'it-intro-overview',
    productId: 'infotrac',
    category: 'Introduction',
    title: 'Module Overview',
    updated: D,
    body: `InfoTRAC is organized into modules, each covering one area of work:

• **Job Status** — track print/mail and electronic jobs through production
• **Account Management** — look up members and manage delivery preferences
• **E-Notifications** — configure triggered email/SMS alerts
• **Insert / E-Insert Management** — add marketing or compliance inserts
• **Banner & Message Management** — place targeted messages on statements and online banking
• **Reports & Response Tracker** — measure delivery, adoption, and campaign response

Your available modules depend on the products your institution has enabled.`,
  },

  // ── InfoTRAC · Accessing InfoTRAC ─────────────────────────────────────
  {
    id: 'it-access-login',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Logging In',
    updated: D,
    body: `To sign in to InfoTRAC, go to your institution's InfoTRAC URL and enter the username and password provided by your administrator.

1. Enter your **username**.
2. Enter your **password**.
3. Click **Log In**.

If your institution uses Single Sign-On, you will be routed to your identity provider instead of seeing the password field.`,
  },
  {
    id: 'it-access-password-criteria',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Password Criteria',
    updated: D,
    body: `A password will be valid only after it has met the following criteria:

• Users cannot reuse their last password
• Passwords cannot be less than 8 characters
• Password must contain at least 1 digit
• Passwords must contain at least 1 lowercase alphabetic character
• Passwords must contain at least 1 uppercase alphabetic character
• Passwords must contain at least 1 special character
• Passwords cannot contain any space`,
  },
  {
    id: 'it-access-sso',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Single Sign-On (SSO)',
    updated: D,
    body: `Single Sign-On lets your users access InfoTRAC using your institution's existing identity provider (IdP), so they don't manage a separate InfoTRAC password.

InfoTRAC supports **SAML 2.0** and **OAuth2 / OIDC**. When SSO is enabled, the login page hands off to your IdP; after authentication, users are returned to InfoTRAC with their role applied.

Role mapping is driven by your IdP groups. Contact your InfoIMAGE representative to configure the audience URI and group-to-role mapping.`,
  },
  {
    id: 'it-access-account-lock',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Account Lock',
    updated: D,
    body: `For security, an account is locked after repeated failed login attempts.

If your account is locked, wait for the lockout period to elapse or contact an administrator to unlock it. Administrators can unlock a user from **User Management**.`,
  },
  {
    id: 'it-access-reset-password',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Reset Password',
    updated: D,
    body: `To reset a forgotten password, click **Forgot Password** on the login page and follow the emailed reset link.

Administrators can also trigger a reset for any user from **User Management** → select the user → **Reset Password**. The new password must meet the Password Criteria.`,
  },
  {
    id: 'it-access-password-prompt',
    productId: 'infotrac',
    category: 'Accessing InfoTRAC',
    title: 'Password Prompt Feature',
    updated: D,
    body: `InfoTRAC prompts users to update their password before it expires. When a password is nearing expiration, a reminder appears at login so users can change it without being locked out.`,
  },

  // ── InfoTRAC · Account Management (V2) ─────────────────────────────────
  {
    id: 'it-acct-delivery-both',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'Both as Delivery Preference',
    updated: D,
    body: `The **Both** delivery preference means a member receives a document **electronically and in print**.

Use Both during a paper-suppression transition, or for members who want a paper copy in addition to e-delivery. Note that Both does not generate print/postage savings, since a paper copy is still produced — use **Electronic** to realize savings.`,
  },
  {
    id: 'it-acct-notification-pref',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'Notification Preference',
    updated: D,
    body: `A member's notification preference controls how they are alerted when a new document is ready.

Options typically include **Email**, **SMS/Text**, or both. Set or update a member's notification preference from their account profile. A valid, deliverable email or mobile number is required for the alert to send.`,
  },
  {
    id: 'it-acct-user-creation',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'User Creation',
    updated: D,
    body: `Account Management lets authorized staff create and maintain member profiles.

1. Open **Account Management**.
2. Click **Create User** (or **Add Account**).
3. Enter the member's identifying details and contact information.
4. Set the delivery and notification preferences.
5. Save.

The new profile is immediately available for delivery-preference and document lookups.`,
  },
  {
    id: 'it-acct-search-keyword',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'Search Keyword',
    updated: D,
    body: `Use the search keyword field to find a member by account number, name, or email.

Enter your term and choose the matching **Search Type** to control how the keyword is matched.`,
  },
  {
    id: 'it-acct-search-type',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'Search Type',
    updated: D,
    body: `Search Type controls how your keyword is matched:

• **Exact Match** — returns only records that match the keyword exactly
• **Contains / Partial** — returns records that include the keyword anywhere in the field

Use Exact Match when you have a full account number; use partial matching when searching by partial name.`,
  },
  {
    id: 'it-acct-exact-match',
    productId: 'infotrac',
    category: 'Account Management (V2)',
    title: 'Exact Match',
    updated: D,
    body: `Exact Match returns only the records whose value is identical to your search keyword. This is the fastest, most precise way to look up a member when you know the full account number or email address.`,
  },

  // ── InfoTRAC · E-Insert Management ─────────────────────────────────────
  {
    id: 'it-einsert-edit-delete',
    productId: 'infotrac',
    category: 'E-Insert Management',
    title: 'Edit/Delete Insert',
    updated: D,
    body: `You can edit or remove an electronic insert before its job is finalized.

• **Edit** — open the insert, update the file or its targeting/date range, and save.
• **Delete** — remove the insert from the job entirely.

Once a job has moved past the production cutoff, inserts are locked and can no longer be edited or deleted.`,
  },
  {
    id: 'it-einsert-statuses',
    productId: 'infotrac',
    category: 'E-Insert Management',
    title: 'Statuses',
    updated: D,
    body: `Each e-insert moves through a series of statuses:

• **Draft** — created but not yet submitted
• **Pending Approval** — awaiting review
• **Approved** — ready to be included in the job
• **Active / Live** — currently attached to a running job
• **Expired** — past its scheduled date range

The status column tells you at a glance whether an insert still needs action.`,
  },
  {
    id: 'it-einsert-upload',
    productId: 'infotrac',
    category: 'E-Insert Management',
    title: 'Uploading an E-Insert',
    updated: D,
    body: `To add an electronic insert:

1. Open **E-Insert Management**.
2. Click **Add Insert** and upload your PDF.
3. Set the application (e.g., statements) and the date range it should run.
4. Optionally target specific account criteria.
5. Submit for approval.`,
  },

  // ── InfoTRAC · Transfer Statement ──────────────────────────────────────
  {
    id: 'it-transfer-workflow',
    productId: 'infotrac',
    category: 'Transfer Statement',
    title: 'Transfer Statement Workflow',
    updated: D,
    body: `Transfer Statement moves a member's document history from one account to another — useful for account restructuring, mergers, or correcting a misassigned account.

The workflow is:

1. Locate the **source** account and select the statements to transfer.
2. Specify the **destination** account.
3. Review the transfer summary.
4. Confirm — the selected document history is reassigned to the destination account.

Transfers are recorded in the audit log.`,
  },
  {
    id: 'it-transfer-eligibility',
    productId: 'infotrac',
    category: 'Transfer Statement',
    title: 'Transfer Eligibility',
    updated: D,
    body: `Not every document is eligible for transfer. Documents must belong to the same institution and statement type. Tax documents may have additional restrictions because they are tied to a tax identification number. If a document can't be transferred, InfoTRAC will flag it during the review step.`,
  },

  // ── InfoTRAC · E-Notification ──────────────────────────────────────────
  {
    id: 'it-enotif-setup',
    productId: 'infotrac',
    category: 'E-Notification',
    title: 'Setting Up Notifications',
    updated: D,
    body: `E-Notifications send triggered alerts (statement ready, notice posted, etc.) to members by email or SMS.

Define a trigger, choose the template, and set the audience. When the triggering event occurs, the alert is queued and sent automatically.`,
  },
  {
    id: 'it-enotif-bounce',
    productId: 'infotrac',
    category: 'E-Notification',
    title: 'Bounce Handling',
    updated: D,
    body: `When an alert can't be delivered, it is recorded as a **bounce**. Monitor the bounce report regularly — a sudden rise usually means a stale email file. Update the member's contact info and resend.`,
  },
  {
    id: 'it-enotif-templates',
    productId: 'infotrac',
    category: 'E-Notification',
    title: 'Managing Templates',
    updated: D,
    body: `Notification templates control the subject line and body of each alert. Edit a template to update wording, links, and branding. Always send yourself a test before activating a changed template.`,
  },

  // ── InfoTRAC · Banner Management ───────────────────────────────────────
  {
    id: 'it-banner-create',
    productId: 'infotrac',
    category: 'Banner Management',
    title: 'Creating a Banner',
    updated: D,
    body: `Banners place a targeted promotional image in the member's eStatement or online banking view.

1. Open **Banner Management** and click **Create Banner**.
2. Upload the banner image and add a click-through URL.
3. Set the date range and audience.
4. Submit for approval.`,
  },
  {
    id: 'it-banner-targeting',
    productId: 'infotrac',
    category: 'Banner Management',
    title: 'Banner Targeting',
    updated: D,
    body: `Target a banner to a specific audience using account criteria — product type, balance band, or a custom segment file. Untargeted banners display to all eligible members.`,
  },

  // ── InfoTRAC · Marketing ───────────────────────────────────────────────
  {
    id: 'it-mktg-campaign',
    productId: 'infotrac',
    category: 'Marketing',
    title: 'Running a Campaign',
    updated: D,
    body: `The Marketing module ties banners, inserts, and messages into a coordinated campaign so a single offer can reach members across print and digital touchpoints. Define the offer, attach the assets, set the schedule, and track results in the Response Tracker.`,
  },

  // ── InfoTRAC · Pop-up Alert ────────────────────────────────────────────
  {
    id: 'it-popup-create',
    productId: 'infotrac',
    category: 'Pop-up Alert',
    title: 'Creating a Pop-up Alert',
    updated: D,
    body: `A pop-up alert displays a brief message to members when they log in to view documents — useful for urgent notices like a fee change or maintenance window. Set the message, date range, and audience, then submit.`,
  },

  // ── InfoTRAC · Dashboard ───────────────────────────────────────────────
  {
    id: 'it-dash-overview',
    productId: 'infotrac',
    category: 'Dashboard',
    title: 'Dashboard Overview',
    updated: D,
    body: `The Dashboard is your landing page in InfoTRAC. It summarizes recent jobs, pending approvals, delivery health, and adoption at a glance, with quick links into each module.`,
  },
  {
    id: 'it-dash-job-status',
    productId: 'infotrac',
    category: 'Dashboard',
    title: 'Reading Job Status',
    updated: D,
    body: `Each print/mail job moves through **Composed → Proofed → Approved → Mailed**. Approve proofs within the SLA window to avoid schedule slips. Filter the list by application — Statements, Notices, or Tax — to focus on what needs action.`,
  },

  // ── InfoTRAC · Reports / Response Tracker ──────────────────────────────
  {
    id: 'it-reports-admin',
    productId: 'infotrac',
    category: 'Administrative Reports',
    title: 'Administrative Reports',
    updated: D,
    body: `Administrative Reports cover platform activity — user logins, role changes, and access history. Use them for security review and to demonstrate controls during an audit.`,
  },
  {
    id: 'it-response-tracker',
    productId: 'infotrac',
    category: 'Response Tracker',
    title: 'Using the Response Tracker',
    updated: D,
    body: `The Response Tracker measures how members respond to your banners, inserts, and campaigns — impressions, clicks, and conversions. Use it to compare offers and decide what to run again.`,
  },

  // ── InfoTRAC · DataTRAC ────────────────────────────────────────────────
  {
    id: 'it-datatrac-overview',
    productId: 'infotrac',
    category: 'DataTRAC',
    title: 'DataTRAC Overview',
    updated: D,
    body: `DataTRAC provides visibility into the data files that drive your statements and notices — file receipt, record counts, and processing status. Use it to confirm a data file arrived and processed as expected before a job runs.`,
  },

  // ── InfoTRAC · Insert Management ───────────────────────────────────────
  {
    id: 'it-insert-physical',
    productId: 'infotrac',
    category: 'Insert Management',
    title: 'Adding a Physical Insert',
    updated: D,
    body: `Insert Management handles physical inserts that are mailed with printed statements. Schedule the insert against a print job, confirm weight/postage impact, and submit before the production cutoff.`,
  },

  // ── InfoTRAC · Return Mail ─────────────────────────────────────────────
  {
    id: 'it-returnmail-overview',
    productId: 'infotrac',
    category: 'Return Mail',
    title: 'Return Mail Tracking',
    updated: D,
    body: `Return Mail tracks pieces returned as undeliverable. Review the return mail report to identify members with bad addresses, then update their address or switch them to electronic delivery to reduce future returns.`,
  },

  // ── InfoTRAC · User Management ─────────────────────────────────────────
  {
    id: 'it-user-roles',
    productId: 'infotrac',
    category: 'User Management',
    title: 'Roles & Permissions',
    updated: D,
    body: `User Management controls who can do what in InfoTRAC. Assign each user a role that grants the appropriate module access. With SSO enabled, roles are driven by your IdP groups rather than set manually.`,
  },
  {
    id: 'it-user-add',
    productId: 'infotrac',
    category: 'User Management',
    title: 'Adding a User',
    updated: D,
    body: `To add an InfoTRAC user:

1. Open **User Management** and click **Add User**.
2. Enter the user's name and email.
3. Assign a role.
4. Save — the user receives an invitation to set their password (unless SSO is in use).`,
  },

  // ── InfoCARE ───────────────────────────────────────────────────────────
  {
    id: 'care-request-new-doc',
    productId: 'infocare',
    category: 'Requests',
    title: 'Requesting a New Document',
    updated: D,
    body: `To request a brand-new document type (a new statement, notice, or letter), submit a request through InfoCARE.

Include the document's purpose, sample data, the desired layout or a reference design, and your target launch date. Your InfoIMAGE team will scope the work and respond with a timeline.`,
  },
  {
    id: 'care-design-change',
    productId: 'infocare',
    category: 'Requests',
    title: 'Requesting a Design Change',
    updated: D,
    body: `For changes to an existing document — wording, layout, disclosures, or branding — open a change request in InfoCARE.

Describe the change, attach a marked-up sample if you have one, and note any compliance deadline. Changes are versioned, so the prior design is always retained.`,
  },
  {
    id: 'care-status',
    productId: 'infocare',
    category: 'Requests',
    title: 'Tracking a Request',
    updated: D,
    body: `Every request has a status so you always know where it stands: **Received → In Review → In Progress → Proof Ready → Complete**. You'll be notified when a proof is ready for your approval.`,
  },
  {
    id: 'care-ticket',
    productId: 'infocare',
    category: 'Support',
    title: 'Opening a Support Ticket',
    updated: D,
    body: `For questions or issues that aren't a document change, open a support ticket. Tickets can be submitted directly from the portal, and integrate with TeamSupport so your conversation history stays in one place.`,
  },

  // ── InfoPublisher ──────────────────────────────────────────────────────
  {
    id: 'pub-overview',
    productId: 'infopublisher',
    category: 'Introduction',
    title: 'What is InfoPublisher?',
    updated: D,
    body: `InfoPublisher is the document presentment layer — it controls how electronic statements and documents are published and displayed to members in online and mobile banking.

Use it to configure document types, retention/archival periods, and the member-facing presentation of each document.`,
  },
  {
    id: 'pub-doc-types',
    productId: 'infopublisher',
    category: 'Configuration',
    title: 'Configuring Document Types',
    updated: D,
    body: `Each document type (statement, notice, tax form) can be configured separately — its display name, icon, sort order, and which members see it. Configure a new type before its first production run so it appears correctly in the member's document list.`,
  },
  {
    id: 'pub-archival',
    productId: 'infopublisher',
    category: 'Configuration',
    title: 'Archival & Retention',
    updated: D,
    body: `Set how long each document type is retained and available for member retrieval. Retention is configured per document type to match your institution's compliance policy. Archived documents remain searchable for the configured period.`,
  },
  {
    id: 'pub-sso',
    productId: 'infopublisher',
    category: 'Access',
    title: 'Online Banking SSO Hand-off',
    updated: D,
    body: `Members reach their published documents through a Single Sign-On hand-off from your online banking platform, so they never see a separate login. If documents aren't appearing, the most common cause is a mismatch in the SSO account identifier passed from online banking.`,
  },
]

// ── Derived helpers ──────────────────────────────────────────────────────

export interface HelpCategorySummary {
  name: string
  count: number
}

export function categoriesFor(productId: string): HelpCategorySummary[] {
  const map = new Map<string, number>()
  for (const d of HELP_DOCS) {
    if (d.productId !== productId) continue
    map.set(d.category, (map.get(d.category) ?? 0) + 1)
  }
  return [...map.entries()].map(([name, count]) => ({ name, count }))
}

export function docsFor(productId: string, category?: string): HelpDoc[] {
  return HELP_DOCS.filter((d) => d.productId === productId && (!category || d.category === category))
}

export function recentDocs(productId?: string, limit = 7): HelpDoc[] {
  return [...HELP_DOCS]
    .filter((d) => !productId || d.productId === productId)
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function searchDocs(q: string): HelpDoc[] {
  const term = q.trim().toLowerCase()
  if (!term) return []
  return HELP_DOCS.filter((d) =>
    (d.title + ' ' + d.category + ' ' + d.body).toLowerCase().includes(term),
  )
}

export function productName(productId: string): string {
  return HELP_PRODUCTS.find((p) => p.id === productId)?.name ?? productId
}
