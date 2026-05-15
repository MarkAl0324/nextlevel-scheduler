"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export type SwapActionResult = { ok: true } | { ok: false; error: string };

function weekdayFromDate(d: Date): "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  return days[d.getUTCDay()];
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

type Actor = { employeeProfileId: string; actorId: string; actorName: string };

async function requireEmployee(): Promise<Actor> {
  const session = await auth();
  const employeeProfileId = session?.user?.employeeProfileId;
  if (!employeeProfileId) throw new Error("Not authenticated");
  return {
    employeeProfileId,
    actorId: session.user.id,
    actorName: session.user.name ?? session.user.email ?? "Unknown",
  };
}

export async function createSwapPost(
  assignmentId: string,
  note: string | undefined,
): Promise<SwapActionResult> {
  try {
    const { employeeProfileId, actorId, actorName } = await requireEmployee();

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return { ok: false, error: "Assignment not found." };
    if (assignment.employeeId !== employeeProfileId)
      return { ok: false, error: "This is not your assignment." };

    const existing = await prisma.swapPost.findFirst({
      where: { targetAssignmentId: assignmentId, status: "posted" },
    });
    if (existing) return { ok: false, error: "This shift is already posted for swap." };

    const post = await prisma.swapPost.create({
      data: {
        ownerEmployeeId: employeeProfileId,
        targetAssignmentId: assignmentId,
        note: note?.trim() || null,
      },
    });

    await logAudit("SWAP_POSTED", actorId, actorName, {
      postId: post.id,
      date: isoDate(assignment.date),
    });

    revalidatePath("/requests");
    revalidatePath("/my-swaps");
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function createSwapProposal(
  postId: string,
  offeredAssignmentId: string,
): Promise<SwapActionResult> {
  try {
    const { employeeProfileId: proposerEmployeeId, actorId, actorName } = await requireEmployee();

    const post = await prisma.swapPost.findUnique({
      where: { id: postId },
      include: { targetAssignment: true },
    });
    if (!post) return { ok: false, error: "Swap post not found." };
    if (post.status !== "posted") return { ok: false, error: "This request is no longer available." };
    if (post.ownerEmployeeId === proposerEmployeeId)
      return { ok: false, error: "You cannot propose on your own request." };

    const offeredAssignment = await prisma.assignment.findUnique({
      where: { id: offeredAssignmentId },
    });
    if (!offeredAssignment) return { ok: false, error: "Offered assignment not found." };
    if (offeredAssignment.employeeId !== proposerEmployeeId)
      return { ok: false, error: "This is not your assignment." };

    const targetDate = post.targetAssignment.date;
    const offeredDate = offeredAssignment.date;

    if (targetDate.getTime() === offeredDate.getTime())
      return { ok: false, error: "Offered date cannot be the same as the target date." };

    const proposerOnTarget = await prisma.assignment.findFirst({
      where: { employeeId: proposerEmployeeId, date: targetDate },
    });
    if (proposerOnTarget)
      return { ok: false, error: "Conflict: you already have a shift on the target date." };

    const ownerOnOffered = await prisma.assignment.findFirst({
      where: { employeeId: post.ownerEmployeeId, date: offeredDate },
    });
    if (ownerOnOffered)
      return {
        ok: false,
        error: "Conflict: the request owner already has a shift on your offered date.",
      };

    // Provider pairing rules — check both sides of the swap
    const providerIds = [
      post.targetAssignment.providerId,
      offeredAssignment.providerId,
    ].filter(Boolean) as string[];

    if (providerIds.length > 0) {
      const rules = await prisma.providerMaRule.findMany({
        where: { providerId: { in: providerIds } },
        include: { requiredEmployee: { select: { name: true } } },
      });
      const ruleKey = (providerId: string, weekday: string) => `${providerId}:${weekday}`;
      const ruleMap = new Map(rules.map((r) => [ruleKey(r.providerId, r.weekday), r]));

      if (post.targetAssignment.providerId) {
        const weekday = weekdayFromDate(targetDate);
        const rule = ruleMap.get(ruleKey(post.targetAssignment.providerId, weekday));
        if (rule && rule.requiredEmployeeId !== proposerEmployeeId) {
          return {
            ok: false,
            error: `Provider pairing conflict: the target shift requires ${rule.requiredEmployee.name} on ${weekday}.`,
          };
        }
      }

      if (offeredAssignment.providerId) {
        const weekday = weekdayFromDate(offeredDate);
        const rule = ruleMap.get(ruleKey(offeredAssignment.providerId, weekday));
        if (rule && rule.requiredEmployeeId !== post.ownerEmployeeId) {
          return {
            ok: false,
            error: `Provider pairing conflict: your offered shift requires ${rule.requiredEmployee.name} on ${weekday}.`,
          };
        }
      }
    }

    const proposal = await prisma.swapProposal.create({
      data: { postId, proposerEmployeeId, offeredAssignmentId },
    });

    await logAudit("SWAP_PROPOSED", actorId, actorName, {
      postId,
      proposalId: proposal.id,
      targetDate: isoDate(targetDate),
      offeredDate: isoDate(offeredDate),
    });

    revalidatePath(`/requests/${postId}`);
    revalidatePath("/my-swaps");
    return { ok: true };
  } catch (e) {
    if ((e as { code?: string })?.code === "P2002")
      return { ok: false, error: "You have already proposed this shift for this request." };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function acceptSwapProposal(
  postId: string,
  proposalId: string,
): Promise<SwapActionResult> {
  try {
    const { employeeProfileId: ownerEmployeeId, actorId, actorName } = await requireEmployee();

    const post = await prisma.swapPost.findUnique({
      where: { id: postId },
      include: { targetAssignment: true, ownerEmployee: true },
    });
    if (!post) return { ok: false, error: "Request not found." };
    if (post.ownerEmployeeId !== ownerEmployeeId)
      return { ok: false, error: "You can only accept proposals on your own request." };
    if (post.status !== "posted") return { ok: false, error: "This request is no longer available." };

    const proposal = await prisma.swapProposal.findUnique({
      where: { id: proposalId },
      include: { offeredAssignment: true, proposerEmployee: true },
    });
    if (!proposal || proposal.postId !== postId) return { ok: false, error: "Proposal not found." };
    if (proposal.status !== "pending")
      return { ok: false, error: "Only pending proposals can be accepted." };

    const { proposerEmployeeId } = proposal;
    const targetDate = post.targetAssignment.date;
    const offeredDate = proposal.offeredAssignment.date;

    // Re-validate at accept time — schedule may have changed since proposal was submitted
    const proposerOnTarget = await prisma.assignment.findFirst({
      where: {
        employeeId: proposerEmployeeId,
        date: targetDate,
        id: { not: post.targetAssignmentId },
      },
    });
    if (proposerOnTarget)
      return { ok: false, error: "Conflict: proposer now has a shift on the target date." };

    const ownerOnOffered = await prisma.assignment.findFirst({
      where: {
        employeeId: ownerEmployeeId,
        date: offeredDate,
        id: { not: proposal.offeredAssignmentId },
      },
    });
    if (ownerOnOffered)
      return { ok: false, error: "Conflict: you now have a shift on the proposer's offered date." };

    const providerIds = [
      post.targetAssignment.providerId,
      proposal.offeredAssignment.providerId,
    ].filter(Boolean) as string[];

    if (providerIds.length > 0) {
      const rules = await prisma.providerMaRule.findMany({
        where: { providerId: { in: providerIds } },
      });
      const ruleMap = new Map(rules.map((r) => [`${r.providerId}:${r.weekday}`, r]));

      if (post.targetAssignment.providerId) {
        const weekday = weekdayFromDate(targetDate);
        const rule = ruleMap.get(`${post.targetAssignment.providerId}:${weekday}`);
        if (rule && rule.requiredEmployeeId !== proposerEmployeeId)
          return { ok: false, error: "Provider pairing conflict on the target shift." };
      }

      if (proposal.offeredAssignment.providerId) {
        const weekday = weekdayFromDate(offeredDate);
        const rule = ruleMap.get(`${proposal.offeredAssignment.providerId}:${weekday}`);
        if (rule && rule.requiredEmployeeId !== ownerEmployeeId)
          return { ok: false, error: "Provider pairing conflict on the offered shift." };
      }
    }

    // Atomic swap: exchange employee IDs on the two assignments
    await prisma.$transaction([
      prisma.assignment.update({
        where: { id: post.targetAssignmentId },
        data: { employeeId: proposerEmployeeId },
      }),
      prisma.assignment.update({
        where: { id: proposal.offeredAssignmentId },
        data: { employeeId: ownerEmployeeId },
      }),
      prisma.swapPost.update({ where: { id: postId }, data: { status: "completed" } }),
      prisma.swapProposal.update({ where: { id: proposalId }, data: { status: "accepted" } }),
      prisma.swapProposal.updateMany({
        where: { postId, id: { not: proposalId }, status: "pending" },
        data: { status: "declined" },
      }),
    ]);

    await logAudit("SWAP_ACCEPTED", actorId, actorName, {
      postId,
      proposalId,
      ownerName: post.ownerEmployee.name,
      proposerName: proposal.proposerEmployee.name,
      targetDate: isoDate(targetDate),
      offeredDate: isoDate(offeredDate),
    });

    revalidatePath("/my-swaps");
    revalidatePath("/schedule");
    revalidatePath("/requests");
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function declineSwapProposal(proposalId: string): Promise<SwapActionResult> {
  try {
    const { employeeProfileId: ownerEmployeeId, actorId, actorName } = await requireEmployee();

    const proposal = await prisma.swapProposal.findUnique({
      where: { id: proposalId },
      include: { post: true, proposerEmployee: true },
    });
    if (!proposal) return { ok: false, error: "Proposal not found." };
    if (proposal.post.ownerEmployeeId !== ownerEmployeeId)
      return { ok: false, error: "You can only decline proposals on your own request." };
    if (proposal.status !== "pending")
      return { ok: false, error: "Only pending proposals can be declined." };

    await prisma.swapProposal.update({ where: { id: proposalId }, data: { status: "declined" } });

    await logAudit("SWAP_DECLINED", actorId, actorName, {
      postId: proposal.postId,
      proposalId,
      proposerName: proposal.proposerEmployee.name,
    });

    revalidatePath("/my-swaps");
    revalidatePath(`/requests/${proposal.postId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function cancelSwapPost(postId: string): Promise<SwapActionResult> {
  try {
    const { employeeProfileId: ownerEmployeeId, actorId, actorName } = await requireEmployee();

    const post = await prisma.swapPost.findUnique({
      where: { id: postId },
      include: { targetAssignment: true },
    });
    if (!post) return { ok: false, error: "Request not found." };
    if (post.ownerEmployeeId !== ownerEmployeeId)
      return { ok: false, error: "You can only cancel your own requests." };
    if (post.status !== "posted")
      return { ok: false, error: "Only active requests can be cancelled." };

    await prisma.swapPost.update({ where: { id: postId }, data: { status: "cancelled" } });

    await logAudit("SWAP_CANCELLED", actorId, actorName, {
      postId,
      date: isoDate(post.targetAssignment.date),
    });

    revalidatePath("/my-swaps");
    revalidatePath("/requests");
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
