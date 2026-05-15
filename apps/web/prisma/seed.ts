import { PrismaClient, Weekday } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  getDemoAssignmentsForWeek,
  getDemoEmployees,
  getDemoProviders,
  getDemoProviderMaRules,
  getDemoSwapPosts,
  getDemoSwapProposals,
  startOfWeekMonday,
  toIsoDate,
} from "../src/lib/demoData";

// Seed uses the direct postgres URL to avoid Prisma Postgres proxy connection issues during bulk ops.
const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required to run the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function isoToDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function main() {
  const EMPLOYEE_PASSWORD = await bcrypt.hash("demo123", 10);
  const MANAGER_PASSWORD = await bcrypt.hash("demo123", 10);
  const DEVELOPER_PASSWORD = await bcrypt.hash("demo123", 10);

  // Clear in dependency-safe order
  await prisma.swapProposal.deleteMany();
  await prisma.swapPost.deleteMany();
  await prisma.providerMaRule.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.providerSchedule.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();

  // Developer account
  await prisma.user.create({
    data: {
      email: "dev@demo.local",
      password: DEVELOPER_PASSWORD,
      role: "developer",
    },
  });

  // Manager account
  await prisma.user.create({
    data: {
      email: "manager@demo.local",
      password: MANAGER_PASSWORD,
      role: "manager",
    },
  });

  // Employees (create users + profiles)
  const employees = getDemoEmployees();
  const employeeProfiles = new Map<string, { id: string; name: string }>();
  for (const e of employees) {
    const user = await prisma.user.create({
      data: {
        email: `${e.id}@demo.local`,
        password: EMPLOYEE_PASSWORD,
        role: "employee",
        employeeProfile: { create: { name: e.name } },
      },
      include: { employeeProfile: true },
    });
    employeeProfiles.set(e.id, { id: user.employeeProfile!.id, name: e.name });
  }

  // Providers
  const providers = getDemoProviders();
  const providerIds = new Map<string, string>();
  for (const p of providers) {
    const created = await prisma.provider.create({ data: { name: p.name } });
    providerIds.set(p.id, created.id);
  }

  // Provider schedules: any provider referenced by an assignment is considered scheduled that day.
  const seedDate = new Date();
  const assignments = getDemoAssignmentsForWeek(seedDate);
  const providerScheduleSet = new Set<string>();
  for (const a of assignments) {
    if (!a.providerId) continue;
    const providerId = providerIds.get(a.providerId)!;
    const key = `${a.date}:${providerId}`;
    providerScheduleSet.add(key);
  }
  for (const key of providerScheduleSet) {
    const [iso, providerId] = key.split(":");
    await prisma.providerSchedule.create({
      data: { date: isoToDate(iso!), providerId: providerId! },
    });
  }

  // Assignments
  const assignmentIds = new Map<string, string>();
  for (const a of assignments) {
    const employee = employeeProfiles.get(a.employeeId)!;
    const providerId = a.providerId ? providerIds.get(a.providerId) : undefined;
    const created = await prisma.assignment.create({
      data: {
        date: isoToDate(a.date),
        employeeId: employee.id,
        providerId,
      },
    });
    assignmentIds.set(`${a.employeeId}:${a.date}`, created.id);
  }

  // Provider↔MA rules (weekday-based)
  const { rules } = getDemoProviderMaRules();
  for (const r of rules) {
    await prisma.providerMaRule.create({
      data: {
        providerId: providerIds.get(r.providerId)!,
        weekday: r.weekday as Weekday,
        requiredEmployeeId: employeeProfiles.get(r.requiredEmployeeId)!.id,
      },
    });
  }

  // Swap posts
  const swapPosts = getDemoSwapPosts(seedDate);
  const postIdMap = new Map<string, string>();
  for (const p of swapPosts) {
    const ownerProfileId = employeeProfiles.get(p.ownerEmployeeId)!.id;
    const targetAssignmentId = assignmentIds.get(`${p.ownerEmployeeId}:${p.targetDate}`);
    if (!targetAssignmentId) continue;
    const created = await prisma.swapPost.create({
      data: {
        status: p.status,
        note: p.note,
        ownerEmployeeId: ownerProfileId,
        targetAssignmentId,
        createdAt: new Date(p.createdAtIso),
      },
    });
    postIdMap.set(p.id, created.id);
  }

  // Swap proposals
  const proposals = getDemoSwapProposals(seedDate);
  for (const pr of proposals) {
    const dbPostId = postIdMap.get(pr.postId);
    if (!dbPostId) continue;
    const proposerProfileId = employeeProfiles.get(pr.proposerEmployeeId)!.id;
    const offeredAssignmentId = assignmentIds.get(`${pr.proposerEmployeeId}:${pr.offeredDate}`);
    if (!offeredAssignmentId) continue;
    await prisma.swapProposal.create({
      data: {
        status: pr.status,
        postId: dbPostId,
        proposerEmployeeId: proposerProfileId,
        offeredAssignmentId,
        createdAt: new Date(pr.createdAtIso),
      },
    });
  }

  const weekStart = startOfWeekMonday(seedDate);
  console.log(`Seeded week starting ${toIsoDate(weekStart)}`);
  console.log(`\nTest accounts (password: demo123):`);
  console.log(`  Developer: dev@demo.local`);
  console.log(`  Manager:   manager@demo.local`);
  for (const e of employees) {
    console.log(`  Employee:  ${e.id}@demo.local  (${e.name})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
