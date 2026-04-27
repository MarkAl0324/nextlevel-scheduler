import { PrismaClient, Weekday } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: DATABASE_URL,
  }),
});

function isoToDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

async function main() {
  // Clear in dependency-safe order
  await prisma.swapProposal.deleteMany();
  await prisma.swapPost.deleteMany();
  await prisma.providerMaRule.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.providerSchedule.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();

  // Employees (create users + profiles)
  const employees = getDemoEmployees();
  const employeeProfiles = new Map<string, { id: string; name: string }>();
  for (const e of employees) {
    const user = await prisma.user.create({
      data: {
        email: `${e.id}@demo.local`,
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

  // Provider schedules: any provider referenced by an assignment is considered scheduled that day (demo parity).
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
  const assignmentIds = new Map<string, string>(); // `${employeeDemoId}:${iso}` -> assignmentId
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

  // Swap posts: connect to target assignment
  const swapPosts = getDemoSwapPosts(seedDate);
  const postIdMap = new Map<string, string>(); // demoId -> dbId
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

  // Swap proposals: connect to offered assignment
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

  // Print a helpful hint for the week start used
  const weekStart = startOfWeekMonday(seedDate);
  console.log(`Seeded demo week starting ${toIsoDate(weekStart)}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

