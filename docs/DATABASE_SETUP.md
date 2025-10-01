# Database Setup Guide for BlueFleet

## Recommended: Neon (Free Cloud PostgreSQL)

**Why Neon?**
- ✅ Free tier with 0.5 GB storage (plenty for development)
- ✅ No Docker or local installation needed
- ✅ Auto-scaling and serverless
- ✅ Setup takes 2 minutes

### Step-by-Step Neon Setup:

1. **Go to Neon**: https://neon.tech

2. **Sign up** (free, no credit card required)
   - Use GitHub, Google, or email

3. **Create a new project**
   - Click "Create Project"
   - Name: `bluefleet-dev`
   - Region: Choose closest to you
   - PostgreSQL version: 15 or 16

4. **Copy the connection string**
   - After project creation, you'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

5. **Update your `.env` file**
   - Open `.env` in the project root
   - Replace the `DATABASE_URL` line with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

6. **Push the schema**
   ```bash
   pnpm db:push
   ```

7. **Done!** Your database is ready.

---

## Alternative: Docker PostgreSQL (Local)

**Prerequisites**: Docker Desktop must be running

### Quick Setup:

```bash
# Start PostgreSQL container
docker run --name bluefleet-db \
  -e POSTGRES_PASSWORD=bluefleet \
  -e POSTGRES_DB=bluefleet \
  -e POSTGRES_USER=bluefleet \
  -p 5432:5432 \
  -d postgres:15-alpine

# Wait a few seconds for PostgreSQL to start
sleep 5

# Verify it's running
docker ps | grep bluefleet-db
```

### Update `.env`:

```env
DATABASE_URL="postgresql://bluefleet:bluefleet@localhost:5432/bluefleet"
```

### Useful Docker Commands:

```bash
# Stop the database
docker stop bluefleet-db

# Start the database (after stopping)
docker start bluefleet-db

# View logs
docker logs bluefleet-db

# Remove the container (if you want to start fresh)
docker rm -f bluefleet-db

# Connect to PostgreSQL CLI
docker exec -it bluefleet-db psql -U bluefleet -d bluefleet
```

---

## Alternative: Supabase (Free Cloud PostgreSQL)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Update `.env` with the connection string

---

## Alternative: Railway (Free Cloud PostgreSQL)

1. Go to https://railway.app
2. Create a free account
3. Create a new project → Add PostgreSQL
4. Copy the connection string from the "Connect" tab
5. Update `.env` with the connection string

---

## Verify Database Connection

After setting up your database, verify the connection:

```bash
# Push schema to database
pnpm db:push

# You should see:
# ✔ Database synchronized with Prisma schema
```

If successful, you'll see output like:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "bluefleet"

🚀  Your database is now in sync with your Prisma schema.
```

---

## Troubleshooting

### "Can't reach database server"

**For Neon/Cloud databases:**
- Check your internet connection
- Verify the connection string is correct
- Ensure `?sslmode=require` is at the end of the URL

**For Docker:**
- Ensure Docker Desktop is running
- Check if container is running: `docker ps`
- Check container logs: `docker logs bluefleet-db`

### "Connection refused" (Docker)

```bash
# Restart the container
docker restart bluefleet-db

# Or remove and recreate
docker rm -f bluefleet-db
docker run --name bluefleet-db \
  -e POSTGRES_PASSWORD=bluefleet \
  -e POSTGRES_DB=bluefleet \
  -e POSTGRES_USER=bluefleet \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Port 5432 already in use

```bash
# Check what's using port 5432
lsof -i :5432

# Either stop the other PostgreSQL instance, or use a different port:
docker run --name bluefleet-db \
  -e POSTGRES_PASSWORD=bluefleet \
  -e POSTGRES_DB=bluefleet \
  -e POSTGRES_USER=bluefleet \
  -p 5433:5432 \
  -d postgres:15-alpine

# Then update .env:
DATABASE_URL="postgresql://bluefleet:bluefleet@localhost:5433/bluefleet"
```

---

## Next Steps

Once your database is set up and `pnpm db:push` succeeds:

1. Seed demo data: `pnpm seed`
2. Start dev server: `pnpm dev`
3. Verify health check: http://localhost:3000/api/health

---

## My Recommendation

**Use Neon** for the easiest setup:
- No local installation
- No Docker needed
- Free tier is generous
- Works from anywhere
- Automatic backups

Just go to https://neon.tech, create a project, copy the connection string, and you're done!

