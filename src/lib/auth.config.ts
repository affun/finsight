import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js configuration.
 *
 * This module is imported by `middleware.ts`, which runs in the Edge runtime.
 * It must never import Prisma, `pg`, or bcrypt — those stay behind in
 * `auth.ts` (Node.js runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    // Credentials logins require the JWT session strategy.
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /**
     * Route authorization. Runs on every matched request (Edge runtime).
     * Returns true to allow, false to trigger a redirect to `pages.signIn`.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = PROTECTED_ROUTES.some(
        (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`),
      );
      const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isProtected) return isLoggedIn;
      if (isAuthPage && isLoggedIn) {
        // Already signed in — skip the auth forms.
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        // `user` is only present on sign-in.
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string" && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [], // populated in src/lib/auth.ts (Node.js runtime)
} satisfies NextAuthConfig;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/budgets",
  "/goals",
  "/analytics",
  "/ai-assistant",
  "/settings",
] as const;
