"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SessionUser } from "@/lib/session";

const UserContext = createContext<SessionUser | null>(null);

/**
 * Makes the authenticated user's basic identity available to client
 * components (sidebar profile, settings, greeting) without exposing
 * session tokens or any credentials.
 */
export function UserProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/** Returns the authenticated user, or `null` when not signed in. */
export function useUser(): SessionUser | null {
  return useContext(UserContext);
}
