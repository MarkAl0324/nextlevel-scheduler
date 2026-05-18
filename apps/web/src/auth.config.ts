import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Maps JWT token claims → session.user so the `authorized` callback
    // (and any proxy-level auth check) can read custom fields like `role`.
    // This callback must live here (not only in auth.ts) because proxy.ts
    // only imports authConfig — no Prisma, edge-safe.
    session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = session.user as any;
        u.id = token.id;
        u.role = token.role;
        u.employeeProfileId = token.employeeProfileId;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname === "/login") {
        if (isLoggedIn) return Response.redirect(new URL("/schedule", nextUrl));
        return true;
      }

      if (!isLoggedIn) return false;

      const role = (auth.user as { role?: string }).role;

      if (pathname.startsWith("/admin/users")) {
        if (role !== "developer") {
          return Response.redirect(new URL("/admin", nextUrl));
        }
      } else if (pathname.startsWith("/admin")) {
        if (role !== "manager" && role !== "developer") {
          return Response.redirect(new URL("/schedule", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
