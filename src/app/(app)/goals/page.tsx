"use client";

import { useRouter } from "next/navigation";
import { Plus, Brain, Target, Calendar, TrendingUp } from "lucide-react";
import { goals } from "@/lib/data/mockData";

function daysUntil(dateStr: string) {
  const now = new Date("2026-09-20");
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function monthsUntil(dateStr: string) {
  const now = new Date("2026-09-20");
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

export default function GoalsPage() {
  const router = useRouter();
  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
              margin: "0 0 4px",
            }}
          >
            Goals
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: 0 }}>
            Track your financial milestones
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/ai-assistant")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              background: "var(--card)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--muted-foreground)",
            }}
          >
            <Brain size={14} color="#8B5CF6" /> Ask FinSight
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "white",
            }}
          >
            <Plus size={14} /> New Goal
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        <div style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Active Goals
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, color: "var(--primary)" }}>{goals.length}</div>
        </div>
        <div style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Total Saved
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: "var(--positive)" }}>
            ${totalSaved.toLocaleString()}
          </div>
        </div>
        <div style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Overall Progress
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>
            {((totalSaved / totalTarget) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Goal cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
        {goals.map((g) => {
          const pct = Math.min(100, (g.current / g.target) * 100);
          const months = monthsUntil(g.targetDate);
          const days = daysUntil(g.targetDate);
          const remaining = g.target - g.current;

          return (
            <div
              key={g.id}
              style={{
                background: "var(--card)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                overflow: "hidden",
              }}
            >
              {/* Color strip */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${g.color}, ${g.color}80)` }} />

              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 28 }}>{g.icon}</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                        <Calendar size={11} /> {g.targetDate} · {months > 0 ? `${months} months left` : `${days} days left`}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 16, fontWeight: 700, color: g.color }}>{pct.toFixed(0)}%</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>complete</div>
                  </div>
                </div>

                {/* Amounts */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                      ${g.current.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>saved so far</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--muted-foreground)", letterSpacing: "-0.02em" }}>
                      ${g.target.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>target</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: "var(--secondary)", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${g.color}, ${g.color}cc)`,
                      borderRadius: 4,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  <div style={{ background: "var(--secondary)", borderRadius: 9, padding: "10px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <TrendingUp size={12} color={g.color} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>Remaining</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                      ${remaining.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: "var(--secondary)", borderRadius: 9, padding: "10px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <Target size={12} color={g.color} />
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>Monthly needed</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                      ${g.monthlyContrib.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
