import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const rawUrl =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/next_level_scheduler";

const isLocalhost = /localhost|127\.0\.0\.1/.test(rawUrl);

// For remote connections, parse the URL manually and pass discrete options to pg.Pool.
// Passing a connectionString lets pg-connection-string override ssl settings from the URL
// (sslmode=require becomes verify-full in pg v8), breaking rejectUnauthorized: false.
let pool: Pool;
if (isLocalhost) {
  pool = new Pool({ connectionString: rawUrl });
} else {
  const u = new URL(rawUrl);
  pool = new Pool({
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database: u.pathname.replace(/^\//, ""),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: { rejectUnauthorized: false },
  });
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

