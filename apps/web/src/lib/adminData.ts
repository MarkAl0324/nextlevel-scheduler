import { prisma } from "@/lib/db";

type IsoDate = string;

function toIsoDateUTC(d: Date): IsoDate {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mondayOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day + 6) % 7);
  return d;
}

function offsetWeek(monday: IsoDate, weeks: number): IsoDate {
  const d = new Date(`${monday}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return toIsoDateUTC(d);
}

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeekDays(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return {
      date: toIsoDateUTC(d),
      weekdayShort: WEEKDAYS_SHORT[d.getUTCDay()]!,
      monthDay: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
    };
  });
}

// ─── Admin Schedule ───────────────────────────────────────────────────────────

export type AdminScheduleCell = {
  employeeId: string;
  date: IsoDate;
  assignmentId: string | null;
  providerId: string | null;
  providerName: string | null;
};

export type AdminScheduleData = {
  weekStartIso: IsoDate;
  weekEndIso: IsoDate;
  prevWeekIso: IsoDate;
  nextWeekIso: IsoDate;
  days: { date: IsoDate; weekdayShort: string; monthDay: string }[];
  employees: { id: string; name: string }[];
  providers: { id: string; name: string }[];
  cells: AdminScheduleCell[];
};

export async function getAdminScheduleData(
  weekParam: string | null,
): Promise<AdminScheduleData> {
  const monday = weekParam
    ? mondayOfWeek(new Date(`${weekParam}T00:00:00.000Z`))
    : mondayOfWeek(new Date());

  const start = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const weekStartIso = toIsoDateUTC(start);
  const weekEndIso = toIsoDateUTC(new Date(end.getTime() - 86400000));
  const prevWeekIso = offsetWeek(weekStartIso, -1);
  const nextWeekIso = offsetWeek(weekStartIso, 1);
  const days = buildWeekDays(start);

  const [employees, providers, assignments] = await Promise.all([
    prisma.employeeProfile.findMany({ orderBy: { name: "asc" } }),
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
    prisma.assignment.findMany({
      where: { date: { gte: start, lt: end } },
      include: { provider: { select: { name: true } } },
    }),
  ]);

  const assignmentMap = new Map(
    assignments.map((a) => [
      `${a.employeeId}:${toIsoDateUTC(a.date)}`,
      { id: a.id, providerId: a.providerId, providerName: a.provider?.name ?? null },
    ]),
  );

  const cells: AdminScheduleCell[] = employees.flatMap((emp) =>
    days.map((day) => {
      const a = assignmentMap.get(`${emp.id}:${day.date}`);
      return {
        employeeId: emp.id,
        date: day.date,
        assignmentId: a?.id ?? null,
        providerId: a?.providerId ?? null,
        providerName: a?.providerName ?? null,
      };
    }),
  );

  return {
    weekStartIso,
    weekEndIso,
    prevWeekIso,
    nextWeekIso,
    days,
    employees: employees.map((e) => ({ id: e.id, name: e.name })),
    providers: providers.map((p) => ({ id: p.id, name: p.name })),
    cells,
  };
}

// ─── Admin Providers ──────────────────────────────────────────────────────────

export type AdminProviderScheduleEntry = {
  id: string;
  date: IsoDate;
};

export type AdminProviderRow = {
  id: string;
  name: string;
  schedules: AdminProviderScheduleEntry[];
};

export type AdminProvidersData = {
  weekStartIso: IsoDate;
  weekEndIso: IsoDate;
  prevWeekIso: IsoDate;
  nextWeekIso: IsoDate;
  days: { date: IsoDate; weekdayShort: string; monthDay: string }[];
  providers: AdminProviderRow[];
};

export async function getAdminProvidersData(
  weekParam: string | null,
): Promise<AdminProvidersData> {
  const monday = weekParam
    ? mondayOfWeek(new Date(`${weekParam}T00:00:00.000Z`))
    : mondayOfWeek(new Date());

  const start = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const weekStartIso = toIsoDateUTC(start);
  const weekEndIso = toIsoDateUTC(new Date(end.getTime() - 86400000));
  const prevWeekIso = offsetWeek(weekStartIso, -1);
  const nextWeekIso = offsetWeek(weekStartIso, 1);
  const days = buildWeekDays(start);

  const [providers, schedules] = await Promise.all([
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
    prisma.providerSchedule.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    }),
  ]);

  const schedulesByProvider = new Map<string, AdminProviderScheduleEntry[]>();
  for (const s of schedules) {
    const list = schedulesByProvider.get(s.providerId) ?? [];
    list.push({ id: s.id, date: toIsoDateUTC(s.date) });
    schedulesByProvider.set(s.providerId, list);
  }

  return {
    weekStartIso,
    weekEndIso,
    prevWeekIso,
    nextWeekIso,
    days,
    providers: providers.map((p) => ({
      id: p.id,
      name: p.name,
      schedules: schedulesByProvider.get(p.id) ?? [],
    })),
  };
}

// ─── Admin Requests ───────────────────────────────────────────────────────────

export type AdminRequestRow = {
  id: string;
  ownerName: string;
  targetDate: IsoDate;
  status: string;
  note: string | null;
  proposalCount: number;
  createdAtIso: string;
};

export async function getAdminRequestsData(): Promise<{ posts: AdminRequestRow[] }> {
  const posts = await prisma.swapPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ownerEmployee: { select: { name: true } },
      targetAssignment: { select: { date: true } },
      _count: { select: { proposals: true } },
    },
  });

  return {
    posts: posts.map((p) => ({
      id: p.id,
      ownerName: p.ownerEmployee.name,
      targetDate: toIsoDateUTC(p.targetAssignment.date),
      status: p.status,
      note: p.note ?? null,
      proposalCount: p._count.proposals,
      createdAtIso: p.createdAt.toISOString(),
    })),
  };
}

export type AuditRow = {
  id: string;
  action: string;
  actorName: string;
  detail: Record<string, unknown>;
  createdAtIso: string;
};

export async function getAuditData(): Promise<{ events: AuditRow[] }> {
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return {
    events: events.map((e) => ({
      id: e.id,
      action: e.action,
      actorName: e.actorName,
      detail: JSON.parse(e.detail) as Record<string, unknown>,
      createdAtIso: e.createdAt.toISOString(),
    })),
  };
}
