export type IsoDate = `${number}-${number}-${number}`;

export type DemoWorkDay = {
  date: IsoDate;
  providersScheduled: number;
  medicalAssistantsScheduled: number;
};

export type DemoEmployee = {
  id: string;
  name: string;
};

export type DemoProvider = {
  id: string;
  name: string;
};

export type DemoAssignment = {
  date: IsoDate;
  employeeId: string;
  providerId?: string;
};

export type DemoSwapPostStatus = "posted" | "cancelled" | "expired" | "completed";

export type DemoSwapPost = {
  id: string;
  ownerEmployeeId: string;
  targetDate: IsoDate;
  note?: string;
  status: DemoSwapPostStatus;
  createdAtIso: string;
};

export type DemoSwapProposalStatus = "pending" | "withdrawn" | "declined" | "accepted";

export type DemoSwapProposal = {
  id: string;
  postId: string;
  proposerEmployeeId: string;
  offeredDate: IsoDate;
  status: DemoSwapProposalStatus;
  createdAtIso: string;
};

export type DemoWeekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type DemoProviderMaRule = {
  id: string;
  providerId: string;
  weekday: DemoWeekday;
  requiredEmployeeId: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export function toIsoDate(d: Date): IsoDate {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` as IsoDate;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDemoEmployees(): DemoEmployee[] {
  return [
    { id: "e1", name: "Ava Martinez" },
    { id: "e2", name: "Noah Kim" },
    { id: "e3", name: "Mia Johnson" },
    { id: "e4", name: "Ethan Patel" },
    { id: "e5", name: "Sophia Nguyen" },
    { id: "e6", name: "Liam Davis" },
  ];
}

export function getDemoProviders(): DemoProvider[] {
  return [
    { id: "p1", name: "Dr. Chen" },
    { id: "p2", name: "Dr. Rivera" },
    { id: "p3", name: "Dr. Shah" },
    { id: "p4", name: "Dr. Brooks" },
    { id: "p5", name: "Dr. Ali" },
  ];
}

export function getDemoAssignmentsForWeek(seedDate = new Date()): DemoAssignment[] {
  const start = startOfWeekMonday(seedDate);
  const employees = getDemoEmployees();
  const providers = getDemoProviders();

  const byDay: DemoAssignment[][] = [
    // Mon: balanced (5 providers, 5 MAs assigned)
    [
      { date: toIsoDate(addDays(start, 0)), employeeId: employees[0].id, providerId: providers[0].id },
      { date: toIsoDate(addDays(start, 0)), employeeId: employees[1].id, providerId: providers[1].id },
      { date: toIsoDate(addDays(start, 0)), employeeId: employees[2].id, providerId: providers[2].id },
      { date: toIsoDate(addDays(start, 0)), employeeId: employees[3].id, providerId: providers[3].id },
      { date: toIsoDate(addDays(start, 0)), employeeId: employees[4].id, providerId: providers[4].id },
    ],
    // Tue: under (5 providers, 4 MAs)
    [
      { date: toIsoDate(addDays(start, 1)), employeeId: employees[0].id, providerId: providers[0].id },
      { date: toIsoDate(addDays(start, 1)), employeeId: employees[1].id, providerId: providers[1].id },
      { date: toIsoDate(addDays(start, 1)), employeeId: employees[2].id, providerId: providers[2].id },
      { date: toIsoDate(addDays(start, 1)), employeeId: employees[3].id, providerId: providers[3].id },
    ],
    // Wed: over (4 providers, 6 MAs; some unassigned)
    [
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[0].id, providerId: providers[0].id },
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[1].id, providerId: providers[1].id },
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[2].id, providerId: providers[2].id },
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[3].id, providerId: providers[3].id },
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[4].id },
      { date: toIsoDate(addDays(start, 2)), employeeId: employees[5].id },
    ],
    // Thu: balanced (5 providers, 5 MAs)
    [
      { date: toIsoDate(addDays(start, 3)), employeeId: employees[0].id, providerId: providers[0].id },
      { date: toIsoDate(addDays(start, 3)), employeeId: employees[1].id, providerId: providers[1].id },
      { date: toIsoDate(addDays(start, 3)), employeeId: employees[2].id, providerId: providers[2].id },
      { date: toIsoDate(addDays(start, 3)), employeeId: employees[3].id, providerId: providers[3].id },
      { date: toIsoDate(addDays(start, 3)), employeeId: employees[4].id, providerId: providers[4].id },
    ],
    // Fri: over (5 providers, 6 MAs)
    [
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[0].id, providerId: providers[0].id },
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[1].id, providerId: providers[1].id },
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[2].id, providerId: providers[2].id },
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[3].id, providerId: providers[3].id },
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[4].id, providerId: providers[4].id },
      { date: toIsoDate(addDays(start, 4)), employeeId: employees[5].id },
    ],
    // Sat: under (2 providers, 1 MA)
    [{ date: toIsoDate(addDays(start, 5)), employeeId: employees[0].id, providerId: providers[0].id }],
    // Sun: no staffing
    [],
  ];

  return byDay.flat();
}

export function getDemoWeek(seedDate = new Date()): DemoWorkDay[] {
  const start = startOfWeekMonday(seedDate);
  const assignments = getDemoAssignmentsForWeek(seedDate);
  const providers = getDemoProviders();

  const assignmentsByDate = new Map<IsoDate, DemoAssignment[]>();
  for (const a of assignments) {
    const list = assignmentsByDate.get(a.date) ?? [];
    list.push(a);
    assignmentsByDate.set(a.date, list);
  }

  // For demo, assume any providerId referenced implies that provider is scheduled that day.
  // In real data, ProviderWorkDay will be the source of truth.
  return Array.from({ length: 7 }, (_, i) => {
    const date = toIsoDate(addDays(start, i));
    const dayAssignments = assignmentsByDate.get(date) ?? [];
    const providerIds = new Set<string>();
    for (const a of dayAssignments) {
      if (a.providerId) providerIds.add(a.providerId);
    }
    // Clamp provider count to demo provider list to avoid typos.
    const providersScheduled = Array.from(providerIds).filter((id) => providers.some((p) => p.id === id)).length;
    const medicalAssistantsScheduled = dayAssignments.length;
    return { date, providersScheduled, medicalAssistantsScheduled };
  });
}

export function getDemoRosterForDate(
  isoDate: IsoDate,
  seedDate = new Date(),
): {
  date: IsoDate;
  employees: DemoEmployee[];
  providers: DemoProvider[];
  assignments: Array<{ employee: DemoEmployee; provider?: DemoProvider }>;
} {
  const employees = getDemoEmployees();
  const providers = getDemoProviders();
  const assignments = getDemoAssignmentsForWeek(seedDate).filter((a) => a.date === isoDate);

  const providerById = new Map(providers.map((p) => [p.id, p]));
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  return {
    date: isoDate,
    employees,
    providers,
    assignments: assignments
      .map((a) => ({
        employee: employeeById.get(a.employeeId)!,
        provider: a.providerId ? providerById.get(a.providerId) : undefined,
      }))
      .sort((a, b) => a.employee.name.localeCompare(b.employee.name)),
  };
}

export function getDemoSwapPosts(seedDate = new Date()): DemoSwapPost[] {
  const start = startOfWeekMonday(seedDate);
  return [
    {
      id: "sp1",
      ownerEmployeeId: "e2",
      targetDate: toIsoDate(addDays(start, 1)),
      note: "Need to swap for an appointment.",
      status: "posted",
      createdAtIso: new Date(addDays(start, 0)).toISOString(),
    },
    {
      id: "sp2",
      ownerEmployeeId: "e4",
      targetDate: toIsoDate(addDays(start, 4)),
      note: "Looking for a different day this week.",
      status: "posted",
      createdAtIso: new Date(addDays(start, 2)).toISOString(),
    },
    {
      id: "sp3",
      ownerEmployeeId: "e1",
      targetDate: toIsoDate(addDays(start, 5)),
      status: "expired",
      createdAtIso: new Date(addDays(start, 1)).toISOString(),
    },
  ];
}

export function getDemoSwapProposals(seedDate = new Date()): DemoSwapProposal[] {
  const start = startOfWeekMonday(seedDate);
  return [
    {
      id: "pp1",
      postId: "sp1",
      proposerEmployeeId: "e5",
      offeredDate: toIsoDate(addDays(start, 2)),
      status: "pending",
      createdAtIso: new Date(addDays(start, 1)).toISOString(),
    },
    {
      id: "pp2",
      postId: "sp1",
      proposerEmployeeId: "e6",
      offeredDate: toIsoDate(addDays(start, 4)),
      status: "declined",
      createdAtIso: new Date(addDays(start, 1)).toISOString(),
    },
    {
      id: "pp3",
      postId: "sp2",
      proposerEmployeeId: "e1",
      offeredDate: toIsoDate(addDays(start, 0)),
      status: "pending",
      createdAtIso: new Date(addDays(start, 3)).toISOString(),
    },
  ];
}

export function getDemoSwapBoard(seedDate = new Date()): {
  posts: Array<DemoSwapPost & { owner: DemoEmployee }>;
} {
  const employees = getDemoEmployees();
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const posts = getDemoSwapPosts(seedDate)
    .map((p) => ({ ...p, owner: employeeById.get(p.ownerEmployeeId)! }))
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  return { posts };
}

export function getDemoSwapPostDetail(
  postId: string,
  seedDate = new Date(),
): {
  post: (DemoSwapPost & { owner: DemoEmployee }) | null;
  proposals: Array<DemoSwapProposal & { proposer: DemoEmployee }>;
} {
  const employees = getDemoEmployees();
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const postBase = getDemoSwapPosts(seedDate).find((p) => p.id === postId) ?? null;
  const post = postBase ? { ...postBase, owner: employeeById.get(postBase.ownerEmployeeId)! } : null;
  const proposals = getDemoSwapProposals(seedDate)
    .filter((p) => p.postId === postId)
    .map((p) => ({ ...p, proposer: employeeById.get(p.proposerEmployeeId)! }))
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  return { post, proposals };
}

export function getDemoCurrentEmployee(): DemoEmployee {
  // Until auth exists, treat Ava as the signed-in demo user.
  return getDemoEmployees()[0]!;
}

export function getDemoEmployeeShiftDates(employeeId: string, seedDate = new Date()): IsoDate[] {
  const dates = getDemoAssignmentsForWeek(seedDate)
    .filter((a) => a.employeeId === employeeId)
    .map((a) => a.date);
  return Array.from(new Set(dates)).sort();
}

export function canProposeSwapDemo(args: {
  postId: string;
  offeredDate: IsoDate;
  seedDate?: Date;
}): { ok: true } | { ok: false; reason: string } {
  const seedDate = args.seedDate ?? new Date();
  const current = getDemoCurrentEmployee();
  const detail = getDemoSwapPostDetail(args.postId, seedDate);
  if (!detail.post) return { ok: false, reason: "This swap post no longer exists." };
  const post = detail.post;

  if (post.status !== "posted") return { ok: false, reason: "This swap post is not available." };
  if (post.ownerEmployeeId === current.id) return { ok: false, reason: "You can’t propose a swap on your own post." };

  if (args.offeredDate === post.targetDate) {
    return { ok: false, reason: "Pick a different date—offered shift can’t be the same as the target shift." };
  }

  const assignments = getDemoAssignmentsForWeek(seedDate);
  const hasMyOffered = assignments.some((a) => a.employeeId === current.id && a.date === args.offeredDate);
  if (!hasMyOffered) return { ok: false, reason: "You don’t have a shift on the offered date." };

  const iAlreadyWorkTarget = assignments.some((a) => a.employeeId === current.id && a.date === post.targetDate);
  if (iAlreadyWorkTarget) return { ok: false, reason: "Conflict: you already have a shift on the target date." };

  const ownerAlreadyWorksOffered = assignments.some((a) => a.employeeId === post.ownerEmployeeId && a.date === args.offeredDate);
  if (ownerAlreadyWorksOffered) return { ok: false, reason: "Conflict: the post owner already has a shift on your offered date." };

  const weekdayFromIsoDate = (isoDate: IsoDate): DemoWeekday => {
    const d = new Date(`${isoDate}T00:00:00`);
    // 0=Sun..6=Sat
    const day = d.getDay();
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] as DemoWeekday;
  };

  const employeeName = (employeeId: string) => getDemoEmployees().find((e) => e.id === employeeId)?.name ?? employeeId;
  const providerName = (providerId: string) => getDemoProviders().find((p) => p.id === providerId)?.name ?? providerId;

  const getRuleFor = (providerId: string, weekday: DemoWeekday): DemoProviderMaRule | undefined => {
    const { rules } = getDemoProviderMaRules();
    return rules.find((r) => r.providerId === providerId && r.weekday === weekday);
  };

  const ownerTargetAssignment = assignments.find((a) => a.employeeId === post.ownerEmployeeId && a.date === post.targetDate);
  if (!ownerTargetAssignment) return { ok: false, reason: "This swap post is invalid (missing target shift assignment)." };

  const proposerOfferedAssignment = assignments.find((a) => a.employeeId === current.id && a.date === args.offeredDate);
  if (!proposerOfferedAssignment) return { ok: false, reason: "You can only offer a shift instance you actually have." };

  // Provider pairing constraints (demo): if a provider-day has a rule, the assigned MA must match.
  // After swap:
  // - proposer takes the owner's target assignment's provider (if any)
  // - owner takes the proposer's offered assignment's provider (if any)
  const targetProviderId = ownerTargetAssignment.providerId;
  if (targetProviderId) {
    const weekday = weekdayFromIsoDate(post.targetDate);
    const rule = getRuleFor(targetProviderId, weekday);
    if (rule && rule.requiredEmployeeId !== current.id) {
      return {
        ok: false,
        reason: `Provider pairing conflict: ${providerName(targetProviderId)} on ${weekday} requires ${employeeName(
          rule.requiredEmployeeId,
        )}. This change would assign ${employeeName(current.id)}.`,
      };
    }
  }

  const offeredProviderId = proposerOfferedAssignment.providerId;
  if (offeredProviderId) {
    const weekday = weekdayFromIsoDate(args.offeredDate);
    const rule = getRuleFor(offeredProviderId, weekday);
    if (rule && rule.requiredEmployeeId !== post.ownerEmployeeId) {
      return {
        ok: false,
        reason: `Provider pairing conflict: ${providerName(offeredProviderId)} on ${weekday} requires ${employeeName(
          rule.requiredEmployeeId,
        )}. This change would assign ${employeeName(post.ownerEmployeeId)}.`,
      };
    }
  }

  // Weekly-hours constraints are not fully modeled in demo data.
  // Treat them as “passed” for now; future slices will implement richer validation.
  return { ok: true };
}

export function getDemoMySwaps(seedDate = new Date()): {
  current: DemoEmployee;
  myPosts: Array<DemoSwapPost & { owner: DemoEmployee }>;
  incomingProposals: Array<
    DemoSwapProposal & {
      proposer: DemoEmployee;
      post: DemoSwapPost & { owner: DemoEmployee };
    }
  >;
  myProposals: Array<
    DemoSwapProposal & {
      proposer: DemoEmployee;
      post: DemoSwapPost & { owner: DemoEmployee };
    }
  >;
} {
  const current = getDemoCurrentEmployee();
  const employees = getDemoEmployees();
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  const posts = getDemoSwapPosts(seedDate).map((p) => ({ ...p, owner: employeeById.get(p.ownerEmployeeId)! }));
  const postById = new Map(posts.map((p) => [p.id, p]));

  const proposals = getDemoSwapProposals(seedDate).map((p) => ({
    ...p,
    proposer: employeeById.get(p.proposerEmployeeId)!,
    post: postById.get(p.postId)!,
  }));

  const myPosts = posts
    .filter((p) => p.ownerEmployeeId === current.id)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  const incomingProposals = proposals
    .filter((p) => p.post.ownerEmployeeId === current.id)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  const myProposals = proposals
    .filter((p) => p.proposerEmployeeId === current.id)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));

  return { current, myPosts, incomingProposals, myProposals };
}

export function getDemoProviderMaRules(): {
  rules: Array<DemoProviderMaRule & { provider: DemoProvider; requiredEmployee: DemoEmployee }>;
} {
  const providers = getDemoProviders();
  const employees = getDemoEmployees();
  const providerById = new Map(providers.map((p) => [p.id, p]));
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  const base: DemoProviderMaRule[] = [
    { id: "r1", providerId: "p1", weekday: "Mon", requiredEmployeeId: "e1" },
    { id: "r2", providerId: "p1", weekday: "Tue", requiredEmployeeId: "e2" },
    { id: "r3", providerId: "p2", weekday: "Wed", requiredEmployeeId: "e3" },
    { id: "r4", providerId: "p3", weekday: "Thu", requiredEmployeeId: "e4" },
    { id: "r5", providerId: "p4", weekday: "Fri", requiredEmployeeId: "e5" },
    { id: "r6", providerId: "p5", weekday: "Sat", requiredEmployeeId: "e6" },
  ];

  const rules = base
    .map((r) => ({
      ...r,
      provider: providerById.get(r.providerId)!,
      requiredEmployee: employeeById.get(r.requiredEmployeeId)!,
    }))
    .sort((a, b) => a.provider.name.localeCompare(b.provider.name) || a.weekday.localeCompare(b.weekday));

  return { rules };
}

export function canAcceptProposalDemo(args: {
  postId: string;
  proposalId: string;
  seedDate?: Date;
}): { ok: true } | { ok: false; reason: string } {
  const seedDate = args.seedDate ?? new Date();
  const current = getDemoCurrentEmployee();
  const { post, proposals } = getDemoSwapPostDetail(args.postId, seedDate);
  if (!post) return { ok: false, reason: "This swap post no longer exists." };
  const proposal = proposals.find((p) => p.id === args.proposalId);
  if (!proposal) return { ok: false, reason: "This proposal no longer exists." };

  if (post.ownerEmployeeId !== current.id) return { ok: false, reason: "You can only accept proposals on your own post." };
  if (proposal.status !== "pending") return { ok: false, reason: "Only pending proposals can be accepted." };
  if (post.status !== "posted") return { ok: false, reason: "This swap post is not available." };

  // Validate conflicts and provider pairing, from the owner’s perspective.
  // Treat the proposal as “current employee proposes offeredDate” against the post.
  // Here, the proposer is offering `proposal.offeredDate`, and the post target is `post.targetDate`.
  // Reuse propose validation by temporarily treating the accepter as the post owner and checking both sides explicitly.
  const assignments = getDemoAssignmentsForWeek(seedDate);

  const ownerTargetAssignment = assignments.find((a) => a.employeeId === post.ownerEmployeeId && a.date === post.targetDate);
  if (!ownerTargetAssignment) return { ok: false, reason: "This swap post is invalid (missing target shift assignment)." };

  const proposerOfferedAssignment = assignments.find(
    (a) => a.employeeId === proposal.proposerEmployeeId && a.date === proposal.offeredDate,
  );
  if (!proposerOfferedAssignment) return { ok: false, reason: "This proposal is invalid (proposer missing offered shift)." };

  const proposerAlreadyWorksTarget = assignments.some(
    (a) => a.employeeId === proposal.proposerEmployeeId && a.date === post.targetDate,
  );
  if (proposerAlreadyWorksTarget) return { ok: false, reason: "Conflict: proposer already has a shift on the target date." };

  const ownerAlreadyWorksOffered = assignments.some(
    (a) => a.employeeId === post.ownerEmployeeId && a.date === proposal.offeredDate,
  );
  if (ownerAlreadyWorksOffered) return { ok: false, reason: "Conflict: you already have a shift on the offered date." };

  // Provider pairing constraints — reuse same logic by checking rules for the provider IDs being swapped.
  const weekdayFromIsoDate = (isoDate: IsoDate): DemoWeekday => {
    const d = new Date(`${isoDate}T00:00:00`);
    const day = d.getDay();
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] as DemoWeekday;
  };

  const employeeName = (employeeId: string) => getDemoEmployees().find((e) => e.id === employeeId)?.name ?? employeeId;
  const providerName = (providerId: string) => getDemoProviders().find((p) => p.id === providerId)?.name ?? providerId;

  const getRuleFor = (providerId: string, weekday: DemoWeekday): DemoProviderMaRule | undefined => {
    const { rules } = getDemoProviderMaRules();
    return rules.find((r) => r.providerId === providerId && r.weekday === weekday);
  };

  const targetProviderId = ownerTargetAssignment.providerId;
  if (targetProviderId) {
    const weekday = weekdayFromIsoDate(post.targetDate);
    const rule = getRuleFor(targetProviderId, weekday);
    if (rule && rule.requiredEmployeeId !== proposal.proposerEmployeeId) {
      return {
        ok: false,
        reason: `Provider pairing conflict: ${providerName(targetProviderId)} on ${weekday} requires ${employeeName(
          rule.requiredEmployeeId,
        )}. This change would assign ${employeeName(proposal.proposerEmployeeId)}.`,
      };
    }
  }

  const offeredProviderId = proposerOfferedAssignment.providerId;
  if (offeredProviderId) {
    const weekday = weekdayFromIsoDate(proposal.offeredDate);
    const rule = getRuleFor(offeredProviderId, weekday);
    if (rule && rule.requiredEmployeeId !== post.ownerEmployeeId) {
      return {
        ok: false,
        reason: `Provider pairing conflict: ${providerName(offeredProviderId)} on ${weekday} requires ${employeeName(
          rule.requiredEmployeeId,
        )}. This change would assign ${employeeName(post.ownerEmployeeId)}.`,
      };
    }
  }

  return { ok: true };
}
