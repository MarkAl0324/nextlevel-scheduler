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

      if (pathname.startsWith("/admin")) {
        const role = (auth.user as { role?: string }).role;
        if (role !== "manager") {
          return Response.redirect(new URL("/schedule", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
