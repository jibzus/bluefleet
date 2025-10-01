# BlueFleet Setup Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database (local or cloud - Neon/Supabase recommended for development)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Database - Get a free PostgreSQL database from:
# - Neon: https://neon.tech (recommended)
# - Supabase: https://supabase.com
# - Railway: https://railway.app
DATABASE_URL="postgresql://user:password@host:5432/bluefleet"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Payments (use test keys for development)
PAYSTACK_SECRET_KEY="pk_test_xxx"
FLW_SECRET_KEY="flw_test_xxx"
WEBHOOK_SECRET="webhook-secret-change-in-production"
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Initialize Database

Push the Prisma schema to your database:

```bash
pnpm db:push
```

### 4. Seed Initial Data (Optional)

```bash
pnpm seed
```

This creates a demo operator account: `operator@example.com`

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification Checklist

After setup, verify:

- [ ] Home page loads at http://localhost:3000
- [ ] Sign in page loads at http://localhost:3000/(auth)/signin
- [ ] Sign up page loads at http://localhost:3000/(auth)/signup
- [ ] Health check returns OK at http://localhost:3000/api/health
- [ ] Search page loads at http://localhost:3000/search
- [ ] Dashboard page loads at http://localhost:3000/dashboard

## Database Setup Options

### Option 1: Neon (Recommended for Development)

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Paste it as `DATABASE_URL` in `.env`

### Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
createdb bluefleet

# Update .env
DATABASE_URL="postgresql://localhost:5432/bluefleet"
```

### Option 3: Docker PostgreSQL

```bash
docker run --name bluefleet-db \
  -e POSTGRES_PASSWORD=bluefleet \
  -e POSTGRES_DB=bluefleet \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL="postgresql://postgres:bluefleet@localhost:5432/bluefleet"
```

## Scripts Reference

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:push` - Push schema changes to database
- `pnpm seed` - Seed database with demo data

## Troubleshooting

### "Command not found: pnpm"

Install pnpm globally:
```bash
npm install -g pnpm
```

### Database Connection Errors

- Verify your `DATABASE_URL` is correct
- Check that your database is running
- Ensure firewall allows connections
- For cloud databases, check IP whitelist settings

### Prisma Client Errors

Regenerate the Prisma client:
```bash
pnpm prisma generate
```

## Next Steps

After successful setup:

1. Review the [Architecture Document](./blue_fleet_architecture_document_v_1.md)
2. Check the [Development Plan](./blue_fleet_development_plan_v_1.md)
3. Start with WP-1: Authentication implementation
4. Follow the work packages in order

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review the PRD and Architecture documents
- Consult the Test Plan for acceptance criteria

