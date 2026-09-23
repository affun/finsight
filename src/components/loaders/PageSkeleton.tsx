/** Shared skeleton placeholder blocks styled with the existing design tokens. */
export function Skeleton({ w, h, r = 8, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        width: w ?? "100%",
        height: h ?? 16,
        borderRadius: r,
        background: "var(--secondary)",
        opacity: 0.8,
        animation: "finsight-pulse 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="responsive-padding">
      <div style={{ marginBottom: 24 }}>
        <Skeleton w={180} h={26} style={{ marginBottom: 8 }} />
        <Skeleton w={260} h={14} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards}, 1fr)`, gap: 14, marginBottom: 24 }} className="responsive-grid-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
            <Skeleton w={90} h={11} style={{ marginBottom: 10 }} />
            <Skeleton w={140} h={26} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="responsive-grid-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: "var(--card)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", height: 180 }}>
            <Skeleton w={120} h={14} style={{ marginBottom: 12 }} />
            <Skeleton h={30} style={{ marginBottom: 10 }} />
            <Skeleton w={160} h={12} />
          </div>
        ))}
      </div>
      <style>{`@keyframes finsight-pulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 0.85; } }`}</style>
    </div>
  );
}
