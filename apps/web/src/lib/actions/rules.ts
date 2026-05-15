"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };
type Actor = { actorId: string; actorName: string };

async function requireManager(): Promise<Actor> {
  const session = await auth();
  if (session?.user?.role !== "manager") throw new Error("Not authorized");
  return {
    actorId: session.user.id,
    actorName: session.user.name ?? session.user.email ?? "Manager",
  };
}

const VALID_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Weekday = (typeof VALID_WEEKDAYS)[number];

function isWeekday(value: string): value is Weekday {
  return VALID_WEEKDAYS.includes(value as Weekday);
}

export async function createRule(
  providerId: string,
  weekday: string,
  requiredEmployeeId: string,
): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();
    if (!isWeekday(weekday)) return { ok: false, error: "Invalid weekday." };

    await prisma.providerMaRule.create({
      data: { providerId, weekday, requiredEmployeeId },
    });

    const [provider, employee] = await Promise.all([
      prisma.provider.findUnique({ where: { id: providerId }, select: { name: true } }),
      prisma.employeeProfile.findUnique({ where: { id: requiredEmployeeId }, select: { name: true } }),
    ]);

    await logAudit("RULE_CREATED", actorId, actorName, {
      providerName: provider?.name ?? providerId,
      weekday,
      employeeName: employee?.name ?? requiredEmployeeId,
    });

    revalidatePath("/admin/rules");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002")
      return { ok: false, error: "A rule for this provider and day already exists." };
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteRule(ruleId: string): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();

    const rule = await prisma.providerMaRule.findUnique({
      where: { id: ruleId },
      include: { provider: true, requiredEmployee: true },
    });

    await prisma.providerMaRule.delete({ where: { id: ruleId } });

    if (rule) {
      await logAudit("RULE_DELETED", actorId, actorName, {
        providerName: rule.provider.name,
        weekday: rule.weekday,
        employeeName: rule.requiredEmployee.name,
      });
    }

    revalidatePath("/admin/rules");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
