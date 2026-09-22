import { cache } from "react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Returns the authenticated user's identity for server-side code, or `null`.
 *
 * The id always comes from the signed session token — never from client
 * input — so all future data queries can safely scope by this `id`
 * (user data isolation).
 *
 * `cache` deduplicates the session + database lookups within a single
 * server render pass.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  return user ?? null;
});
