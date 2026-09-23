import { Brain, Target, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

import { getGoals } from "@/lib/data/queries";
import { AddGoalButton, GoalCardActions } from "@/components/forms/GoalForm";

const GOAL_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6366F1"];
const GOAL_ICONS = ["🛡️", "✈️", "🚗", "📈", "🏠", "🎓"];

function daysUntil(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function monthsUntil(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
}

export default async function GoalsPage() {
  const goals = await getGoals();

  const totalSaved = goals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="responsive-padding">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
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
          <Link
            href="/ai-assistant"
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
              textDecoration: "none",
            }}
          >
            <Brain size={14} color="#8B5CF6" /> Ask FinSight
          </Link>
          <AddGoalButton />
        </div>
      </div>

      {goals.length === 0 ? (
        <div
          style={{
            padding: "60px 24px",
            background: "var(--card)",
            borderRadius: 14,
            border: "1px solid var(--border)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
            No goals yet
          </div>
          <div style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Create a goal to start tracking your savings milestones.
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }} className="responsive-grid-3">
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
                ₹{fmt(totalSaved)}
              </div>
            </div>
            <div style={{ background: "var(--card)", borderRadius: 12, padding: "18px 20px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                Overall Progress
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>
                {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>

          {/* Goal cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }} className="responsive-grid-2">
            {goals.map((g, idx) => {
              const color = GOAL_COLORS[idx % GOAL_COLORS.length];
              const icon = GOAL_ICONS[idx % GOAL_ICONS.length];
              const pct = g.progressPct;
              const remaining = Math.max(0, Number(g.targetAmount) - Number(g.currentAmount));
              const months = g.targetDate ? monthsUntil(g.targetDate) : 0;
              const days = g.targetDate ? daysUntil(g.targetDate) : 0;

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
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 28 }}>{icon}</span>
                        <div>
                          <div style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>{g.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                            <Calendar size={11} />{" "}
                            {g.targetDate
                              ? `${g.targetDate} · ${months > 0 ? `${months} months left` : `${days} days left`}`
                              : "No target date"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 16, fontWeight: 700, color }}>{pct.toFixed(0)}%</div>
                          <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>complete</div>
                        </div>
                        <GoalCardActions
                          goal={{
                            id: g.id,
                            name: g.name,
                            targetAmount: g.targetAmount,
                            currentAmount: g.currentAmount,
                            targetDate: g.targetDate,
                          }}
                        />
                      </div>
                    </div>

                    {/* Amounts */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                          ₹{fmt(Number(g.currentAmount))}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>saved so far</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--muted-foreground)", letterSpacing: "-0.02em" }}>
                          ₹{fmt(Number(g.targetAmount))}
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
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          borderRadius: 4,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                      <div style={{ background: "var(--secondary)", borderRadius: 9, padding: "10px 14px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                          <TrendingUp size={12} color={color} />
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>Remaining</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                          ₹{fmt(remaining)}
                        </div>
                      </div>
                      <div style={{ background: "var(--secondary)", borderRadius: 9, padding: "10px 14px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                          <Target size={12} color={color} />
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>Monthly needed</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono-data)", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                          {g.targetDate && months > 0 ? `₹${fmt(remaining / months)}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
