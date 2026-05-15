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

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function createAssignment(
  employeeId: string,
  date: string,
  providerId: string | null,
): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();
    const d = new Date(`${date}T00:00:00.000Z`);

    await prisma.assignment.create({
      data: {
        employeeId,
        date: d,
        providerId: providerId || null,
      },
    });

    const [employee, provider] = await Promise.all([
      prisma.employeeProfile.findUnique({ where: { id: employeeId }, select: { name: true } }),
      providerId
        ? prisma.provider.findUnique({ where: { id: providerId }, select: { name: true } })
        : null,
    ]);

    await logAudit("ASSIGNMENT_CREATED", actorId, actorName, {
      employeeName: employee?.name ?? employeeId,
      date,
      providerName: provider?.name ?? null,
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002")
      return { ok: false, error: "This employee already has an assignment on that date." };
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteAssignment(assignmentId: string): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { employee: true, provider: true },
    });

    await prisma.assignment.delete({ where: { id: assignmentId } });

    if (assignment) {
      await logAudit("ASSIGNMENT_DELETED", actorId, actorName, {
        employeeName: assignment.employee.name,
        date: isoDate(assignment.date),
        providerName: assignment.provider?.name ?? null,
      });
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function updateAssignmentProvider(
  assignmentId: string,
  providerId: string | null,
): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { providerId: providerId || null },
      include: { employee: true, provider: true },
    });

    await logAudit("ASSIGNMENT_PROVIDER_UPDATED", actorId, actorName, {
      employeeName: assignment.employee.name,
      date: isoDate(assignment.date),
      providerName: assignment.provider?.name ?? null,
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function createProviderSchedule(
  providerId: string,
  date: string,
): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();
    const d = new Date(`${date}T00:00:00.000Z`);
    await prisma.providerSchedule.create({ data: { providerId, date: d } });

    const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { name: true } });
    await logAudit("PROVIDER_SCHEDULE_CREATED", actorId, actorName, {
      providerName: provider?.name ?? providerId,
      date,
    });

    revalidatePath("/admin/providers");
    revalidatePath("/admin/schedule");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002")
      return { ok: false, error: "This provider is already scheduled on that date." };
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function adminCancelSwapPost(postId: string): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();

    const post = await prisma.swapPost.findUnique({
      where: { id: postId },
      include: { ownerEmployee: true, targetAssignment: true },
    });
    if (!post) return { ok: false, error: "Request not found." };
    if (post.status !== "posted") return { ok: false, error: "Only active requests can be cancelled." };

    await prisma.swapPost.update({ where: { id: postId }, data: { status: "cancelled" } });

    await logAudit("ADMIN_CANCEL_SWAP", actorId, actorName, {
      postId,
      ownerName: post.ownerEmployee.name,
      date: isoDate(post.targetAssignment.date),
    });

    revalidatePath("/admin/requests");
    revalidatePath("/requests");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function deleteProviderSchedule(scheduleId: string): Promise<Result> {
  try {
    const { actorId, actorName } = await requireManager();

    const schedule = await prisma.providerSchedule.findUnique({
      where: { id: scheduleId },
      include: { provider: true },
    });

    await prisma.providerSchedule.delete({ where: { id: scheduleId } });

    if (schedule) {
      await logAudit("PROVIDER_SCHEDULE_DELETED", actorId, actorName, {
        providerName: schedule.provider.name,
        date: isoDate(schedule.date),
      });
    }

    revalidatePath("/admin/providers");
    revalidatePath("/admin/schedule");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "Not authorized")
      return { ok: false, error: "Not authorized." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
