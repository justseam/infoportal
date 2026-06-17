# InfoPORTAL — Smart Client Document Repository

A prototype of InfoIMAGE's secure client portal: a smarter document repository
for credit union & bank clients, with a **built-in AI assistant** that answers
natural-language questions about documents, version history, and billing.

> **Prototype only.** All clients, documents, and figures are fictitious and
> everything runs client-side (simulated AI engine, no backend, no API key).

Built from the *Client Help Portal Requirements (Info PORTAL)* doc, with the
"smarter repository + AI" direction layered on top.

## Run it

```bash
npm install
npm run dev      # http://localhost:5180
```

## Sign in

Pick a demo persona on the login screen to explore **role-based access**:

| Persona | Role | Sees |
|---|---|---|
| Dana Reyes | Standard Help User | Help site only |
| Marcus Hale | Document User | Repository, AI, billing, help |
| Priya Nandakumar | Internal Admin | All clients + user mgmt + audit |
| Justin Seamans | Super Admin | Everything + SSO settings |

Internal/Super personas get a **client switcher** in the top bar; client
personas are siloed to their own organization's repository.

## Features

- **Document repository** — per-client, siloed; categories for Contracts, SOWs,
  Legal, Statement Designs, Notice Designs, Tax Forms, Statements, Assets;
  search + category filters.
- **Version control per document** — full version timeline, view any version in
  a simulated viewer, download, and **compare two versions** side by side.
- **AI assistant (headline feature)** — ask in plain English:
  - "Show me previous versions of the monthly statement design"
  - "What changed between v2 and v3 of the tax form?"
  - "Compare our print vs postage spend over the last 5 months"
  - "How much have we spent on eStatements+ this year?"

  Returns analysis with **inline charts**, **billing tables**, and **clickable
  document/version citations**.
- **Invoicing & billing** — per-client invoices with month-over-month and
  by-service comparison charts (print, postage, eStatements+, composition).
- **Help site** — searchable how-tos, FAQs, and product guides.
- **Admin & audit** — user/permission management, live audit log (logins,
  uploads, downloads, edits), and SSO settings (Super Admin).

## Stack

React 19 · Vite · TypeScript · Tailwind v4 · React Router. Dependency-free SVG
charts. Mock data in `src/data/`; simulated AI in `src/lib/ai.ts`.

### Swapping the AI for live Claude

`src/lib/ai.ts` exposes `askAI(query, clientId): AIResponse`. To go live, replace
the rule-based handlers with a Claude API call (tool-use over the repository
data) returning the same `AIResponse` shape — the UI needs no changes.

## Project layout

```
src/
  data/        types.ts, mock.ts   (clients, docs+versions, invoices, help, audit)
  lib/ai.ts    simulated AI engine (intent routing -> text/chart/table/citations)
  state/       session.tsx          (persona, active client, audit, persistence)
  components/  Layout, DocViewer, ui (cards/charts), icons, Logo
  pages/       Login, Dashboard, Repository, DocumentDetail, Assistant, Billing, Help, Admin
```
