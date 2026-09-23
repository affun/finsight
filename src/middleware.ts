import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Route protection for the authenticated area.
 *
 * This is a separate Edge-safe Auth.js instance built only from
 * `auth.config.ts` — it must not import `src/lib/auth.ts`, which pulls in
 * Prisma/pg/bcrypt (Node-only). Both instances share the same AUTH_SECRET,
 * so cookies minted by the full instance are verified here.
 *
 * Authorization decisions live in the `authorized` callback of
 * `auth.config.ts`; the matcher below scopes middleware to exactly the
 * protected routes and the auth pages.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/accounts/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/analytics/:path*",
    "/ai-assistant/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
