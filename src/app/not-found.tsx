import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "var(--secondary)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        🔍
      </div>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "var(--muted-foreground)", fontSize: 14, margin: 0, maxWidth: 400 }}>
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "10px 20px",
          borderRadius: 10,
          background: "var(--primary)",
          color: "white",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
