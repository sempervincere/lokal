import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // SUPABASE_SESSION_URL  → session pooler (port 5432, IPv4, session-mode)
    //   ✅ supports pg_class introspection → Prisma Studio works
    //   ✅ supports DDL → prisma migrate works
    // DATABASE_URL          → transaction pooler (port 6543)
    //   ✅ best for serverless/edge at runtime
    //   ❌ breaks Prisma Studio (PgBouncer transaction-mode multiplexes mid-query)
    // DIRECT_URL            → direct Postgres (port 5432, but IPv6 on Supabase free-tier)
    //   ❌ unreachable from WSL2
    url: process.env.SUPABASE_SESSION_URL ?? process.env.DATABASE_URL ?? process.env.DIRECT_URL,
  },
});
