"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/schedule",
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      const cause = (err as AuthError & { cause?: { err?: Error } }).cause?.err;
      return { error: `[debug] ${err.constructor.name} | cause: ${cause?.constructor.name}: ${cause?.message ?? "none"}` };
    }
    throw err;
  }
}
