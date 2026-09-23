import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Provider } from "next-auth/providers";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";/**
 * Full Auth.js configuration (Node.js runtime).
 * Adds the Prisma adapter and the credentials provider on top of the
 * edge-safe base config in `auth.config.ts`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      /**
       * Verifies email + password against the database.
       *
       * Account-enumeration safety: the same generic failure is returned
       * whether the email is unknown or the password is wrong, and a dummy
       * bcrypt compare keeps response timing similar in both cases.
       */
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const DUMMY_HASH = "$2a$10$C6UzMDM.H6dfI/f/IKcEeO7vvzVoQ4Tc4FuCGTqJchavPuGYY2qVu"; // "invalid-credentials"

        const user = await prisma.user.findUnique({ where: { email } });
        const passwordMatches = await bcrypt.compare(
          password,
          user?.passwordHash ?? DUMMY_HASH,
        );

        if (!user || !passwordMatches) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ] as Provider[],
});
