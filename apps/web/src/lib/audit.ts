"use server";

import { prisma } from "@/lib/db";
import type { AuditAction } from "@/generated/prisma/enums";

export async function logAudit(
  action: AuditAction,
  actorId: string | null,
  actorName: string,
  detail: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: { action, actorId, actorName, detail: JSON.stringify(detail) },
    });
  } catch {
    // Audit failures must not block the main operation
  }
}
