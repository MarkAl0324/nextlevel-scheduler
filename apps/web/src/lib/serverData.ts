import { prisma } from "@/lib/db";
import type { IsoDate } from "@/lib/demoData";

type CoverageStatus = "no-staffing" | "balanced" | "understaffed" | "overstaffed";
type CellStatus = "assigned" | "unassigned" | "off" | "pairing-conflict";

export type WeekOperationsDay = {
  date: IsoDate;
  providersScheduled: number;
  workersScheduled: number;
  delta: number;
  status: CoverageStatus;
  exceptionCount: number;
};

export type WeekOperationsWorker = {
  id: string;
  name: string;
  cells: Array<{
    date: IsoDate;
    providerName?: string;
    status: CellStatus;
    label: string;
    detail?: string;
  }>;
};

export type WeekOperationsActionItem = {
  id: string;
  type: "coverage-gap" | "pending-request" | "blocked";
  label: "Needs coverage" | "Pending approval" | "Blocked" | "Pairing conflict";
  title: string;
  detail: string;
  href?: string;
};

export type WeekOperationsBoardData = {
  weekStartIso: IsoDate;
  weekEndIso: IsoDate;
  days: WeekOperationsDay[];
  workers: WeekOperationsWorker[];
  actionItems: WeekOperationsActionItem[];
  summary: {
    understaffedDays: number;
    overstaffedDays: number;
    pendingRequests: number;
    blockedItems: number;
  };
};

function toIsoDateUTC(d: Date): IsoDate {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` as IsoDate;
}

function getCurrentWeekRangeUTC() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

function weekdayFromIsoDate(isoDate: IsoDate) {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()] as
    | "Sun"
    | "Mon"
    | "Tue"
    | "Wed"
    | "Thu"
    | "Fri"
    | "Sat";
}

function coverageStatus(providers: number, workers: number): CoverageStatus {
  if (providers === 0 && workers === 0) return "no-staffing";
  const delta = workers - providers;
  if (delta === 0) return "balanced";
  return delta < 0 ? "understaffed" : "overstaffed";
}

export async function getWeekBalanceData() {
  try {
    // Week start: Monday of current week (UTC-ish for demo simplicity)
    const { start, end } = getCurrentWeekRangeUTC();

    const providerSchedules = await prisma.providerSchedule.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true },
    });
    const assignments = await prisma.assignment.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true },
    });

    const providersByDate = new Map<string, number>();
    for (const p of providerSchedules) {
      const iso = toIsoDateUTC(p.date);
      providersByDate.set(iso, (providersByDate.get(iso) ?? 0) + 1);
    }
    const masByDate = new Map<string, number>();
    for (const a of assignments) {
      const iso = toIsoDateUTC(a.date);
      masByDate.set(iso, (masByDate.get(iso) ?? 0) + 1);
    }

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const iso = toIsoDateUTC(d);
      return {
        date: iso,
        providersScheduled: providersByDate.get(iso) ?? 0,
        medicalAssistantsScheduled: masByDate.get(iso) ?? 0,
      };
    });
  } catch (e) {
    throw e;
  }
}

export async function getWeekOperationsBoardData(): Promise<WeekOperationsBoardData> {
  const { start, end } = getCurrentWeekRangeUTC();
  const weekStartIso = toIsoDateUTC(start);
  const weekEnd = new Date(end);
  weekEnd.setUTCDate(weekEnd.getUTCDate() - 1);
  const weekEndIso = toIsoDateUTC(weekEnd);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return toIsoDateUTC(d);
  });

  try {
    const [employees, assignments, providerSchedules, rules, swapPosts] = await Promise.all([
      prisma.employeeProfile.findMany({ orderBy: { name: "asc" } }),
      prisma.assignment.findMany({
        where: { date: { gte: start, lt: end } },
        include: { employee: true, provider: true },
      }),
      prisma.providerSchedule.findMany({
        where: { date: { gte: start, lt: end } },
        include: { provider: true },
      }),
      prisma.providerMaRule.findMany({ include: { provider: true, requiredEmployee: true } }),
      prisma.swapPost.findMany({
        where: { status: "posted" },
        include: { ownerEmployee: true, targetAssignment: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const providersByDate = new Map<IsoDate, number>();
    for (const p of providerSchedules) {
      const iso = toIsoDateUTC(p.date);
      providersByDate.set(iso, (providersByDate.get(iso) ?? 0) + 1);
    }

    const assignmentsByDate = new Map<IsoDate, number>();
    const assignmentByWorkerDate = new Map<string, (typeof assignments)[number]>();
    for (const assignment of assignments) {
      const iso = toIsoDateUTC(assignment.date);
      assignmentsByDate.set(iso, (assignmentsByDate.get(iso) ?? 0) + 1);
      assignmentByWorkerDate.set(`${assignment.employeeId}:${iso}`, assignment);
    }

    const ruleByProviderWeekday = new Map<string, (typeof rules)[number]>();
    for (const rule of rules) {
      ruleByProviderWeekday.set(`${rule.providerId}:${rule.weekday}`, rule);
    }

    const actionItems: WeekOperationsActionItem[] = [];
    const conflictByWorkerDate = new Map<string, string>();

    for (const assignment of assignments) {
      if (!assignment.providerId) continue;
      const iso = toIsoDateUTC(assignment.date);
      const rule = ruleByProviderWeekday.get(`${assignment.providerId}:${weekdayFromIsoDate(iso)}`);
      if (!rule || rule.requiredEmployeeId === assignment.employeeId) continue;
      const title = `${assignment.provider?.name ?? "Provider"} pairing conflict`;
      const detail = `${assignment.employee.name} is assigned, but ${rule.requiredEmployee.name} is required.`;
      conflictByWorkerDate.set(`${assignment.employeeId}:${iso}`, detail);
      actionItems.push({
        id: `pairing-${assignment.id}`,
        type: "blocked",
        label: "Pairing conflict",
        title,
        detail,
        href: `/schedule/roster?date=${iso}`,
      });
    }

    const boardDays: WeekOperationsDay[] = days.map((date) => {
      const providers = providersByDate.get(date) ?? 0;
      const workers = assignmentsByDate.get(date) ?? 0;
      const delta = workers - providers;
      const status = coverageStatus(providers, workers);
      if (status === "understaffed") {
        actionItems.push({
          id: `coverage-${date}`,
          type: "coverage-gap",
          label: "Needs coverage",
          title: `${Math.abs(delta)} worker${Math.abs(delta) === 1 ? "" : "s"} short`,
          detail: `${date}: ${providers} providers scheduled, ${workers} workers assigned.`,
          href: `/schedule/roster?date=${date}`,
        });
      }
      return {
        date,
        providersScheduled: providers,
        workersScheduled: workers,
        delta,
        status,
        exceptionCount: status === "understaffed" ? Math.abs(delta) : 0,
      };
    });

    for (const post of swapPosts) {
      const date = toIsoDateUTC(post.targetAssignment.date);
      actionItems.push({
        id: `swap-${post.id}`,
        type: "pending-request",
        label: "Pending approval",
        title: `${post.ownerEmployee.name} requested coverage`,
        detail: `Target shift: ${date}.`,
          href: `/requests/${post.id}`,
      });
    }

    const workers = employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      cells: days.map((date) => {
        const assignment = assignmentByWorkerDate.get(`${employee.id}:${date}`);
        if (!assignment) {
          return { date, status: "off" as const, label: "Off" };
        }
        const conflict = conflictByWorkerDate.get(`${employee.id}:${date}`);
        if (conflict) {
          return {
            date,
            providerName: assignment.provider?.name,
            status: "pairing-conflict" as const,
            label: "Pairing conflict",
            detail: conflict,
          };
        }
        if (!assignment.provider) {
          return { date, status: "unassigned" as const, label: "Unassigned" };
        }
        return {
          date,
          providerName: assignment.provider.name,
          status: "assigned" as const,
          label: assignment.provider.name,
        };
      }),
    }));

    return {
      weekStartIso,
      weekEndIso,
      days: boardDays,
      workers,
      actionItems: actionItems.slice(0, 12),
      summary: {
        understaffedDays: boardDays.filter((d) => d.status === "understaffed").length,
        overstaffedDays: boardDays.filter((d) => d.status === "overstaffed").length,
        pendingRequests: swapPosts.length,
        blockedItems: actionItems.filter((i) => i.type === "blocked").length,
      },
    };
  } catch (e) {
    throw e;
  }
}


export async function getBalanceRangeData(args: { startIso: IsoDate; endIsoExclusive: IsoDate }) {
  const start = new Date(`${args.startIso}T00:00:00.000Z`);
  const end = new Date(`${args.endIsoExclusive}T00:00:00.000Z`);
  const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));

  try {
    const providerSchedules = await prisma.providerSchedule.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true },
    });
    const assignments = await prisma.assignment.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true },
    });

    const providersByDate = new Map<string, number>();
    for (const p of providerSchedules) {
      const iso = toIsoDateUTC(p.date);
      providersByDate.set(iso, (providersByDate.get(iso) ?? 0) + 1);
    }
    const masByDate = new Map<string, number>();
    for (const a of assignments) {
      const iso = toIsoDateUTC(a.date);
      masByDate.set(iso, (masByDate.get(iso) ?? 0) + 1);
    }

    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      const iso = toIsoDateUTC(d);
      return {
        date: iso,
        providersScheduled: providersByDate.get(iso) ?? 0,
        medicalAssistantsScheduled: masByDate.get(iso) ?? 0,
      };
    });
  } catch (e) {
    throw e;
  }
}

export async function getRosterData(isoDate: IsoDate) {
  try {
    const date = new Date(`${isoDate}T00:00:00.000Z`);
    const assignments = await prisma.assignment.findMany({
      where: { date },
      include: { employee: true, provider: true },
      orderBy: { employee: { name: "asc" } },
    });
    return {
      date: isoDate,
      assignments: assignments.map((a) => ({ employee: { id: a.employeeId, name: a.employee.name }, provider: a.provider ? { id: a.providerId!, name: a.provider.name } : undefined })),
    };
  } catch (e) {
    throw e;
  }
}

export async function getSwapBoardData() {
  try {
    const posts = await prisma.swapPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ownerEmployee: true,
        targetAssignment: { include: { provider: true } },
      },
      take: 50,
    });
    return {
      posts: posts.map((p) => ({
        id: p.id,
        owner: { id: p.ownerEmployeeId, name: p.ownerEmployee.name },
        ownerEmployeeId: p.ownerEmployeeId,
        targetDate: toIsoDateUTC(p.targetAssignment.date),
        provider: p.targetAssignment.provider
          ? { id: p.targetAssignment.provider.id, name: p.targetAssignment.provider.name }
          : null,
        note: p.note ?? undefined,
        status: p.status,
        createdAtIso: p.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    throw e;
  }
}

export async function getSwapPostDetailData(postId: string) {
  try {
    const post = await prisma.swapPost.findUnique({
      where: { id: postId },
      include: {
        ownerEmployee: true,
        targetAssignment: true,
        proposals: { include: { proposerEmployee: true, offeredAssignment: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!post) return { post: null, proposals: [] };
    return {
      post: {
        id: post.id,
        ownerEmployeeId: post.ownerEmployeeId,
        owner: { id: post.ownerEmployeeId, name: post.ownerEmployee.name },
        targetDate: toIsoDateUTC(post.targetAssignment.date),
        note: post.note ?? undefined,
        status: post.status,
        createdAtIso: post.createdAt.toISOString(),
      },
      proposals: post.proposals.map((p) => ({
        id: p.id,
        postId: p.postId,
        proposerEmployeeId: p.proposerEmployeeId,
        proposer: { id: p.proposerEmployeeId, name: p.proposerEmployee.name },
        offeredDate: toIsoDateUTC(p.offeredAssignment.date),
        status: p.status,
        createdAtIso: p.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    throw e;
  }
}

export async function getMySwapsData(employeeProfileId: string) {
  try {
    const current = await prisma.employeeProfile.findUnique({ where: { id: employeeProfileId } });
    if (!current) throw new Error("Employee profile not found");

    const myPosts = await prisma.swapPost.findMany({
      where: { ownerEmployeeId: employeeProfileId },
      include: { ownerEmployee: true, targetAssignment: true },
      orderBy: { createdAt: "desc" },
    });

    const incoming = await prisma.swapProposal.findMany({
      where: { post: { ownerEmployeeId: employeeProfileId } },
      include: {
        proposerEmployee: true,
        post: { include: { ownerEmployee: true, targetAssignment: true } },
        offeredAssignment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const outgoing = await prisma.swapProposal.findMany({
      where: { proposerEmployeeId: employeeProfileId },
      include: {
        proposerEmployee: true,
        post: { include: { ownerEmployee: true, targetAssignment: true } },
        offeredAssignment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      current: { id: current.id, name: current.name },
      myPosts: myPosts.map((p) => ({
        id: p.id,
        ownerEmployeeId: p.ownerEmployeeId,
        targetDate: toIsoDateUTC(p.targetAssignment.date),
        note: p.note ?? undefined,
        status: p.status,
        createdAtIso: p.createdAt.toISOString(),
        owner: { id: p.ownerEmployeeId, name: p.ownerEmployee.name },
      })),
      incomingProposals: incoming.map((p) => ({
        id: p.id,
        postId: p.postId,
        proposerEmployeeId: p.proposerEmployeeId,
        offeredDate: toIsoDateUTC(p.offeredAssignment.date),
        status: p.status,
        createdAtIso: p.createdAt.toISOString(),
        proposer: { id: p.proposerEmployeeId, name: p.proposerEmployee.name },
        post: {
          id: p.post.id,
          ownerEmployeeId: p.post.ownerEmployeeId,
          targetDate: toIsoDateUTC(p.post.targetAssignment.date),
          note: p.post.note ?? undefined,
          status: p.post.status,
          createdAtIso: p.post.createdAt.toISOString(),
          owner: { id: p.post.ownerEmployeeId, name: p.post.ownerEmployee.name },
        },
      })),
      myProposals: outgoing.map((p) => ({
        id: p.id,
        postId: p.postId,
        proposerEmployeeId: p.proposerEmployeeId,
        offeredDate: toIsoDateUTC(p.offeredAssignment.date),
        status: p.status,
        createdAtIso: p.createdAt.toISOString(),
        proposer: { id: p.proposerEmployeeId, name: p.proposerEmployee.name },
        post: {
          id: p.post.id,
          ownerEmployeeId: p.post.ownerEmployeeId,
          targetDate: toIsoDateUTC(p.post.targetAssignment.date),
          note: p.post.note ?? undefined,
          status: p.post.status,
          createdAtIso: p.post.createdAt.toISOString(),
          owner: { id: p.post.ownerEmployeeId, name: p.post.ownerEmployee.name },
        },
      })),
    };
  } catch (e) {
    throw e;
  }
}

export async function getProviderRulesData() {
  try {
    const rules = await prisma.providerMaRule.findMany({
      include: { provider: true, requiredEmployee: true },
      orderBy: [{ provider: { name: "asc" } }, { weekday: "asc" }],
    });
    return {
      rules: rules.map((r) => ({
        id: r.id,
        providerId: r.providerId,
        weekday: r.weekday,
        requiredEmployeeId: r.requiredEmployeeId,
        provider: { id: r.providerId, name: r.provider.name },
        requiredEmployee: { id: r.requiredEmployeeId, name: r.requiredEmployee.name },
      })),
    };
  } catch (e) {
    throw e;
  }
}

export async function getWeeklyRosterMatrixData(args: { weekStartIso: IsoDate }) {
  const start = new Date(`${args.weekStartIso}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  try {
    const employees = await prisma.employeeProfile.findMany({ orderBy: { name: "asc" } });
    const assignments = await prisma.assignment.findMany({
      where: { date: { gte: start, lt: end } },
      include: { provider: true },
    });

    const cells = new Map<string, { providerName?: string }>(); // `${employeeId}:${iso}` -> cell
    for (const a of assignments) {
      const iso = toIsoDateUTC(a.date);
      cells.set(`${a.employeeId}:${iso}`, { providerName: a.provider?.name });
    }

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      return toIsoDateUTC(d);
    });

    return {
      weekStartIso: args.weekStartIso,
      days,
      employees: employees.map((e) => ({ id: e.id, name: e.name })),
      cells,
    };
  } catch (e) {
    throw e;
  }
}

export type MySwapsData = Awaited<ReturnType<typeof getMySwapsData>>;

// ─── Schedule page data (employee dashboard) ────────────────────────────────

export type ScheduleCell = {
  date: IsoDate;
  status: "assigned" | "off";
  providerName: string | null;
  assignmentId: string | null;
};

export type ScheduleEmployee = {
  id: string;
  name: string;
  isCurrentUser: boolean;
  cells: ScheduleCell[];
};

export type ScheduleDay = {
  date: IsoDate;
  weekdayShort: string;
  monthDay: string;
};

export type SchedulePageData = {
  weekStartIso: IsoDate;
  weekEndIso: IsoDate;
  prevWeekIso: IsoDate;
  nextWeekIso: IsoDate;
  days: ScheduleDay[];
  employees: ScheduleEmployee[];
  currentEmployee: { id: string; name: string } | null;
};

function weekRangeFromMonday(monday: Date) {
  const start = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

function mondayOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function offsetWeek(monday: IsoDate, weeks: number): IsoDate {
  const d = new Date(`${monday}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return toIsoDateUTC(d);
}

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getSchedulePageData(
  currentEmployeeProfileId: string | null,
  weekParam: string | null,
): Promise<SchedulePageData> {
  const monday = weekParam
    ? mondayOfWeek(new Date(`${weekParam}T00:00:00.000Z`))
    : mondayOfWeek(new Date());

  const { start, end } = weekRangeFromMonday(monday);
  const weekStartIso = toIsoDateUTC(start);
  const weekEnd = new Date(end);
  weekEnd.setUTCDate(weekEnd.getUTCDate() - 1);
  const weekEndIso = toIsoDateUTC(weekEnd);
  const prevWeekIso = offsetWeek(weekStartIso, -1);
  const nextWeekIso = offsetWeek(weekStartIso, 1);

  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = toIsoDateUTC(d);
    return {
      date: iso,
      weekdayShort: WEEKDAYS_SHORT[d.getUTCDay()]!,
      monthDay: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
    };
  });

  try {
    const [allEmployees, assignments] = await Promise.all([
      prisma.employeeProfile.findMany({ orderBy: { name: "asc" } }),
      prisma.assignment.findMany({
        where: { date: { gte: start, lt: end } },
        include: { employee: true, provider: true },
      }),
    ]);

    const assignmentByWorkerDate = new Map<string, (typeof assignments)[number]>();
    for (const a of assignments) {
      assignmentByWorkerDate.set(`${a.employeeId}:${toIsoDateUTC(a.date)}`, a);
    }

    const buildEmployeeRow = (emp: (typeof allEmployees)[number]): ScheduleEmployee => ({
      id: emp.id,
      name: emp.name,
      isCurrentUser: emp.id === currentEmployeeProfileId,
      cells: days.map((day) => {
        const a = assignmentByWorkerDate.get(`${emp.id}:${day.date}`);
        if (!a) return { date: day.date, status: "off", providerName: null, assignmentId: null };
        return {
          date: day.date,
          status: "assigned",
          providerName: a.provider?.name ?? null,
          assignmentId: a.id,
        };
      }),
    });

    const currentEmpRecord = allEmployees.find((e) => e.id === currentEmployeeProfileId) ?? null;

    // Current user's row always first
    const sorted = [
      ...allEmployees.filter((e) => e.id === currentEmployeeProfileId),
      ...allEmployees.filter((e) => e.id !== currentEmployeeProfileId),
    ];

    return {
      weekStartIso,
      weekEndIso,
      prevWeekIso,
      nextWeekIso,
      days,
      employees: sorted.map(buildEmployeeRow),
      currentEmployee: currentEmpRecord ? { id: currentEmpRecord.id, name: currentEmpRecord.name } : null,
    };
  } catch (e) {
    throw e;
  }
}
