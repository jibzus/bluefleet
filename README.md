# BlueFleet — MVP Scaffold (Next.js + TypeScript + Tailwind + shadcn/ui-ready)

This repository is scaffolded to match the PRD/Architecture documents. It includes:
- Next.js App Router + TypeScript
- Tailwind CSS (shadcn/ui-ready primitives)
- Prisma/Postgres schema aligned with MVP models
- API route stubs for health, search, KYC, payments webhook
- Minimal pages: Home, Auth (signin/signup), Search, Vessel Detail, Dashboard

## Quick Start

```bash
pnpm i
cp .env.example .env
# Edit DATABASE_URL and NEXTAUTH_SECRET
pnpm db:push
pnpm dev
```

Open http://localhost:3000

## Notes

- **E-signature**: In-app MVP (contract hash stored with SHA-256).
- **Escrow**: Operator confirm for release; webhook route is stubbed for provider integration.
- **Immutable docs**: SHA-256 on upload recorded in `Certification.hash` (anchoring to chain later).

## Scripts

- `pnpm db:push` — create/update DB schema
- `pnpm dev` — start dev server
- `pnpm build` / `pnpm start` — production build

## Structure

```
app/            # routes (App Router)
components/     # UI primitives
lib/            # db, rbac, utils
prisma/         # Prisma schema
```

Extend with shadcn/ui via CLI as needed.
