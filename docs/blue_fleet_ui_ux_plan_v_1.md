# BlueFleet — UI/UX Plan (MVP)

**Design Owner**: UX Lead  
**Principles**: Mobile‑first, low‑latency, offline‑aware, accessible (WCAG 2.1 AA), transparent and trustworthy.

---

## 1) Information Architecture

### App Sections (Primary Nav)
1. **Discover** (Search)  
2. **My Vessels** (Owner) / **Requests** (Operator)  
3. **Trips** (Tracking)  
4. **Compliance**  
5. **Account** (Profile/KYC)

**Admin**: Moderation, Users, Compliance, Transactions, Settings.  
**Regulator**: Compliance dashboard (read‑only), Audit logs.

---

## 2) Key Screens & Components

### 2.1 Auth & Onboarding
- **Screens**: Welcome, Signup, Login, Role selection, KYC Stepper, Success state.
- **Components**: Form fields (shadcn `Input`, `Textarea`), `FileUploader`, `Stepper`, `Badge` (status), `Alert` (errors), `Button`.
- **Behavior**: Inline validation, persistent drafts, upload progress, accessible labels and hints.

### 2.2 Vessel CRUD
- **Screens**: Vessels list (Owner), New/Edit Vessel, Media Manager, Availability Calendar, Pricing.
- **Components**: `Tabs` (Specs, Media, Compliance, Pricing, Availability), `Calendar` (range picker), `Gallery`, `Tag` chips, `DataTable`.
- **Behavior**: Autosave on step change, image optimization, drag‑drop sort, required-field gating before Publish.

### 2.3 Search & Results
- **Screens**: Discover (search bar + filters), Result cards grid, Vessel detail.
- **Components**: `Command` for quick search, `Sheet`/`Drawer` filters on mobile, `Select`, `Slider` (price), `Badge` (compliance).
- **Behavior**: URL‑synced filters; skeleton loaders; empty state with helpful suggestions; <1s perceived latency.

### 2.4 Booking & Contracting
- **Screens**: Request Booking modal, Negotiation thread, Contract preview & e‑signature, Payment sheet.
- **Components**: `Dialog`, `Textarea` (terms), `Timeline`, `SignaturePad` (if in‑app), `PDFViewer`.
- **Behavior**: 3‑click booking from details; negotiation history preserved; must confirm terms before pay.

### 2.5 Tracking & Trips
- **Screens**: Trips list, Trip detail (map + events), History tab.
- **Components**: `Map` canvas, `Marker`, `Badge` (status), `Accordion` (events), `Card` KPIs.
- **Behavior**: Auto‑refresh 15 min; offline last‑known cache; failure banners on API errors with retry.

### 2.6 Compliance & Audit
- **Screens**: Compliance dashboard, Expiry alerts, Document viewer.
- **Components**: `DataTable` with filters, `Badge` states, `Toast` alerts, `DiffViewer` for doc versions.
- **Behavior**: Immutable hash displayed; export CSV/PDF; regulator read‑only guard.

---

## 3) User Flows (Happy Path + Edges)

### 3.1 Owner: List a Vessel
1) Sign up → 2) Choose Owner → 3) Complete KYB → 4) New Vessel (Specs → Media → Compliance → Pricing → Availability) → 5) Publish → 6) Await requests.
**Edges**: Missing required docs; image upload failure; pricing below floor warning.

### 3.2 Operator: Find & Book
1) Discover → 2) Filters (type, location, compliance, availability) → 3) View details → 4) Request booking → 5) Sign contract → 6) Pay escrow.
**Edges**: Date clash; contract redlines; payment 3‑DS challenge; currency mismatch.

### 3.3 Ops: Track a Trip
1) Trips → 2) Select active trip → 3) View map (auto refresh) → 4) Review events → 5) Complete & release escrow.
**Edges**: AIS outage; fallback provider; manual status note.

---

## 4) Content & Microcopy
- Trust-forward language ("Verified by NIMASA", "Immutable record created").
- Empty states teach next steps; errors actionable and friendly.
- Currency/units localized; dates in ISO with locale formatting.

---

## 5) Accessibility & Internationalization
- Semantic HTML; focus states visible; ARIA for dynamic regions (maps, dialogs); keyboard shortcuts for power users.
- i18n framework ready (EN launch; Yoruba/FR/PT post‑MVP). RTL not required yet.

---

## 6) Design System (Tailwind + shadcn/ui)
- **Typography**: System UI; scalable sizes; high contrast.  
- **Color**: Neutral base; blue accents for trust; error/warn/success tokens.  
- **Components**: Use shadcn primitives; extend for `Stepper`, `SignaturePad`, `Map` wrapper.  
- **Tokens**: Spacing scale 4/8; radius md/lg; elevation ramp for modals/sheets.

---

## 7) Screen‑level Scopes (each with 4 items)

### S1 — Signup / Login / Role
- **User Story**: As a new user, I can sign up and select my role to personalize my workspace.
- **Design Spec**: 3 screens; prominent CTA; passwordless optional; errors inline.
- **Technical Spec**: `app/(auth)/*` routes; shadcn `Card`, `Form`; NextAuth credentials; Postgres.
- **Acceptance Criteria**: Role remembered; redirects correct; a11y checks pass.

### S2 — KYC Stepper
- **User Story**: As an Owner/Operator, I can submit identity/company details and docs.
- **Design Spec**: 5‑step wizard; progress; doc preview; status chips.
- **Technical Spec**: `app/(dashboard)/kyc`; `FileUploader`; blob storage; server actions.
- **Acceptance Criteria**: Draft/save/submit; admin review flag appears.

### S3 — Vessel Form
- **User Story**: As an Owner, I can create a complete vessel listing.
- **Design Spec**: Tabs; validation badges; image gallery with reorder; calendar.
- **Technical Spec**: `app/owner/vessels/*`; Prisma models; zod validation; image optimizer.
- **Acceptance Criteria**: Publish gated until required sections complete.

### S4 — Search & Results
- **User Story**: As an Operator, I can filter and find vessels quickly.
- **Design Spec**: Filter drawer on mobile; chips show active filters; 0‑state suggestions.
- **Technical Spec**: Edge runtime; server components; indexed search; URL params.
- **Acceptance Criteria**: p95 < 1s; shareable result URL; keyboard accessible.

### S5 — Vessel Details
- **User Story**: As an Operator, I can evaluate a vessel and start booking.
- **Design Spec**: Media hero; spec grid; compliance badges; sticky CTA.
- **Technical Spec**: `app/vessel/[slug]`; SSR; map mini‑widget for home port.
- **Acceptance Criteria**: All key data displayed; CTA opens Request modal.

### S6 — Booking + Negotiation
- **User Story**: As parties, we can agree terms before signing.
- **Design Spec**: Modal thread with timeline and counters; attach clauses.
- **Technical Spec**: `BookingRequest` model; server actions; email events.
- **Acceptance Criteria**: Status transitions visible; audit trail intact.

### S7 — Contract & E‑Sign
- **User Story**: As parties, we can sign a generated contract with a clear diff view for edits.
- **Design Spec**: PDF preview; signature pad; confirm dialogs.
- **Technical Spec**: PDF generation; e‑signature provider or in‑app pad; immutable hash.
- **Acceptance Criteria**: Signed PDF stored; versioning; download works.

### S8 — Payment (Escrow)
- **User Story**: As an Operator, I can fund escrow securely; owner sees payout status.
- **Design Spec**: Minimalist pay sheet; fee transparency; status pill.
- **Technical Spec**: Paystack SDK; Flutterwave fallback; webhooks; idempotency.
- **Acceptance Criteria**: Happy‑path test txn; webhook updates; failure message with retry.

### S9 — Trips & Tracking
- **User Story**: As an Operator, I can follow active trips and review history.
- **Design Spec**: Map with auto‑refresh; events list; completion CTA.
- **Technical Spec**: Polling cron; cache; map component; fallback provider.
- **Acceptance Criteria**: Updates within 15 min; last‑known cached offline.

### S10 — Compliance Dashboard
- **User Story**: As Admin/Regulator, I can verify compliance posture and expiries.
- **Design Spec**: Data table; filters; detail drawer; export.
- **Technical Spec**: Immutable doc hashes; alert cron; role guards.
- **Acceptance Criteria**: 30‑day alerts; exportable; read‑only for regulator.

---

## 8) Prototypes & Handoff
- Low‑fi wireframes (all screens), hi‑fi for S1–S6 priority.  
- Component inventory in Figma matching shadcn tokens.  
- Redlines and interaction notes per screen.  
- Asset kit: icons, badges, map markers, compliance seals.

