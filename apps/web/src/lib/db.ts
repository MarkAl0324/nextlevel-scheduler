import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const rawUrl =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/next_level_scheduler";

const isLocalhost = /localhost|127\.0\.0\.1/.test(rawUrl);

// pg v8 lets sslmode=require/verify-full in the URL override ssl.rejectUnauthorized — strip it
const connectionString = rawUrl
  .replace(/\?sslmode=[^&]*(&|$)/, (_, trail) => (trail ? "?" : ""))
  .replace(/&sslmode=[^&]*/g, "");

const pool = new Pool({
  connectionString,
  ...(isLocalhost ? {} : { ssl: { rejectUnauthorized: false } }),
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

