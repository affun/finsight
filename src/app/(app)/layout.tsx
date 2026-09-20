import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
