import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL ?? "postgresql://nls_app.pcagigygiwlorhivmsya:NLSched2026!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    console.log("Testing findUnique with email...");
    const user = await prisma.user.findUnique({
      where: { email: "manager@demo.local" },
      include: { employeeProfile: true },
    });
    console.log("Result:", JSON.stringify(user, null, 2));
  } catch (err) {
    console.error("ERROR class:", (err as Error).constructor.name);
    console.error("ERROR message:", (err as Error).message);
    if ((err as any).code) console.error("ERROR code:", (err as any).code);
    if ((err as any).meta) console.error("ERROR meta:", (err as any).meta);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
