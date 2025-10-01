# BlueFleet — Test Plan (MVP)

**QA Lead**: Engineering/QA  
**Test Levels**: Unit, Integration, E2E, Performance, Security, Compliance, UAT.

---

## 1) Test Strategy
- **Shift‑left**: unit tests for business logic; component tests for forms; contract tests for webhooks.  
- **E2E**: Playwright for core flows (search → booking → contract → escrow → tracking).  
- **Perf**: Search p95 <1s (edge); page load p75 <2s; AIS polling reliability.  
- **Security**: AuthZ bypass attempts; webhook signature verification; basic DAST.  
- **Compliance**: NDPR/GDPR flows (export, erase), immutable doc hashes; expiry alerts.  
- **Accessibility**: WCAG 2.1 AA via automated checks + manual keyboard/screen reader.

---

## 2) Test Environments
- **Local** with mock services; **Staging** with test keys; **Prod** monitoring & canary checks.  
- Seed datasets: 20 vessels, 5 owners, 3 operators, 1 regulator, realistic docs.

---

## 3) Test Cases by Feature (with 4‑part scope)

### T‑AUTH‑001 — Signup/Login/Role
- **User Story**: As a user, I can sign up, log in, and be routed to my role dashboard.
- **Design Spec**: Auth screens with inline errors; role selection; success redirects.
- **Technical Spec**: NextAuth; Prisma `User`; route guards; session cookies.
- **Acceptance Criteria**: New account works; invalid creds error; role remembered; logout clears session.

### T‑KYC‑002 — KYC/KYB Workflow
- **User Story**: As an owner, I can submit company details and docs for approval.
- **Design Spec**: 5‑step wizard; progress; status chips.
- **Technical Spec**: `KycRecord` states; file upload; admin review.
- **Acceptance Criteria**: Draft→Submitted→Approved; rejection notes displayed; email notifications sent.

### T‑VES‑003 — Vessel CRUD
- **User Story**: As an owner, I can create a vessel listing with images and availability.
- **Design Spec**: Multi‑tab form; gallery; calendar.
- **Technical Spec**: Models `Vessel`, `VesselMedia`, `AvailabilitySlot`.
- **Acceptance Criteria**: Required fields enforced; publish gate; edit persists; images optimized.

### T‑SRCH‑004 — Search & Filter
- **User Story**: As an operator, I can find vessels with filters in <1s p95.
- **Design Spec**: Filter drawer; chips; results grid; empty state.
- **Technical Spec**: Edge route; materialized view; URL sync.
- **Acceptance Criteria**: Latency budget met; filters combine; deep link reproducible.

### T‑BK‑005 — Booking & Negotiation
- **User Story**: As parties, we can negotiate and accept booking terms.
- **Design Spec**: Thread timeline; status badges.
- **Technical Spec**: `Booking` status machine; emails.
- **Acceptance Criteria**: Request→Counter→Accept; audit trail consistent; decline path works.

### T‑CT‑006 — Contract & Signature
- **User Story**: As parties, we can sign a generated contract and store it immutably.
- **Design Spec**: PDF preview; signature pad/provider; version history.
- **Technical Spec**: PDF generation; webhook; hash store.
- **Acceptance Criteria**: Signed PDF saved; hashes consistent; download/print ok.

### T‑PAY‑007 — Escrow Payment
- **User Story**: As an operator, I can fund escrow and see status updates; owner sees payout.
- **Design Spec**: Payment sheet; status pills.
- **Technical Spec**: Paystack + webhook; Flutterwave fallback; idempotency key.
- **Acceptance Criteria**: Success/failure paths handled; webhook retries; release only after completion.

### T‑TRK‑008 — AIS Tracking
- **User Story**: As an operator, I can view live position updates and history.
- **Design Spec**: Map with 15‑min refresh; history tab.
- **Technical Spec**: Polling cron; cache; fallback provider.
- **Acceptance Criteria**: Updates within 15 min; offline last‑known; provider outage banner.

### T‑CMP‑009 — Compliance & Alerts
- **User Story**: As admin/regulator, I can view compliance statuses and receive expiry alerts.
- **Design Spec**: Dashboard; export; badges.
- **Technical Spec**: `ComplianceRecord`, `VerificationLog`; alert cron; export.
- **Acceptance Criteria**: 30‑day alerts; export CSV/PDF; regulator read‑only enforced.

### T‑ANL‑010 — Analytics Lite
- **User Story**: As an owner, I can view utilization KPIs and price suggestions.
- **Design Spec**: KPI cards; charts; explanation tooltips.
- **Technical Spec**: Aggregations; rules engine.
- **Acceptance Criteria**: KPIs correct vs fixtures; suggestions rendered with provenance.

---

## 4) Performance Tests
- K6/Artillery scripts for search endpoint under 100 rps; p95 <1s edge; DB CPU < 70%.  
- Lighthouse CI for Search, Details, Booking (mobile ≥ 85).

---

## 5) Security Tests
- AuthZ tests on all API routes; RCE/SQLi linters; webhook signature verification tests; dependency scan.  
- Privacy checks: PII encrypted; right‑to‑erasure honored where lawful.

---

## 6) UAT Plan
- 5 pilot users (2 owners, 2 operators, 1 regulator) run scripted scenarios; capture NPS and time-to-booking.  
- Exit criteria: No P0/P1 defects; KPIs within target; sign‑off from stakeholders.

---

## 7) Reporting
- Daily test run report during sprints; defect triage board; DOR/DoD checklists.  
- Release summary with coverage, known issues, and risk acceptance.

