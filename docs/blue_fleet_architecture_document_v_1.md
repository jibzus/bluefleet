# BlueFleet — Architecture Document (MVP)

**Tech Lead**: Engineering  
**Target Platform**: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; Postgres (Neon/PlanetScale‑PG); Vercel deploy.  
**Key Integrations**: Paystack (escrow primary), Flutterwave (fallback), MarineTraffic (AIS), exactEarth (fallback), E‑signature (HelloSign/DocuSign or in‑app), Map (Mapbox/Leaflet).

---

## 1) High‑Level Architecture

```
[Client (PWA)]  —SSR/ISR→  [Next.js Web (Vercel)]  —>  [DB: Postgres (Neon)]
      |                         |    \--webhooks--> [Payments]
      |                         |    \--cron/poll-> [AIS Providers]
      |                         |    \---> [Blob/S3: media & docs]
      |                         \---> [Signature Provider]
      \-- Service Workers (offline cache, assets, last-known tracking)
```

- **Runtime**: Next.js server components + edge where suitable (search).  
- **State**: Server Actions + React Query for client hydration where needed.  
- **Storage**: Postgres (primary data), Vercel Blob/S3 (media/docs), Redis (optional caching), append‑only table for immutability; future on‑chain hash anchor.
- **Observability**: Vercel Analytics, OpenTelemetry traces, Sentry (errors), p95 latency dashboards.

---

## 2) Data Model (MVP Core)

**User(id, role[owner|operator|admin|regulator], email, phone, name, orgId, 2fa, createdAt)**  
**KycRecord(id, userId, type, status, fields JSONB, reviewerId, timestamps)**  
**Vessel(id, ownerId, slug, type, specs JSONB, homePort, emissions JSONB, status, createdAt)**  
**VesselMedia(id, vesselId, url, sort, alt)**  
**Certification(id, vesselId, kind, issuer, number, issuedAt, expiresAt, docUrl, hash, status)**  
**AvailabilitySlot(id, vesselId, start, end)**  
**SearchIndex(materialized view over vessel fields for trigram/FTS)**  
**Booking(id, vesselId, operatorId, start, end, terms JSONB, status[requested|countered|accepted|cancelled])**  
**Contract(id, bookingId, version, pdfUrl, hash, signedAt, signerIds[])**  
**EscrowTransaction(id, bookingId, provider, currency, amount, fee, status, logs JSONB)**  
**TrackingEvent(id, vesselId, bookingId?, lat, lng, ts, provider, meta JSONB)**  
**ComplianceRecord(id, subjectId, subjectType, status, notes, createdAt)**  
**VerificationLog(id, recordId, actorId, action, ts, hash)**  
**AuditLog(id, actorId, action, subject, ts, ip)**

---

## 3) Services & Integrations

### 3.1 Payments (Escrow)
- **Primary**: Paystack. **Failover**: Flutterwave.  
- **Flow**: Client → initiate intent → server creates transaction → redirect/inline → webhook updates → idempotent handler writes `EscrowTransaction` → release upon completion gate.

### 3.2 AIS Tracking
- **Primary**: MarineTraffic polling cron (15 min). **Failover**: exactEarth if outage.  
- Store last known position per vessel; write `TrackingEvent` rows and aggregate routes.

### 3.3 E‑Signature
- Prefer provider (HelloSign/DocuSign) with webhook; in‑app fallback using signature pad image + signer metadata + hashed PDF for integrity.

### 3.4 Immutable Docs
- Append‑only table of document versions; compute SHA‑256 per upload; store in `Certification.hash`. Future: anchor hash to public chain (daily roll‑up) via simple L2.

---

## 4) Security & Compliance
- RBAC middleware; route protection; server actions guarded; input validation via zod; CSRF on webhook endpoints.  
- Secrets in Vercel env vars; rotated regularly.  
- PII encryption at rest; TLS in transit.  
- Audit logs for sensitive ops; IP + UA capture for signatures.  
- NDPR/GDPR features: data export, right to erasure (where lawful), retention policies (5 years for compliance data).

---

## 5) Performance & Resilience
- Search on Edge Functions with precomputed materialized views; Redis cache for hot filters.  
- ISR/SSR mix: Details SSR; lists ISR with short revalidate.  
- Idempotent webhooks; retries with backoff; circuit breaker around AIS/Payment providers.  
- Background jobs via Vercel Cron for polling AIS and sending expiry alerts.

---

## 6) Directory Structure (Next.js App Router)
```
app/
  (auth)/signin/page.tsx
  (auth)/signup/page.tsx
  dashboard/page.tsx
  owner/vessels/[[...slug]]/page.tsx
  search/page.tsx
  vessel/[slug]/page.tsx
  bookings/[id]/page.tsx
  trips/[id]/page.tsx
  compliance/page.tsx
  admin/*
components/
  ui/* (shadcn wrappers)
  forms/*
  map/*
lib/
  db.ts (Prisma)
  payments/*
  ais/*
  pdf/*
  auth.ts
  rbac.ts
  validators/*
cron/
  ais-poll.ts
  expiry-alerts.ts
prisma/
  schema.prisma
public/
  icons, images
```

---

## 7) API Surface (Route Handlers)
- `app/api/kyc/*` (POST/GET)  
- `app/api/vessels/*`  
- `app/api/search` (edge)  
- `app/api/bookings/*`  
- `app/api/contracts/*`  
- `app/api/payments/webhook`  
- `app/api/tracking/*`  
- `app/api/compliance/*`

---

## 8) Threat Model (MVP)
- **Payment fraud**: enforce provider webhooks + idempotent checks; escrow release gated by contract status and completion confirmation.  
- **Document tampering**: store hashes; keep append‑only history.  
- **Account takeover**: email verification; optional 2FA; login rate‑limit.  
- **Data exfiltration**: strict RBAC; row‑level checks on owner resources.

---

## 9) Migration & Scale Plan
- Start with Postgres (Neon). Future: Read replicas, background queue (Upstash Redis + durable job), search index (pgvector or external).  
- Gradual add of i18n and multi‑tenant orgs; extract services as needed.

