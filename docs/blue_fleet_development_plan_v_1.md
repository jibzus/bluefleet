# BlueFleet — Development Plan (MVP)

**Methodology**: Iterative sprints (2 weeks), trunk‑based dev, CI/CD on Vercel, PR reviews required.  
**Tooling**: pnpm, Turborepo optional, Prisma, ESLint/Prettier, Vitest/Playwright, Sentry.

---

## 1) Project Setup
- Initialize Next.js (App Router, TS), Tailwind, shadcn/ui; set base theme tokens.
- Configure Prisma with Postgres (Neon).  
- Set env vars for providers (staging keys).  
- Add authentication (NextAuth credentials).  
- Add base components (Button, Input, Card, Dialog, Tabs).  
- CI: Lint, typecheck, unit tests; Preview deployments on PR.

---

## 2) Sprint Plan (Phased)

### Sprint 1 — Foundations (Weeks 1–2)
- **User Story**: As a user, I can sign up, log in, and access a role‑appropriate dashboard.
- **Design Spec**: Auth screens; role choice; empty dashboards.
- **Technical Spec**: Auth routes; Prisma models for `User`, `KycRecord`; RBAC middleware; Sentry.
- **Acceptance Criteria**: Auth flows work; dashboards load; baseline a11y and perf budgets set.

### Sprint 2 — KYC & Vessel CRUD (Weeks 3–4)
- **User Story**: As an owner, I can submit KYC and create a vessel listing.
- **Design Spec**: KYC stepper; multi‑tab Vessel form with media and availability.
- **Technical Spec**: File uploads; image optimization; `Vessel`, `Certification`, `AvailabilitySlot` models.
- **Acceptance Criteria**: KYC status machine; vessel publish with required fields; images persisted.

### Sprint 3 — Search & Details (Weeks 5–6)
- **User Story**: As an operator, I can find vessels with filters and view details.
- **Design Spec**: Filter drawer; results grid; details page with badges and sticky CTA.
- **Technical Spec**: Edge search route; materialized view; SSR detail page; URL‑synced filters.
- **Acceptance Criteria**: p95 < 1s on search; details render; a11y checks.

### Sprint 4 — Booking & Negotiation (Weeks 7–8)
- **User Story**: As parties, we can request/accept and negotiate terms.
- **Design Spec**: Request modal; timeline thread.
- **Technical Spec**: `Booking` model; status transitions; email notifications.
- **Acceptance Criteria**: End‑to‑end request → accept path; history visible to both.

### Sprint 5 — Contract & Escrow (Weeks 9–10)
- **User Story**: As parties, we can sign a contract and fund escrow.
- **Design Spec**: Contract preview; signature; payment sheet.
- **Technical Spec**: PDF generation; e‑signature integration; Paystack + webhook; Flutterwave fallback.
- **Acceptance Criteria**: Test txn flows; signed PDF stored; webhook idempotency.

### Sprint 6 — Tracking & Compliance (Weeks 11–12)
- **User Story**: As an operator, I can track trips; as admin, I can view compliance.
- **Design Spec**: Trips map with auto‑refresh; compliance dashboard.
- **Technical Spec**: AIS polling cron; `TrackingEvent`; `ComplianceRecord`; expiry alerts.
- **Acceptance Criteria**: Position updates ≤ 15 min; expiry emails fire; regulator read‑only works.

### Sprint 7 — Analytics Lite & Admin (Weeks 13–14)
- **User Story**: As an owner/admin, I can see utilization KPIs and suggestions.
- **Design Spec**: KPI cards; charts; admin tables.
- **Technical Spec**: Aggregations; rules‑based suggestions; admin pages.
- **Acceptance Criteria**: KPIs correct; suggestions visible with provenance.

### Sprint 8 — Hardening & Pilot (Weeks 15–16)
- **User Story**: As a pilot user, I can complete booking start to finish reliably.
- **Design Spec**: N/A.
- **Technical Spec**: Perf tuning; a11y fixes; e2e tests; seed data; observability.
- **Acceptance Criteria**: Go/No‑Go checklist passes; 5 pilot users successful.

---

## 3) Work Breakdown Structure (WBS)
- Platform Setup
  - Repo, CI, Vercel projects (staging/prod)
  - Env secrets management
- Auth & RBAC
- KYC/KYB & Docs
- Vessel CRUD & Media
- Search & Details (Edge)
- Booking & Negotiation
- Contract & Signature
- Payments & Webhooks
- Tracking (AIS) & Trips
- Compliance & Immutable Store
- Analytics Lite
- Admin & Regulator Consoles
- Testing (unit/integration/e2e), Security checks, Perf tuning

---

## 4) Environments
- **Local**: Docker Postgres or Neon dev; .env.local; mock providers.  
- **Staging**: Full integrations with test keys; sample data.  
- **Prod**: Real keys; restricted access; audit logging.

---

## 5) Definition of Done (per story)
- Code merged with review; tests passing (unit where applicable, happy‑path e2e if critical).  
- a11y checked; performance within budget; feature flags toggled as needed.  
- Docs updated (README, ADRs if architecture changed).

---

## 6) Acceptance Test Inventory (per sprint example)
- Auth: create/login/logout; RBAC redirect; session persist.  
- KYC: submit, approve, reject; email notifications.  
- Vessel: create/edit/publish; image upload limits; availability conflicts.  
- Search: filter combinations; deep links; p95 latency.  
- Booking: request/accept/decline/counter; timeline correctness.  
- Contract: generate; sign; version immutability.  
- Payments: webhook idempotency; edge cases (3‑DS fail; timeout).  
- Tracking: 15‑min updates; offline cache; fallback provider.  
- Compliance: expiry alerts; regulator read‑only; export.

---

## 7) CI/CD & Quality Gates
- Lint + typecheck required; unit tests ≥ 80% critical modules; Playwright smoke on PR.  
- Preview deployments auto; production requires "Approved" review and green checks.  
- Sentry issue budget (no new P1s); Lighthouse perf ≥ 85 mobile on key pages.

