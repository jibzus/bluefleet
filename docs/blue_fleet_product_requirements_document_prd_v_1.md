# BlueFleet — Product Requirements Document (PRD)

**Product**: BlueFleet (Digital Vessel Leasing Marketplace)  
**Version**: 1.0 (MVP scope)  
**Owner**: Product (PM), Design (UX Lead), Engineering (Dev Lead)  
**Stack Target**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Vercel  

---

## 1) Problem Statement & Goals
BlueFleet reduces 4–6 week brokered vessel leasing cycles to hours, cuts fees to a flat 7%, and ensures transparent, compliant bookings with AIS tracking and escrow protections. The MVP must:
- Enable compliant vessel listings and fast discovery.
- Support booking, contracting (e‑signature), and escrow payment flow.
- Provide AIS-based tracking and immutable compliance records.
- Be mobile-first, performant, and reliable in low-connectivity environments.

### Success Metrics (MVP)
- **Time-to-booking**: ≤ 36 hours median from request to contract.
- **Search latency**: < 1s p95 for catalog queries on Vercel Edge.
- **Compliance pass rate**: ≥ 95% validated listings (docs uploaded, verified states).
- **Transaction success**: ≥ 98% successful escrow charge → release transitions.
- **Uptime**: 99.9% core flows; tracking updates ≤ 15 min intervals.

---

## 2) Users & Roles
- **Vessel Owner (Supplier)**: lists vessels, manages availability and documents, accepts bookings, gets paid via escrow release.
- **Operator (Buyer: IOCs/NOCs)**: searches vessels, validates compliance, books, signs contract, pays into escrow, monitors tracking.
- **Admin**: moderates listings, manages disputes, configures pricing rule sets, handles compliance escalations.
- **Regulator (Read-only)**: view compliance dashboards and audit trails, read-only access to immutable records.

Role-based access control (RBAC) is required. 2FA optional for MVP, recommended for Admin.

---

## 3) Scope (MVP Epics → Stories)

### EPIC A — Authentication & Onboarding
**Goal**: Secure multi-role onboarding with KYC/KYB capture.
- **A1** Signup & Login (email/phone), basic profile, role selection.  
- **A2** KYC/KYB form flow (company details, IDs, certifications), document upload, status state machine (Draft → Submitted → Approved/Rejected).
- **A3** RBAC permissions baseline; audit logging for key events.

### EPIC B — Vessel Catalog & Search
**Goal**: Owners list vessels; Operators discover via fast, faceted search.
- **B1** Create/Edit Vessel: specs, images, certifications, availability calendar, price config.  
- **B2** Faceted Search & Filters: type, location, price, availability dates, compliance status, emissions profile; sort by price, rating, recency.  
- **B3** Listing Details: gallery, specs, compliance badges, owner profile, availability, quote button.

### EPIC C — Booking, Contracting & Escrow
**Goal**: From request to signed contract and payment in ≤ 3 clicks from listing details.
- **C1** Booking Request: dates, terms, custom clauses; owner acceptance/negotiation.  
- **C2** Contract Generation (templated) & E‑signature; contract versioning.  
- **C3** Escrow Payment (Paystack primary, Flutterwave failover); multi‑currency NGN/USD; payout to owners; automated release triggers on completion.

### EPIC D — Tracking & Operations
**Goal**: Real-time AIS tracking, route history, reliable failover/caching.
- **D1** AIS Integration (MarineTraffic primary; exactEarth fallback).  
- **D2** 15‑min polling, route maps, event markers (depart/arrive), offline cache.  
- **D3** Ops Dashboard (for live trips), incident notes, status updates.

### EPIC E — Compliance & Auditability
**Goal**: Verified compliance, immutable records, expiry alerts.
- **E1** Compliance Engine: NIMASA/NIPEX verification statuses, SOLAS checks.  
- **E2** Immutable Docs (write-once log; hash-on-chain or append‑only store), 30‑day expiry alerts.  
- **E3** Read-only Regulator console.

### EPIC F — Pricing Intelligence (MVP‑Lite)
**Goal**: Baseline analytics and pricing hints (rule-based initially).
- **F1** Utilization & Pricing Dashboard.  
- **F2** Rules engine for price suggestions (heuristic), event logs.

---

## 4) Non‑Goals (MVP)
- Native iOS/Android (PWA-first; revisit post‑MVP).  
- USSD/WhatsApp transactional flows (notifications ok via email).  
- Full AI pricing models (ship later; start rules/analytics).  
- Multi-tenant SaaS with org hierarchies (keep single-tenant roles; plan for later).

---

## 5) Requirements

### Functional Requirements (Top)
1) Auth & RBAC with KYC/KYB workflow.  
2) Vessel CRUD with media and availability management.  
3) Faceted search (<1s p95) with server-side filtering (Edge).  
4) Booking request → e‑signature contract → escrow payment → payout.  
5) AIS tracking (15‑min updates), route visualization, caches.  
6) Compliance checks, immutable document store, expiry alerts.  
7) Admin & Regulator consoles (moderation, audits).  

### Non‑Functional Requirements
- **Performance**: <1s search p95; <2s page load p75.  
- **Reliability**: 99.9% uptime on core flows; graceful third‑party failover.  
- **Security**: OAuth best practices, encrypted storage, audit trails, NDPR/GDPR.  
- **Accessibility**: WCAG 2.1 AA; keyboard and screen reader friendly.  
- **Localization**: EN at launch; framework ready for Yoruba/FR/PT.  

---

## 6) Feature Breakdown (Stories with 4‑part scope)

### A1 — Signup & Login (Email/Phone)
- **User Story**: As any user, I can create an account and sign in with email/phone to access my role’s console.
- **Design Spec**: Minimalist auth screens; success leads into role selection; error states inline; mobile-first.
- **Technical Spec**: Next.js app router; `app/(auth)/signup`, `app/(auth)/signin`; shadcn `Card`, `Input`, `Button`; server actions for credential handling; optional OTP stub; store sessions via NextAuth (Credentials provider) with JWT; Prisma adapter (Postgres on Vercel or Neon).
- **Acceptance Criteria**: Create account, login, logout work across desktop/mobile; sessions persist; errors surfaced; basic throttling.

### A2 — KYC/KYB Flow
- **User Story**: As an Owner/Operator, I can submit identity/company docs for approval.
- **Design Spec**: Stepper form with progress; document uploader with drag‑drop; status badges.
- **Technical Spec**: Routes `app/(dashboard)/kyc`; components `KycStepper.tsx`, `DocUpload.tsx`; file uploads to Vercel Blob/S3; server actions to persist metadata in Postgres; status state machine.
- **Acceptance Criteria**: Draft → Submitted → Approved/Rejected transitions; admins can review; emails on status change.

### B1 — Create/Edit Vessel
- **User Story**: As an Owner, I can create a compliant listing with images, specs, and availability.
- **Design Spec**: Multi-tab form (Specs, Media, Compliance, Pricing, Availability); autosave; validation.
- **Technical Spec**: `app/owner/vessels/new|[id]`; components `VesselForm/*`; image upload with image optimization; availability calendar (date range picker); data models `Vessel`, `Certification`, `PricingTier`, `AvailabilitySlot`.
- **Acceptance Criteria**: CRUD works; validations for required fields; images optimized; compliance docs attached.

### B2 — Search & Filters
- **User Story**: As an Operator, I can quickly filter vessels by type, location, compliance, price, availability.
- **Design Spec**: Left filter rail (Disclosure), results grid/cards; empty and loading states.
- **Technical Spec**: Route `app/search`; server components fetch with URL params; Postgres full‑text + trigram; PostGIS (optional) for geo; edge caching; shadcn `Command` for quick search.
- **Acceptance Criteria**: p95 < 1s; filters reflect in URL; no client errors; deep links shareable.

### B3 — Listing Details
- **User Story**: As an Operator, I can view detailed specs, compliance badges, and request booking.
- **Design Spec**: Hero gallery, spec grid, badges, availability calendar, sticky CTA.
- **Technical Spec**: `app/vessel/[slug]`; components `ImageCarousel`, `SpecGrid`, `ComplianceBadge`, `StickyCTA`.
- **Acceptance Criteria**: Renders data; CTA initiates booking; responsive and accessible.

### C1 — Booking Request
- **User Story**: As an Operator, I can request a booking with dates and terms; Owners can accept/modify/decline.
- **Design Spec**: Modal flow; negotiation thread; status timeline.
- **Technical Spec**: `Bookings` table; `Request`, `Counter`, `Accepted` states; server actions; notifications via email.
- **Acceptance Criteria**: Owner receives request; updates status; both parties see synchronized timeline.

### C2 — Contract Generation & E‑Signature
- **User Story**: As parties, we can review a templated contract, add clauses, sign electronically.
- **Design Spec**: Contract preview with diff highlights; e‑signature pad or external provider webhook.
- **Technical Spec**: Generate PDF via server action (PDFKit/puppeteer); store signed versions; integrate with e‑signature provider (DocuSign/HelloSign) or in‑app signature with audit hash.
- **Acceptance Criteria**: Signed contract stored immutable; version history preserved; downloadable.

### C3 — Escrow Payments
- **User Story**: As an Operator, I can pay into escrow; as an Owner, I get payout after completion.
- **Design Spec**: Minimal pay sheet; status pill (Funded / In Dispute / Released).
- **Technical Spec**: Paystack SDK primary, Flutterwave failover; webhooks for status; `EscrowTransaction` model; currency NGN/USD; fees audit.
- **Acceptance Criteria**: Test transaction success; webhook updates DB; release button gated by completion status.

### D1 — AIS Tracking
- **User Story**: As an Operator, I can monitor vessel position updates and route history.
- **Design Spec**: Map with 15‑min updates; markers; tab for history.
- **Technical Spec**: Map library (Mapbox/Leaflet); server cron to poll MarineTraffic; cache last positions; failover provider; `TrackingEvent` model.
- **Acceptance Criteria**: New positions appear ≤ 15 min; history viewable; offline cached last known location.

### E1 — Compliance Engine
- **User Story**: As an Admin/Regulator, I can see verified compliance statuses and expiry alerts.
- **Design Spec**: Compliance dashboard with filters; expiry list; detail panel showing docs and verification log.
- **Technical Spec**: `ComplianceRecord`, `VerificationLog`; hash docs (SHA‑256) and store hash on-chain later; alert cron (30‑day pre‑expiry emails).
- **Acceptance Criteria**: Statuses visible; alerts sent; immutable hash logged on upload.

### F1 — Pricing Dashboard (MVP‑Lite)
- **User Story**: As an Owner, I can view utilization and suggested price ranges.
- **Design Spec**: KPI cards, charts; suggestion callouts with rationale.
- **Technical Spec**: Aggregations over bookings; rules (e.g., demand seasonality, vessel type, fuel); store suggestions with provenance.
- **Acceptance Criteria**: Suggestions render; owners can accept/dismiss; event logged.

---

## 7) Risks & Assumptions
- **Third‑party risk** (payments, AIS): add failovers and idempotent webhooks.  
- **Regulatory approvals** may lag: provide read‑only regulator access and audit logs from day 1.  
- **Connectivity constraints**: PWA, offline caches for last known data and drafts.  

---

## 8) Release Plan (Phases)
- **Phase 1 (Weeks 1‑4)**: Auth+KYC, Vessel CRUD.  
- **Phase 2 (Weeks 5‑8)**: Search, Listing details, Booking request.  
- **Phase 3 (Weeks 9‑12)**: Contract + Escrow.  
- **Phase 4 (Weeks 13‑16)**: AIS + Compliance.  
- **Phase 5 (Weeks 17‑20)**: Analytics/Pricing Lite + Admin/Regulator consoles.

---

## 9) Acceptance & Go/No‑Go Criteria
- All MVP epics at shippable quality; performance and accessibility targets met; security review clean; smoke tests pass; demo with 5 pilot users without critical issues.

