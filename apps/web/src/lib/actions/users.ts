"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type Result = { ok: true } | { ok: false; error: string };
type Actor = { actorId: string; actorName: string };

async function requireDeveloper(): Promise<Actor> {
  const session = await auth();
  if (session?.user?.role !== "developer") throw new Error("Not authorized");
  return {
    actorId: session.user.id,
    actorName: session.user.name ?? session.user.email ?? "Developer",
  };
}

export async function createUser(params: {
  email: string;
  password: string;
  role: "employee" | "manager" | "developer";
  name?: string;
}): Promise<Result> {
  try {
    const { actorId, actorName } = await requireDeveloper();
    const { email, password, role, name } = params;

    if (!email?.trim()) return { ok: false, error: "Email is required" };
    if (!password || password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    if (role === "employee" && !name?.trim()) return { ok: false, error: "Name is required for employees" };

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashed,
        role,
        ...(role === "employee" && name?.trim()
          ? { employeeProfile: { create: { name: name.trim() } } }
          : {}),
      },
      include: { employeeProfile: true },
    });

    await logAudit(AuditAction.USER_CREATED, actorId, actorName, {
      email: user.email,
      role,
      name: user.employeeProfile?.name ?? null,
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return { ok: false, error: "Email already in use" };
    }
    if (e instanceof Error && e.message === "Not authorized") {
      return { ok: false, error: "Not authorized" };
    }
    return { ok: false, error: "Failed to create user" };
  }
}

export async function deleteUser(userId: string): Promise<Result> {
  try {
    const { actorId, actorName } = await requireDeveloper();

    if (actorId === userId) {
      return { ok: false, error: "Cannot delete your own account" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true },
    });

    if (!user) return { ok: false, error: "User not found" };

    await prisma.user.delete({ where: { id: userId } });

    await logAudit(AuditAction.USER_DELETED, actorId, actorName, {
      email: user.email,
      role: user.role,
      name: user.employeeProfile?.name ?? null,
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Not authorized") {
      return { ok: false, error: "Not authorized" };
    }
    return { ok: false, error: "Failed to delete user" };
  }
}
