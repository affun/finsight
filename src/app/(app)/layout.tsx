import Sidebar from "@/components/layout/Sidebar";
import { UserProvider } from "@/components/providers/UserProvider";
import { getSessionUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware guarantees an authenticated session here; the null branch is
  // a defensive fallback (e.g. a user row deleted while their JWT is alive).
  const user = await getSessionUser();

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
