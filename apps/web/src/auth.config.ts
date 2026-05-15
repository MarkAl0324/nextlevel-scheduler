import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
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
