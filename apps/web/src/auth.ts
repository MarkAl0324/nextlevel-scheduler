import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "employee" | "manager";
      employeeProfileId: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role: "employee" | "manager";
    employeeProfileId: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "employee" | "manager";
    employeeProfileId: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { employeeProfile: true },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.employeeProfile?.name ?? user.email,
          role: user.role,
          employeeProfileId: user.employeeProfile?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    authorized: authConfig.callbacks?.authorized,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.employeeProfileId = user.employeeProfileId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "employee" | "manager";
      session.user.employeeProfileId = token.employeeProfileId as string | null;
      return session;
    },
  },
});
