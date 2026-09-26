import { redirect } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import { UserProvider } from "@/components/providers/UserProvider";
import { getSessionUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Middleware only checks for a session *token*; if the user row behind it
  // is gone (e.g. the database was re-seeded), heal the stale session here by
  // sending the visitor to login instead of rendering a ghost identity.
  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider user={user}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            width: "100%",
            minHeight: "100vh",
          }}
          className="lg:pl-[260px]"
        >
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
